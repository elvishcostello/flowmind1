Create a Next.js client component at `app/signin/page.tsx` for route `/signin`.

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. A serif `text-2xl` paragraph with `leading-relaxed`:
   > Welcome to Flowmind.
   >
   > You're one of the first people here.

2. A labeled text input:
   - Label text: "What's your name?" in `text-sm text-muted-foreground`
   - Input is borderless except for a bottom border (`border-b border-border`), transparent background, no outline, `text-base`
   - Placeholder: "Your name"
   - `autoFocus`
   - Controlled via local `useState`
   - Pressing Enter triggers the same action as the Continue button

3. A full-width Continue `Button` (shadcn/ui), disabled when the input is empty or whitespace-only.

On continue: trim the name, call `setUserProfile({ username: name })` from `useUserProfile` context, then navigate to `/signin/feeling`.
