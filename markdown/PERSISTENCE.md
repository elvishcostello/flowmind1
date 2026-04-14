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

Two tables covering user data only. See `LOOPS.md` for the loops feature schema and RLS policies.

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
  star_count integer not null default 0,  -- count of completed loops (stars earned)
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

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- user_activity
create policy "Users can read own activity"
  on public.user_activity for select
  using (auth.uid() = id);

create policy "Users can insert own activity"
  on public.user_activity for insert
  with check (auth.uid() = id);

create policy "Users can update own activity"
  on public.user_activity for update
  using (auth.uid() = id);
```

**Important:** If a query returns empty results unexpectedly, check RLS first. Tables with RLS enabled but no matching policy silently return nothing — they do not throw errors. Insert policies are required in addition to update policies — a missing insert policy will silently prevent row creation without throwing an error.

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

## First Login — Row Creation

On the first login, two rows must be created in the same operation: one in `user_profiles` and one in `user_activity`. This happens in the OAuth callback route (`app/auth/callback/route.ts`), immediately after `exchangeCodeForSession` succeeds.

**Use upsert, not insert.** Google OAuth can re-enter this callback on subsequent logins. Upsert with `onConflict: 'id'` and `ignoreDuplicates: true` makes the operation safe and idempotent — existing rows are left untouched.

**Source of display_name:** Pull from `session.user.user_metadata.full_name`. Fall back to `session.user.email` if `full_name` is absent or empty.

```typescript
const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

if (session) {
  const displayName =
    session.user.user_metadata?.full_name ||
    session.user.email ||
    'Flowmind User'

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: session.user.id,
        display_name: displayName,
        email: session.user.email,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  if (profileError) console.error('user_profiles upsert failed:', profileError)

  const { error: activityError } = await supabase
    .from('user_activity')
    .upsert(
      { id: session.user.id },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  if (activityError) console.error('user_activity upsert failed:', activityError)
}
```

Both upserts must complete before the redirect. Always check and log errors — never assume a write succeeded.

---

## Session Activity Update

On each confirmed login, update `user_activity` to reflect the new session. This happens in the top-level auth guard component — the one that calls `supabase.auth.getSession()` — inside a `useEffect` that fires when a non-null session is first confirmed.

Two operations run together:

1. **Increment session_count** — via the `increment` Postgres function (already created in Supabase)
2. **Update last_access** — to the current timestamp

```typescript
useEffect(() => {
  if (!session) return

  const supabase = createClient()

  supabase
    .rpc('increment', { row_id: session.user.id })
    .then(({ error }) => {
      if (error) console.error('increment session_count failed:', error)
    })

  supabase
    .from('user_activity')
    .update({ last_access: new Date().toISOString() })
    .eq('id', session.user.id)
    .then(({ error }) => {
      if (error) console.error('last_access update failed:', error)
    })
}, [session?.user.id])
```

Use `session?.user.id` as the dependency — not the full session object — so the effect fires once per login, not on every re-render.

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

// Increment session count (via Postgres function)
const { error } = await supabase
  .rpc('increment', { row_id: session.user.id })

// Update last_access
const { error } = await supabase
  .from('user_activity')
  .update({ last_access: new Date().toISOString() })
  .eq('id', session.user.id)
```

Always handle errors. Never assume a write succeeded without checking `error`.

---

## Time Data

All timestamps are stored as `timestamptz` (timestamp with time zone), which provides UTC-based storage with sub-second precision. This is more granular than the app currently needs but costs nothing and preserves options.

### Querying by date

To fetch all rows matching a specific calendar date:

```typescript
const date = '2026-04-12'
supabase
  .from('loops')
  .select('*')
  .gte('created_at', `${date}T00:00:00Z`)
  .lt('created_at', `${date}T24:00:00Z`)
```

### Querying by day of week

To fetch all rows matching a given day of the week (0 = Sunday, 6 = Saturday):

```typescript
supabase
  .from('loops')
  .select('*')
  .filter('EXTRACT(DOW FROM created_at)', 'eq', 1) // all Mondays
```

### Timezone note

`timestamptz` values are stored in UTC. A loop created at 11pm EST on Monday is stored as Tuesday UTC. For alpha/beta with a single-timezone user base this is not an issue. If multi-timezone support is needed later, store the user's timezone in `user_profiles.timezone` and apply it at query time:

```typescript
.filter("EXTRACT(DOW FROM created_at AT TIME ZONE 'America/New_York')", 'eq', 1)
```

---

## Migrations

```sql
-- Add star_count column to user_activity (non-nullable integer, default 0)
alter table public.user_activity add column star_count integer not null default 0;
```

---

## What Not To Do

- Do not use `localStorage` or `sessionStorage` for any data — this app is stateless on the client
- Do not make Supabase calls from API routes — the SDK is used directly from client components
- Do not bypass RLS by using the service role key in client code — the anon key only
- Do not create a second `proxy.ts` — compose everything into the existing one
- Do not store auth tokens manually — Supabase SSR handles session cookies automatically
- Do not skip RLS policies on new tables — always enable RLS immediately after `create table`, and always add insert policies alongside select/update policies
- Do not use insert without upsert in the auth callback — the callback can be re-entered on subsequent logins
- Do not create `user_profiles` without also creating `user_activity` in the same operation — they must stay in sync
- Do not add feature-specific table schemas here — they belong in their own files (e.g. `LOOPS.md`)
- Do not use Supabase to store behavioural analytics or compute DAU/WAU/MAU — that is Mixpanel's job (see `ANALYTICS.md`)
- Do not add a `user_sessions` event log — Mixpanel's `session_started` event replaces it entirely
