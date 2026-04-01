Read CLAUDE.md and PERSISTENCE.md before starting.

Implement Google OAuth sign-in. Specifically:

1. Create `lib/supabase/client.ts` — the Supabase browser client utility as described in PERSISTENCE.md

2. Create `app/auth/callback/route.ts` — the OAuth callback route as described in PERSISTENCE.md

3. Create a `SignInScreen` component at `app/components/SignInScreen.tsx` — a mobile-first sign-in screen matching the app's existing visual style, with a single "Sign in with Google" button. Follow the mobile-first layout pattern in CLAUDE.md.

4. Wrap the root layout in `app/page.tsx` with the session guard described in PERSISTENCE.md — if no session exists show `SignInScreen`, if a session exists show the existing app content.

5. Update `middleware.ts` to add Supabase session refresh alongside the existing demo mode logic. The demo mode logic must remain intact and run first. Follow the composition pattern in PERSISTENCE.md.

Do not implement any other features. Do not modify any other files.