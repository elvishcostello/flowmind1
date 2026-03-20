# PERSISTENCE.md — Data Layer Context for Claude Code

This file describes the persistence strategy for Flowmind. Read it alongside CLAUDE.md before making any changes to data, auth, or middleware.

---

## Overview

Persistence is handled by **Supabase** — a hosted Postgres platform with built-in auth, row-level security, and a thin JavaScript SDK. There is no server to maintain. The database is the canonical source of truth. Local (in-memory React) state is a copy only.

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

Two tables. Keep them simple.

```sql
-- Users table
-- Mirrors Supabase auth, plus any app-specific profile fields
create table public.users (
  id uuid references auth.users(id) primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- Loops table
create table public.loops (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb  -- for any structured but variable fields
);
```

The `metadata` JSONB column on `loops` is intentional — some loop fields are structured but variable. Scalar fields that are queried or sorted on should be promoted to real columns. Blobby or rarely-queried fields go in `metadata`.

---

## Row Level Security

RLS is enabled on both tables. Users can only read and write their own data. This is enforced at the database level — not in application code.

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.loops enable row level security;

-- Users can only access their own profile
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Users can only access their own loops
create policy "Users can read own loops"
  on public.loops for select
  using (auth.uid() = user_id);

create policy "Users can insert own loops"
  on public.loops for insert
  with check (auth.uid() = user_id);

create policy "Users can update own loops"
  on public.loops for update
  using (auth.uid() = user_id);

create policy "Users can delete own loops"
  on public.loops for delete
  using (auth.uid() = user_id);
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

The existing `middleware.ts` handles demo mode routing. The Supabase session refresher must be composed into the **same file** — Next.js only recognises one `middleware.ts` at the project root.

Order matters:

```typescript
export async function middleware(request: NextRequest) {
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

Do not create a second `middleware.ts`. Do not move middleware into the `app/` directory.

---

## Data Flow

The canonical pattern for reading and writing data:

```typescript
const supabase = createClient()

// Read
const { data, error } = await supabase
  .from('loops')
  .select('*')
  .order('created_at', { ascending: false })

// Write
const { error } = await supabase
  .from('loops')
  .insert({ title: 'New loop', user_id: session.user.id })

// Update
const { error } = await supabase
  .from('loops')
  .update({ title: 'Updated title' })
  .eq('id', loopId)

// Delete
const { error } = await supabase
  .from('loops')
  .delete()
  .eq('id', loopId)
```

Always handle errors. Never assume a write succeeded without checking `error`.

---

## What Not To Do

- Do not use `localStorage` or `sessionStorage` for any data — this app is stateless on the client
- Do not make Supabase calls from API routes — the SDK is used directly from client components
- Do not bypass RLS by using the service role key in client code — the anon key only
- Do not create a second `middleware.ts` — compose everything into the existing one
- Do not store auth tokens manually — Supabase SSR handles session cookies automatically
- Do not skip RLS policies on new tables — always enable RLS immediately after `create table`
