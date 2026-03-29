# PERSISTENCE.md — Data Layer Context for Claude Code

This file describes the persistence strategy for Flowmind. Read it alongside CLAUDE.md and ANALYTICS.md before making any changes to data, auth, or middleware.

---

## Overview

Persistence is handled by **Supabase** — a hosted Postgres platform with built-in auth, row-level security, and a thin JavaScript SDK. There is no server to maintain. The database is the canonical source of truth. Local (in-memory React) state is a copy only.

Supabase covers app data and auth only. Behavioural analytics — DAU/WAU/MAU, feature usage, funnels — are Mixpanel's responsibility and never touch this database. See `ANALYTICS.md`.

Do not introduce any other persistence mechanism. Do not use `localStorage`, `sessionStorage`, or any client-side storage.

---

## Package

Two packages are required:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- `@supabase/supabase-js` — core SDK for data and auth operations
- `@supabase/ssr` — Next.js App Router-aware session helpers

No other Supabase packages. No ORMs. No query builders.

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Vercel dashboard | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Vercel dashboard | Public API key (safe to expose) |

These are `NEXT_PUBLIC_` intentionally — they are designed to be browser-visible. Security is enforced by Row Level Security policies on the database, not by keeping keys secret.

Never commit `.env.local`.

---

## Supabase Client

Create a single browser client utility:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Import this wherever you need to read or write data. Do not instantiate the client inline in components — always import from this utility.

---

## Schema

Two tables covering user data only. Loops are handled in a separate sprint — see `LOOPS.md` when that file exists.

User data is vertically partitioned into profile (static) and activity (app logic cache). This keeps the frequently-written activity row separate from the rarely-changed profile row.

**Invariant:** `user_profiles` and `user_activity` rows must always be created together at signup, even if activity values are null/zero. Never create one without the other.

```sql
-- Static profile info — written once at signup, rarely updated
create table public.user_profiles (
  id uuid references auth.users(id) primary key,
  display_name text not null,
  email text,
  timezone text,
  acquisition_source text,              -- e.g. 'direct', 'referral', 'demo'
  onboarding_completed_at timestamptz,  -- one-time milestone, not a session metric
  created_at timestamptz default now()
);

-- App logic cache — updated each session, used for in-app behaviour only
-- Not a source of truth for analytics — that is Mixpanel's job
create table public.user_activity (
  id uuid references auth.users(id) primary key,
  session_count integer default 0,  -- used for in-app logic e.g. show tip on 5th session
  last_access timestamptz           -- used for 'last seen' in any future admin view
);
```

---

## Row Level Security

RLS is enabled on both tables. Users can only read and write their own data. This is enforced at the database level — not in application code.

```sql
-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.user_activity enable row level security;

-- user_profiles
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- user_activity
create policy "Users can read own activity"
  on public.user_activity for select
  using (auth.uid() = id);

create policy "Users can update own activity"
  on public.user_activity for update
  using (auth.uid() = id);
```

**Important:** If a query returns empty results unexpectedly, check RLS first. Tables with RLS enabled but no matching policy silently return nothing — they do not throw errors.

---

## Authentication

Auth is handled by Supabase with **Google OAuth**. No username/password. No magic links.

### Sign in

```typescript
const supabase = createClient()

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}
```

### OAuth callback route

After Google redirects back, this route exchanges the code for a session:

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        }
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/`)
}
```

### Sign out

```typescript
await supabase.auth.signOut()
```

---

## Sign-In Guard

The app has a single client-only auth state: is the user signed in or not? This is represented as a guard block at the top level — if no session exists, show the sign-in screen. If a session exists, render the app.

```typescript
// Example guard pattern in a client component
const [session, setSession] = useState(null)

useEffect(() => {
  const supabase = createClient()
  supabase.auth.getSession().then(({ data }) => setSession(data.session))

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => setSession(session)
  )
  return () => subscription.unsubscribe()
}, [])

if (!session) return <SignInScreen />
return <App />
```

Do not check auth state in individual components — handle it once at the top level.

---

## Middleware

The existing `proxy.ts` handles demo mode routing. The Supabase session refresher must be composed into the **same file** — Next.js only recognises one `proxy.ts` at the project root.

> **Note:** Next.js 16 replaced `middleware.ts` with `proxy.ts`. The exported function must be named `proxy` (or a default export). Do not use the old `middleware` name or filename.

Order matters:

```typescript
export async function proxy(request: NextRequest) {
  // 1. Demo mode — return early with canned response if matched
  if (process.env.DEMO_MODE === 'true') {
    for (const route of mockedRoutes) {
      if (route.pattern.test(request.nextUrl.pathname)) {
        return Response.json(route.response)
      }
    }
  }

  // 2. Supabase session refresh — must run on every non-demo request
  //    to keep JWTs fresh across server and client components
  const response = NextResponse.next()
  // ... supabase session refresh logic here
  return response
}
```

Do not create a second `proxy.ts`. Do not move proxy logic into the `app/` directory.

---

## Data Flow

The canonical pattern for reading and writing user data:

```typescript
const supabase = createClient()

// Read profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', session.user.id)
  .single()

// Update profile
const { error } = await supabase
  .from('user_profiles')
  .update({ display_name: 'New Name' })
  .eq('id', session.user.id)

// Mark onboarding complete
const { error } = await supabase
  .from('user_profiles')
  .update({ onboarding_completed_at: new Date().toISOString() })
  .eq('id', session.user.id)

// Update activity on each session start
const { error } = await supabase
  .from('user_activity')
  .update({
    last_access: new Date().toISOString(),
    session_count: supabase.rpc('increment', { row_id: session.user.id })
  })
  .eq('id', session.user.id)
```

Always handle errors. Never assume a write succeeded without checking `error`.

---

## What Not To Do

- Do not use `localStorage` or `sessionStorage` for any data — this app is stateless on the client
- Do not make Supabase calls from API routes — the SDK is used directly from client components
- Do not bypass RLS by using the service role key in client code — the anon key only
- Do not create a second `proxy.ts` — compose everything into the existing one
- Do not store auth tokens manually — Supabase SSR handles session cookies automatically
- Do not skip RLS policies on new tables — always enable RLS immediately after `create table`
- Do not create `user_profiles` without also creating `user_activity` in the same operation — they must stay in sync
- Do not implement loops persistence here — that belongs in `LOOPS.md` in a future sprint
- Do not use Supabase to store behavioural analytics or compute DAU/WAU/MAU — that is Mixpanel's job (see `ANALYTICS.md`)
- Do not add a `user_sessions` event log — Mixpanel's `session_started` event replaces it entirely
