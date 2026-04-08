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
- pencil + Edit steps
- Done Editing

### primary mode

In this mode, create a vertical stack of the tasks. Query the task_state.  For each task:

Create a toggle-able list of buttons. 

If the task is complete (TRUE), use `circle-check-big` for the incon, followed by a ' ' and the name of the task

If it is false, use `circle`, followed by a ' ' and the name of the task.

The tasks should be editable, and their action is to toggle the state.

### editing mode

TODO: do not implement yet

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
