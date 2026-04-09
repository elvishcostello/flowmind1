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

Loops flow, step 2. Shows `← Back` (navigates to `/outer-loop`) per nav pattern in CLAUDE.md.

## Invocation

Params: see `InnerLoopParams` in `lib/types.ts`.

## Content

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. A label with the name of the category in all caps.
2. A text label that says `What needs doing?`
3. A 2-column grid of Cards — all tasks for this category, sourced from `yaml/CLEANING.yaml` using the category as key.

Cards support multi-select. Each card shows:
- the lucide icon for the task (centered)
- the task name below it

Selected cards use `bg-primary text-primary-foreground` styling.

At the bottom, a button whose label updates based on selection state:
- 0 selected → `Add Tasks` (disabled)
- 1 selected → `Add 1 Task` (enabled)
- 2+ selected → `Add N Tasks` (enabled)

Task data is sourced from `lib/config.ts` (`getCleaningData()`), read server-side and passed as props to the client component. Icons are resolved at runtime via `ICON_MAP` in the client component.

## Button Semantics

| element | action |
|---|---|
| Task card | Toggle selected state (multi-select) |
| Add Tasks button | Navigates to `/how-long`, passing `?category=<string>` and `?tasks=<JSON-encoded string[]>` |

The Add Tasks button is disabled when 0 cards are selected.

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
