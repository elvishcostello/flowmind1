# Loop Closed

This screen is displayed whenever a user closes a loop.

---

**Flow:** Invoked from `your-loops` or `update-tasks` when a loop is marked complete.

**Route:** `/loop-closed`

## Invocation

Params: see `LoopClosedParams` in `lib/types.ts`.

- `id` — the loop PK

`user_id` is not passed — use `userProfile` from context.

On load:
- Query the `loops` table for the row matching `id`
- Capture `created_at` and `updated_at`; if `updated_at` is null default to now; if `created_at` is null default to 10 days ago
- Compute `taskCount` from `tasks.length`

## Navigation

Global header is suppressed on this route (added to `SUPPRESS_HEADER` in `components/conditional-header.tsx`). A custom `← Back to My Loops` button is rendered inline.

On exit (back button tapped), clear the history stack and navigate to `/your-loops` via `router.replace('/your-loops')`. Callers (`your-loops`, `update-tasks`) are responsible for saving loop state before navigating here.

## Content

A vertical group, top to bottom:

1. A centered `Circle` icon at 2× size (`h-16 w-16`)
2. A centered heading: `{displayName}, loop closed.` — display name in lower case
3. A centered empathy label:
   - Compute difference between `updated_at` and `created_at` in days
   - ≤ 1 day → `"You didn't let it sit long. That matters."`
   - \> 1 day → `"You got it done."`
4. A centered label: `+N stars` where N = `taskCount`
5. A horizontal rule
6. A label: `"How do you feel compared to before?"`
7. A single-select button group (centered, left to right). Each button shows an icon above a label. Tapping sets `mood` in local state; tapping the active button deselects it.

| Label | Icon |
|---|---|
| All good | `Sun` |
| A little tense | `CloudSun` |
| Pretty stressed | `Cloud` |
| Overwhelmed | `CloudRain` |
| Crashed Out | `CloudLightning` |

No button selected by default.

8. A full-width `← Back to My Loops` button

## Button Semantics

| element | action |
|---|---|
| Mood buttons | Set `mood` in local state (single-select, tapping active deselects) |
| Back to My Loops | Increment `star_count`, write `mood` to loop row, then `router.replace('/your-loops')` |

## Data Requirements

On exit, perform two writes:

1. **Increment `star_count`** on the user's `user_activity` row by `taskCount`
2. **Update `mood`** on the loop row to the selected mood value (or `null` if none selected)

Both writes fire on exit regardless of mood selection.

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
