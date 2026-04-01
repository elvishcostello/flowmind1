**Flow:** Onboarding, step 0. Stack root — no back button (header suppressed, see CLAUDE.md Navigation).

**Route:** `/` (rendered conditionally inside `app/page.tsx`)

## Invocation
None

## Content
1. "Welcome to Flowmind" heading
2. "You're one of the first people here." subtitle
3. "Sign in with Google" button (full-width)

## Implementation
Implement Google OAuth sign-in:
1. Create `lib/supabase/client.ts` — browser client utility (see PERSISTENCE.md)
2. Create `app/auth/callback/route.ts` — OAuth callback route (see PERSISTENCE.md)
3. Create `app/components/SignInScreen.tsx` — sign-in screen with welcome text and "Sign in with Google" button
4. In `app/page.tsx`: if no session → `<SignInScreen />`, if session → `router.replace("/your-loops")`
5. In `proxy.ts`: add Supabase session refresh alongside demo mode logic (see PERSISTENCE.md)
