# Update Tasks

**Flow:** Loop management
**Route:** `/update-tasks`

## Invocation

`?id=<string>` — see `UpdateTasksParams` in `lib/types.ts`.

On mount, query the `loops` table for the row matching `id` and `user_id`. If the row is not found, redirect to `/your-loops`. Populate local state: `tasks`, `taskState`, `howOften` (defaulting to the first `HOWOFTEN.yaml` key if `how_often` is null), and `days`.

## Content

### Top bar

A horizontal bar (`px-4 py-3`) containing:
1. `← Back` button (ghost, calls `handleBack` — see Button Semantics)
2. Horizontal spacer
3. `<StarCountBadge>` component

Followed by a horizontal rule.

### Heading

`{loop.category} Tasks` in `text-xl font-semibold`.

### Mode button

A button that toggles between two modes:
- **primary mode:** outline variant, `Pencil` icon + "Edit steps"
- **edit mode:** default (filled) variant, "Done Editing"

Tapping in primary mode switches to edit mode immediately. Tapping in edit mode saves the loop to Supabase (`tasks`, `task_state`, `how_often`, `days`), then switches back to primary mode.

### Frequency row

A horizontal group (`flex items-center gap-2`) showing:
- Bold text label: the display value for `howOften`. If the selected option has action `day-chooser-single` or `day-chooser-multi` and days are selected, the label shows the days joined with spaces instead of the raw `howOften` value.
- A ghost `sm` button labelled "Change" (or "Cancel" while the picker is visible).

Tapping Change/Cancel toggles `isChangingFrequency`. While `isChangingFrequency` is true, `<HowOftenPicker>` is rendered below the row (see `screens/components/how-often-picker.md`). The picker's `onChange` callback updates `howOften` and `days` in local state and hides the picker. No `onAdvance` is used. All changes are local until the back button or Done Editing is tapped.

### Task list

Wrapped in `DndContext` + `SortableContext` (`verticalListSortingStrategy`). Each row is a `SortableTaskRow` keyed by task name.

**Primary mode** — each row shows:
- Leading icon: `CircleCheckBig` (done) or `Circle` (not done)
- Task label, struck through and muted when done
- Tapping the row toggles completion state

**Edit mode** — each row shows:
- Leading `GripVertical` drag handle (`touch-none`, drag-and-drop enabled via `@dnd-kit`)
- Task label
- Trailing `X` button — tapping deletes the task and its `task_state` entry (propagation stopped so it does not also toggle)

Dragging reorders both `tasks` and `taskState` arrays in memory using `arrayMove`.

### Add a task

When `isAddingTask` is false, a full-width ghost button with a `Plus` icon and label "Add a task" is shown below the task list. Tapping sets `isAddingTask` to true, hiding this button and revealing the add-task group.

**Add-task group** (visible when `isAddingTask` is true):
1. A 2-column grid of `Card` components — one per task in `CLEANING.yaml` for the current category that is not already in `tasks`. Each card shows the task's Lucide icon and label. Tapping a card appends the task (with `false` state) to local arrays and removes it from the available list.
2. A text input with placeholder "Or type your own task...". When the input has non-whitespace content, an "Add" button appears to its right. Pressing Enter or tapping Add appends the trimmed text as a new task (with `false` state) and clears the input.
3. A full-width outline "Done" button that sets `isAddingTask` back to false.

All add-task changes are local until the back button or Done Editing is tapped.

## Button Semantics

| element | action |
|---|---|
| ← Back | save loop (`tasks`, `task_state`, `how_often`, `days`) to Supabase, then `router.back()` |
| task row (primary mode) | toggle completion; if all tasks become `true`, write `completed = true` to Supabase (plus current `tasks`, `task_state`, `how_often`, `days`); if `how_often` is not `"one time"`, insert a fresh copy of the loop with all tasks reset to `false`; then `router.replace("/loop-closed?id=<loopId>")` |
| Done Editing | save loop to Supabase, switch to primary mode |

## Data Requirements

Reads: `loops` table — fields `id`, `category`, `tasks`, `task_state`, `how_often`, `how_long`, `days`, filtered by `id` and `user_id`.

Writes: `loops` table — updates `tasks`, `task_state`, `how_often`, `days` on back or Done Editing; additionally sets `completed = true` when all tasks are checked; inserts a new loop row for repeating loops upon completion.

Server component (`page.tsx`) pre-fetches `howOftenOptions` via `getHowOftenOptions()` and `cleaningData` via `getCleaningData()` from `lib/config.ts`, passing them as props to the client component.

## Analytics

None implemented.
