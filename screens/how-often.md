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
1
## Content

A label at the top: "How often does this need doing?"

Read the yaml/HOWOFTEN.yaml file for a list of dictionaries. The labels should be the key values, in the order given.
The value of the 'action' key for each top-level key, should be attached to the given button.

The buttons should be minimal width for the label, and then laid our left to right on multiple lines.

Below this button group should be a single button labeled 'skip'. This should be styled as a URL, with no border, so it is a low cognitive affordance. Behavior of the button is TBD.

Below the buttons should be DIV with name 'day-chooser'.

Within the div should be a vertical stack of:
- horizontal rule
- a group of buttons (minimal width, left to right, wrapping) with these values:
  + Mon
  + Tues
  + Wed
  + Thu
  + Fri
  + Sat
  + Sun

The buttons will be in two modes, single-select and multi-select. For now implement them as multi-select, with no target.
