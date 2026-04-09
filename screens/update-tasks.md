# Update Tasks

This screen allows the user to update the tasks associated with a given loop.

---

Create a Next.js client component at `app/update-tasks/page.tsx` for route `/update-tasks`.

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

This tasks is called from the `your-loops` screen, it forms a new workflow with your-loops being the base state. 
Shows `← Back` — commits `task_state` to Supabase, then calls `router.back()` to return to the caller.

## Invocation

This screen will be invoked with a `uuid` parameter. This parameter is the PK for the loops table.

On load, query the loops table to bring this row into memory.

Additionally, query the loops table for the total number of loops completed by this user.

## Content

The screen can be in one of two modes:
- primary - what is shown when we are not in edit mode
- edit - when the user is editing the task list

### Top bar

We are following the pattern established in your-loops, but simpler:

- A horizontal div with:
  + back button
  + A horizontal spacer
  + A rounded button with a lucide `Star` icon and a numeric counter (count of completed loops)
- A horizontal rule

### Heading

The heading is shown, it is the value of `category` + ' Tasks'

Below that is a mode button, it has two possible labels, based on the current mode:
- primary: pencil + Edit steps
- edit: Done Editing

Below that is a horizontal group with two controls:
- a small bordered button displaying the value for 'how_often'
- a small inline button with the label 'Change' (refer to this button as change-save)

If `how_often` is null (loop was saved via skip), default it to the first key in `HOWOFTEN.yaml` (currently `"one time"`).

#### Change semantics

When the Change button is tapped, enter `change-mode`:
- Load `HOWOFTEN.yaml` as a dictionary
- Change the label of the change-save button to `Save`
- Display a wrapping left-to-right group of buttons, one per dictionary key

Each button has its `action` value bound to it. When a button is tapped:
- Set `how_often` in local state to the selected key's label
- Update the `how_often` display button to reflect the new value
- Follow the same action logic as `how-often.md` ## Button Semantics:

| action | behaviour |
|---|---|
| `advance` | Save `how_often` locally and exit change-mode |
| `enable` | Save `how_often` locally and exit change-mode (no day-chooser needed) |
| `day-chooser-single` | Show the day-chooser in single-select mode (see below) |
| `day-chooser-multi` | Show the day-chooser in multi-select mode (see below) |

The day-chooser group is identical to the one in `how-often.md`: a horizontal rule followed by a wrapping group of day buttons (Mon–Sun). Mode is controlled by the triggering action. `Save` is shown but disabled until at least one day is selected; once selected, tapping Save commits `how_often` and `days` to local state and exits change-mode.

All changes are local — nothing is written to Supabase until the back button is tapped.

### primary mode

A vertical stack of task buttons. The leading icon reflects task completion state:
- Complete (TRUE): `circle-check-big`
- Incomplete (FALSE): `circle`

Tapping a button toggles the completion state.

### edit mode

The mode button is highlighted to make the CTA clearer.

The leading icon on each row is replaced with `grip-vertical` (drag handle). Task rows are drag-and-drop sortable using `@dnd-kit/core` and `@dnd-kit/sortable`. Dragging a row reorders both `tasks` and `task_state` in memory — the new order is committed to Supabase when the back button is tapped.

Use `DndContext` + `SortableContext` (with `verticalListSortingStrategy`) to wrap the task list. Each row is a `useSortable` item keyed by task name. On `onDragEnd`, apply `arrayMove` to both `tasks` and `taskState` to keep them in sync.


### Add a task

Regardless of mode, an 'Add a task' button with a `Plus` icon is shown below the task list (full width, bordered, matching task button style).

Tapping it sets `isAddingTask` to `true`, revealing an inline group of controls. Changes within the group are committed to the in-memory loop as they are made — no Supabase write until the back button is tapped. A 'Done' button within the group sets `isAddingTask` back to `false`, hiding the group.

**Content of the add-task group:** TBD

Obtain all possible tasks for this category, sourced from `yaml/CLEANING.yaml` using the category as key. Remove any categories that were already present in the loop.

Display a 2-column grid of Cards — all remaining tasks, using the specified lucide options.

Below this group should be a full-width editable button with the text 'Or type your own task...'. If the user types any text, then there should be an 'Add' button shown to the right of the text edit field.

If the user clicks 'Add' then add this task (and a default task_state) to the local loop data.  The task list above should be updated.

## Button Semantics

| element | action |
|---|---|
| back button | should commit the changes for this row, and then return control to your-loop |

## Data Requirements

TODO: do not implement yet

TODO: Describe any Supabase reads or writes this screen performs. Reference `LOOPS.md` or `PERSISTENCE.md` as appropriate. Delete this section if the screen is display-only with no data access.

```typescript
const supabase = createClient()

// TODO: example query
const { data, error } = await supabase
  .from('loops')
  .select('*')
  .eq('user_id', session.user.id)
```

## Analytics

TODO: do not implement yet

TODO: List any `track()` calls this screen fires. All events must be defined in `markdown/ANALYTICS.md` before use. Delete this section if no events are fired.

```typescript
track('TODO_EVENT_NAME', { param: value })
```
