# Reflect

This screen offers a reflection on what has gotten done today, so far.

---

Create a Next.js client component at `app/reflect/page.tsx` for route `/reflect`.

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

This page is invoked from 'your-loops'
Shows `← your loops` (navigates to `/your-loops`) per nav pattern in CLAUDE.md.

## Invocation

`?id=<string>` — see `UpdateTasksParams` in `lib/types.ts`.

On mount, query the `loops` table to count the number of rows with:
- matching `id` and `user_id`
- completed == True
- updated_at == today's date

Additionally, roll up the total number of tasks in the same selection.

Additionally, group all matching loops by category, and compute the number of tasks.

## Content

### heading nav

A horizontal DIV with:
- back button
- horizontal spacer
- <StarCountBadge>>

### body

A large circle, centered and pushed to the top of the screen:
- within the circle:
  + a large number indicated the count of loops closed today
  


- Heading / label text
- Body paragraphs (`text-base leading-relaxed space-y-5`)
- Button groups (minimal width, left-to-right wrapping)
- Cards (2-column grid, or full-width list)
- A primary CTA button at the bottom (full-width)

## Button Semantics

TODO: Describe what each interactive element does. Use a table for screens with multiple actions:

| element | action |
|---|---|
| TODO button | navigates to `/TODO-NEXT-ROUTE`, passing `?param=value` |
| TODO button | TODO |

## Data Requirements

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

TODO: List any `track()` calls this screen fires. All events must be defined in `markdown/ANALYTICS.md` before use. Delete this section if no events are fired.

```typescript
track('TODO_EVENT_NAME', { param: value })
```
