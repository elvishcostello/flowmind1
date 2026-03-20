Create a Next.js client component at `app/signin/cleaning-intro/page.tsx` for route `/signin/cleaning-intro`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/signin`. Return `null` while unauthenticated.

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - "You're testing the cleaning module."
   - "Flowmind is going to be more than just cleaning. But you're helping us understand what closing a loop actually feels like."

2. A vertical list of three icon + label rows in `space-y-4`, each `text-sm text-muted-foreground` with icon `h-5 w-5 shrink-0`:
   - `CirclePlus` — "Add what's on your mind"
   - `Check` — "Check off each task"
   - `Star` — "Watch your loops close"

3. A full-width Continue `Button` that navigates to `/rewards-intro`.
