Create a Next.js client component at `app/your-loops/page.tsx` for route `/your-loops`.

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

This page uses a custom top bar in place of the global BreadcrumbNav header. The global header is suppressed on `/your-loops` via `ConditionalHeader` in `components/conditional-header.tsx`.

## Navigation

Main screen — no back button. Entry point after onboarding and after saving a new loop.

## Invocation

None. The page fetches loop data unconditionally on mount.

On mount, run two queries (matching on `user_id`):
- Count loops where `completed` is `TRUE`
- Return all loops where `completed` is not `TRUE`

## Content

### Top bar

A horizontal div with:
- A ghost button labeled `Feedback` — opens the `<FeedbackSheet />` overlay (see `components/feedback-sheet.tsx`)
- A horizontal spacer
- A rounded button with a lucide `Star` icon and a numeric counter (count of completed loops)
- A rounded button labeled `reflect` (targets nothing)
- A settings button — opens the `<SettingsSheet />` overlay (see `components/settings-sheet.tsx`)

### Feedback sheet

Slides up from the bottom. Content:

1. Heading: `We Welcome Your Feedback!`
2. Multiline textarea with placeholder `type your feedback here`, initial height ~40% of screen height
3. A horizontal button group:
   - `ThumbsUp` icon button — toggles on/off; when active uses `default` variant; tapping when active deselects it; mutually exclusive with thumbs down
   - `ThumbsDown` icon button — same toggle semantics, mutually exclusive with thumbs up
   - Horizontal spacer
   - `Submit` button — disabled when textarea is empty

**Submit semantics:** inserts a row into the `feedback` table (`user_id`, `feedback_text`, `thumbs_up`), then replaces the sheet content with a brief `Thanks!` message and auto-closes after 2 seconds. `thumbs_up` is `true` for thumbs up, `false` for thumbs down, `null` if neither was selected.

See `markdown/FEEDBACK.md` for schema and RLS.

### Horizontal separator

### Heading text

```
Your Loops
What's been sitting in the back of the mind?
```

### Empty state

If the open loops list is empty, show a card with:
- A lucide `Repeat2` icon
- Text:
  ```
  Nothing open right now.

  That's a good feeling.
  ```

### Loop list

If open loops exist, render a card for each loop:

**Row 1:** Look up the category in `yaml/CLEANING.yaml`. If the `icon` field is non-null, display the corresponding lucide icon. Then display a label: `<category> Tasks`.

**Row 2:** The tasks array must not be empty — log a console error if it is. Display the first task with:
- A lucide `Circle` icon
- The first task value
- If additional tasks exist, append `+N more` on the same row

For each loop, compute the percentage of tasks completed locally from `task_state[]` (count of `true` values / total tasks). Do not query Supabase for this — `task_state` is already in the fetched row.

Render the progress bar using `<ProgressField value={pct} />` from `components/ui/progress-field.tsx`. This is a composite component that pairs the shadcn `<Progress>` primitive with a percentage label span — do not use `<Progress>` directly, as it cannot display the percentage text on its own.

Below that should be an inline button (like a hypertext link) with the label 'See all'. The target of that button should be `update-tasks` with an `id` parameter for the loop id.

Each card has a close (X) button.


### Footer

A button pinned to the bottom right: `+ Add a Loop`

## Button Semantics

| element | action |
|---|---|
| Close (X) button | Shows a confirmation dialog (see below) |
| Add a Loop button | Navigates to `/outer-loop` |

**Close confirmation dialog:**

Label: `Remove this loop?`

| button | action |
|---|---|
| Yes, Remove it | Updates the loop row: sets `completed` to `TRUE` |
| Keep it | Dismisses the dialog, returns to the loops page |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
