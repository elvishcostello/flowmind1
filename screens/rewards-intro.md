Create a Next.js client component at `app/rewards-intro/page.tsx` for route `/rewards-intro`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/signin`. Return `null` while unauthenticated.

# Layout

Use the standard mobile-first page wrapper (see CLAUDE.md):
```tsx
<div className="flex flex-1 justify-center">
  <div className="w-full max-w-sm flex flex-col flex-1">
    {/* page content */}
  </div>
</div>
```

## Navigation

Onboarding flow, step 3. Shows `← Back` (navigates to `/signin/cleaning-intro`) per nav pattern in CLAUDE.md.

## Invocation

None. No params.

## Content

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - Closing loops earns you stars.
   - Spend them on whatever feels good to you.

2. A Card containing:
   - A table with three rows:
     | star | 1  | a piece of chocolate |
     | star | 5  | Coffee Break |
     | star | 10 | Episode of a Show |
   - A horizontal separator
   - A text widget that says `+ add your own`

3. A full-width Continue `Button`.

## Button Semantics

| element | action |
|---|---|
| Continue button | Navigates to `/your-loops` |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
