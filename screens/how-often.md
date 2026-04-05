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

Params: see `HowOftenParams` in `lib/types.ts`.
## Content

A label at the top: "How often does this need doing?"

Read the yaml/HOWOFTEN.yaml file for a list of dictionaries. The labels should be the key values, in the order given.
The value of the 'action' key for each top-level key, should be attached to the given button.

The buttons should be minimal width for the label, and then laid our left to right on multiple lines. This button group should be called internally 'how-often-group'.

Below this button group should be a single button labeled 'skip'. This should be styled as a URL, with no border, so it is a low cognitive affordance.

Below the buttons should be a DIV with name 'day-chooser'. It is hidden by default.

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

The day buttons support two modes, controlled by the action that triggered the day-chooser:
- `day-chooser-single` → single-select (only one day can be active at a time)
- `day-chooser-multi` → multi-select (any number of days can be toggled)

Below the day-chooser should be a button with the label 'Add This Loop'. This button is hidden by default.

## Button Semantics

Inspect the `action` property attached to the selected how-often button.

| action | behaviour |
|---|---|
| `advance` | Navigate immediately to `/your-loops?refresh=true` |
| `enable` | Show and enable the `Add This Loop` button |
| `day-chooser-single` | Show the day-chooser in single-select mode |
| `day-chooser-multi` | Show the day-chooser in multi-select mode |

When the day-chooser is visible: `Add This Loop` is shown but disabled until at least one day is selected. Once a day is selected, enable it.

When `Add This Loop` is tapped, navigate to `/your-loops?refresh=true`.

When 'skip' is tapped, navigate to `/your-loops?refresh=true`.
