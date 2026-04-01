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

This page is invoked with two query parameters:

- `?category=<string>` — the category selected on `/outer-loop` (e.g. `Kitchen`)
- `?sub-category=<string>` — a JSON-encoded array of one or more sub-category names selected on `/inner-loop` (e.g. `["Wash the dishes","Empty the trash"]`)

When the page loads, decode both into local variables `category` (string) and `subCategories` (string[]):

```ts
const category = searchParams.get("category") ?? "";
const subCategories: string[] = JSON.parse(
  decodeURIComponent(searchParams.get("sub-category") ?? "[]")
);
```

## Content

A label at the top: "How long has this been on your mind?"

Then a vertical set of buttons, for now leave the buttons inactive.

Read the yaml/HOWLONG.yaml file for a list of values.

The button labels should be these values, in the order given.

