Create a Next.js client component at `app/signin/cleaning-intro/page.tsx` for route `/signin/cleaning-intro`.

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

Onboarding flow, step 2. Shows `← Back` (navigates to `/signin/feeling`) per nav pattern in CLAUDE.md.

## Invocation

None. No params.

## Content

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - "You're testing the cleaning module."
   - "Flowmind is going to be more than just cleaning. But you're helping us understand what closing a loop actually feels like."

2. A vertical list of three icon + label rows in `space-y-4`, each `text-sm text-muted-foreground` with icon `h-5 w-5 shrink-0`:
   - `CirclePlus` — "Add what's on your mind"
   - `Check` — "Check off each task"
   - `Star` — "Watch your loops close"

3. A full-width Continue `Button`.

## Button Semantics

| element | action |
|---|---|
| Continue button | Navigates to `/rewards-intro` |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
