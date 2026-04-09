Create a Next.js client component at `app/how-long/page.tsx` for route `/how-long`.

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

Loops flow, step 3. Shows `← Back` (navigates to `/inner-loop`) per nav pattern in CLAUDE.md.

## Invocation

Params: see `HowLongParams` in `lib/types.ts`.

## Content

A label at the top: "How long has this been on your mind?"

Then a vertical set of buttons. Read the yaml/HOWLONG.yaml file for a list of values. The button labels should be these values, in the order given.

## Button Semantics

Tapping a button navigates to `/how-often`, passing all current params plus the selected value:

- `?category=<string>` — passed through
- `?sub-category=<string>` — passed through
- `?how-long=<string>` — the selected button label (URL-encoded)

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
