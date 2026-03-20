Create a Next.js client component for the route `/rewards-intro`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/signin`. Return `null` while unauthenticated.

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - Closing loops earns you stars.
   - Spend them on whatever feels good to you.

2. A Card
   - within the card a table with three rows
     | star | 1  | a piece of chocolate |
     | star | 5  | Coffee Break |
     | star | 10 | Episode of a Show |
    - then a horizontal separator
    - text widget that says '+ add your own'

3. A full-width Continue `Button` that navigates to `/your-loops`.
