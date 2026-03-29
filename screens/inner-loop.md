Create a Next.js client component at `app/inner-loop/page.tsx` for route `/inner-loop`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/`. Return `null` while unauthenticated.

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

This screen is part of the signed-in app. The global `BreadcrumbNav` header is shown (not suppressed).

`BreadcrumbNav` renders the full trail: **Home › Add a Loop › Inner Loop**. The back arrow navigates to `/outer-loop`. This is controlled by `APP_ROUTE_ANCESTORS` in `components/breadcrumb-nav.tsx`.

Do not use `router.back()` for navigation here — the breadcrumb component handles it via `router.push(parent)`.

## Invocation

This page will normally be invoked with a query parameter: `?category=...`.

When the page loads, decode the query into a local variable called `category`.

## Layout

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. A label with the name of the category all caps.
2. A text label that says `What needs doing?`
3. A 2-column grid of Cards

  All of the cards for this category can be found in CLEANING.md with the category as the key, and the sub categories as secondary dictionary.

  It must be possible to select one or more cards (multi-select)

  For each sub-category, display in a vertical stack

  - the lucide icon for the sub category (centered)
  - the sub category name below it.

  At the bottom of the vertical stack, a button that says 'Add Tasks'.

  If 0 cards are selected its label should say 'Add Tasks'.
  If 1 cards is selected, it should say 'Add 1 Task'
  If 2 or more are selected, it should say 'Add N tasks` where N is the number selected.

  There should be no action for this button right now.

  Tapping a card toggles its selected state (multi-select). Selected cards use `bg-primary text-primary-foreground` styling.

  The task data is defined as a static `CLEANING_DATA` object in the page component, mirroring `CLEANING.yaml`. Icons are resolved at runtime via `ICON_MAP`.

  The "Add Tasks" button is disabled when 0 cards are selected. It has no action yet.


