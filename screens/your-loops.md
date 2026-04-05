Create a Next.js client component at `app/your-loops/page.tsx` for route `/your-loops`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/`. Return `null` while unauthenticated.

## Invocation

Params: see `YourLoopsParams` in `lib/types.ts`. The `refresh` param is optional — when present, the page should reload its loop data.

# layout

Use the standard mobile-first page wrapper (see CLAUDE.md):
```tsx
<div className="flex flex-1 justify-center">
  <div className="w-full max-w-sm flex flex-col flex-1">
    {/* page content */}
  </div>
</div>
```

This page uses a custom top bar in place of the global BreadcrumbNav header. The global header is suppressed on `/your-loops` via `ConditionalHeader` in `components/conditional-header.tsx`.

The layout of the page is as follows:

## top bar

A horizontal div with the following items:
* a text label that says FLOWMIND
* a horizontal spacer 
* a rounded button with two elements in the text
  + a lucide  star
  + a numeric counter (set to 0 for now)
* a rounded button that says 'reflect' targets nothing
* a settings button (that does nothing)

## horizontal separator

## text

```text
Your Loops
What's been sitting in the back of the mind?
```

# A Card

A card with the following contents
* a lucide repeat-2 icon
* text
```text
Nothing open right now.

That's a good feeling.
```

# vertical spacer

a button at the bottom right:

```text
+ Add a Loop
```

The button navigates to `/outer-loop`.
