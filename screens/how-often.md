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

Render `<HowOftenPicker>` (see `screens/components/how-often-picker.md`). Options are sourced from `lib/config.ts` via the server component.

Below the picker, a `skip` button styled as a link (no border, `text-muted-foreground`) — creating a loop with `how_often` and `days` both null.

## Button Semantics

See `screens/components/how-often-picker.md` for picker action semantics.

**onAdvance / onChange:** persist the loop to Supabase, then call `router.refresh()` and `router.replace('/your-loops')`.

**Skip:** When `skip` is tapped, create a new loop with `how_often` and `days` both null, then navigate away (see Data Requirements).

## Data Requirements

Create a new loop in the Supabase `loops` table. For all cases, store:
- `category`
- `tasks`
- `how_long`
- `created_at`, `updated_at` — set to current time if not automatic
- `completed` — `false`

**Add This Loop:** additionally set `how_often` to the selected button label, and `days[]` to the selected days (if any).

**Skip:** leave `how_often` and `days` as null.

After saving, call `router.refresh()` followed by `router.replace('/your-loops')`. `router.refresh()` invalidates the Next.js router cache so the loops list reloads fresh data on mount; `router.replace()` makes `/your-loops` the new history root.

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
