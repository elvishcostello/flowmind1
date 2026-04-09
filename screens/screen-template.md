# Screen Template

Use this file as a starting point when specifying a new screen. Replace all TODO sections with screen-specific content and remove this header block.  Replace TODO-ROUTE with the actual route.

TODO: remove this front matter.

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

TODO: Describe where this screen sits in the flow (e.g. "Loops flow, step N"). Specify the back destination:
Shows `← Back` (navigates to `/TODO-PRIOR-ROUTE`) per nav pattern in CLAUDE.md.

## Invocation

TODO: Specify the query params this screen receives, referencing the Zod schema in `lib/types.ts`:
Params: see `TODOParams` in `lib/types.ts`.

— or, if no params —

None. The page fetches data unconditionally on mount.

## Content

TODO: Describe the screen layout from top to bottom. Common elements include:

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
