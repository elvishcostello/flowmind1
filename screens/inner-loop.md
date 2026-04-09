**Flow:** Loops flow, step 2.

**Route:** `/inner-loop`

## Invocation

Params: see `InnerLoopParams` in `lib/types.ts`.

## Content

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. A label with the name of the category in all caps.
2. A text label that says `What needs doing?`
3. A 2-column grid of Cards — all tasks for this category, sourced from `yaml/CLEANING.yaml` using the category as key.
4. There should be one pseudo card at the end with the label 'Other' and a pencil icon.

Cards support multi-select. Each card shows:
- the lucide icon for the task (centered)
- the task name below it

There is one pseudo-card at the end of the grid with the label `Other` and a `Pencil` icon.

Selected cards use `bg-primary text-primary-foreground` styling.

### 'Other' semantics

When Other is tapped, the Other card is removed from the grid (the remaining cards reflow) and an inline group appears below the card grid:

```
[ What needs doing?... ]  [ Save ]  [ X ]
```

- The text field has placeholder `What needs doing?`
- `Save` is disabled until the field contains non-empty text
- Tapping `Save` adds the typed task to the selected set (counted toward Add N Tasks), clears the field, and hides the group
- Tapping `X` discards any typed text and hides the group; the Other card does **not** reappear

Custom tasks behave like selected cards — they count toward the `Add N Tasks` total. Cards and custom tasks can be combined freely (e.g. 2 cards + 1 custom task → "Add 3 Tasks").

At the bottom, a button whose label updates based on total selection count (cards + saved custom tasks):
- 0 selected → `Add Tasks` (disabled)
- 1 selected → `Add 1 Task` (enabled)
- 2+ selected → `Add N Tasks` (enabled)

Task data is sourced from `lib/config.ts` (`getCleaningData()`), read server-side and passed as props to the client component. Icons are resolved at runtime via `ICON_MAP` in the client component.

## Button Semantics

| element | action |
|---|---|
| Task card | Toggle selected state (multi-select) |
| Other card | Remove Other card from grid, reveal inline custom-task group below grid |
| Save (in group) | Add typed text to selected tasks, clear field; disabled when field is empty |
| X (in group) | Discard typed text and hide the group |
| Add Tasks button | Navigates to `/how-long`, passing `?category=<string>` and `?tasks=<JSON-encoded string[]>` |

The Add Tasks button is disabled when 0 tasks are selected.

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
