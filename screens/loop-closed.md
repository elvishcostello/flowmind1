# Loop Closed

This screen is displayed whenever a user closes a loop.

---

Create a Next.js client component at `app/TODO-ROUTE/page.tsx` for route `/TODO-ROUTE`.

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

This screen can be invoked from multiple places:
- your-loops
- update-tasks

In either case navigation will return to your-loops. In both cases clear the history stack, and navigate directly there.

Shows `← Back to My Loops` (navigates to `/your-loops`) per nav pattern in CLAUDE.md.

## Invocation

Invoked with 2 query parameter:
- user id
- loop id

### unpacking the data

From the loop id, obtain the loop row.

Capture `updated_at` and `created_at` in local variables.

Compute the number of tasks.

If `updated_at` is null force it to be the current date.
If `created_at` is null force it to be 10 days ago.

## Content

A vertical group with the following elements:
- a centered icon 'circle', however it should be 200% normal width and height.
- a centered header that says '{user name}, loop closed.' Obtain the user name from the user id and display it in lower case.

- a centered empathy label with the following logic:
  + Compute the difference between update_at and created_at, in days.
    - If it is one day or less the label should read: 'You didn't let it sit long. That matters.'
    - Else: "You got it done."
- Compute the total number of tasks. A label which says '+N stars', one for each task.
- horizontal rule
- A label: "How do you feel compared to before?"
- A single select button group, left to right, centered. The buttons will set a mood variable with the given label. Each button group will show an icon with a label below:
  + 'All good' - 'Sun'
  + 'A little tense' - 'CloudSun'
  + 'Pretty stressed' - 'Cloud'
  + 'Overwhelmed' - 'CloudRain'
  + 'CrashedOut' - 'CloudLightning'
  No button is selected by default.
- a 'Back to my Loops' button

## Button Semantics

TODO: Describe what each interactive element does. Use a table for screens with multiple actions:

| element | action |
|---|---|
| mood buttons | updates the mood variable |
| Back to my Loops | Honor data requirements, then navigate to `your-loops` |

## Data Requirements

Compute the number of tasks in the loop, update the database value for 'user_activity.star_count' to this value.

```typescript
const supabase = createClient()

// TODO: example query
const { data, error } = await supabase
  .from('loops')
  .select('*')
  .eq('user_id', session.user.id)
```

## Analytics

TODO: List any `track()` calls this screen fires. All events must be defined in `markdown/ANALYTICS.md` before use. Delete this section if no events are fired.

```typescript
track('TODO_EVENT_NAME', { param: value })
```
