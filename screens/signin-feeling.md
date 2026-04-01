**Flow:** Onboarding, step 1. Shows `← Back` per nav pattern in CLAUDE.md.

Create a Next.js client component at `app/signin/feeling/page.tsx` for route `/signin/feeling`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/signin`. Return `null` while unauthenticated.

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Four short paragraphs in `text-base leading-relaxed space-y-5`:
   - "You know that feeling when something is on your mind — not urgent, not forgotten, just sitting there, taking up space?"
   - "It could be a conversation you need to have. A project you haven't started. A decision you keep putting off."
   - "Your brain keeps returning to it, checking to see if it's been handled yet. It hasn't. So it checks again."
   - "That loop has a name."

2. A small inline callout in `text-sm text-muted-foreground` with a `Repeat2` icon (Lucide, `h-5 w-5 shrink-0`) and the text "that's an open loop".

3. A full-width Continue `Button` that navigates to `/signin/cleaning-intro`.
