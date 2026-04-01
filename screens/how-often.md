Create a Next.js client component at `app/how-often/page.tsx` for route `/how-often`.

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

Loops flow, step 4. Shows `← Back` (navigates to `/how-long`) per nav pattern in CLAUDE.md.

## Invocation

This page is invoked with two query parameters:

- `?category=<string>` — the category selected on `/outer-loop` (e.g. `Kitchen`)
- `?sub-category=<string>` — a JSON-encoded array of one or more sub-category names selected on `/inner-loop` (e.g. `["Wash the dishes","Empty the trash"]`)
- `?how-long=<string>` — the duration selected on `/how-long` (e.g. `a few days`)

When the page loads, decode into local variables:

```ts
const category = searchParams.get("category") ?? "";
const subCategories: string[] = JSON.parse(
  decodeURIComponent(searchParams.get("sub-category") ?? "[]")
);
const howLong = searchParams.get("how-long") ?? "";
```

## Content

A label at the top: "How often does this need doing?"

Then a vertical set of buttons, for now leave the buttons inactive.

Read the yaml/HOWOFTEN.yaml file for a list of values.

The button labels should be these values, in the order given.

