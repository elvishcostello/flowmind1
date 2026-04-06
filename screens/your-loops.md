Create a Next.js client component at `app/your-loops/page.tsx` for route `/your-loops`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/`. Return `null` while unauthenticated.

## Invocation

None. The page fetches loop data unconditionally on mount.

When invoked, do two querys (matching on user_id)
* count how many loops exist for this user where completed is TRUE
* return a list of all the loops for this user for which completed is not TRUE

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
  + a numeric counter (set this value to the number of completed loops above)
* a rounded button that says 'reflect' targets nothing
* a settings button (that does nothing)

## horizontal separator

## text

```text
Your Loops
What's been sitting in the back of the mind?
  ```

## nothing open DIV

If the length of the open loops is exactly zero, then:

Create a card with the following contents
* a lucide repeat-2 icon
* text
```text
Nothing open right now.

That's a good feeling.
```

## list of active loops

If the length is greater than zero, then:

For each loop, create a card with the following contents:

In the first row:
* Obtain the category. Look  this up in yaml/CLEANING.yaml, and if the icon field is non null, display that lucide icon.
* Then display a label with the category, followed by this string ' Tasks'

The tasks array should NOT be empty, if it is please log an error on the console.

If the array is NOT empty, obtain the first task in the list, and put this on a single row:
* a Lucide icon for a 'circle'
* the value of the first task
* if there are additional tasks beyond the first, append `+N more` (e.g. `+2 more`) on the same row
* there should be a close (X) button for the card.

## vertical spacer

a button at the bottom right:

```text
+ Add a Loop
```

## Button semantics


### close button
If the user pressed the 'close' button for a given card, a simple confirmation dialog should appear:

Label: Remove this loop?
Buttons:
* Yes, Remove it
* Keep it

The action for the 'Yes' action is to close the loop.

To do this, update this row in the loops table, marking the 'completed' field as TRUE.

If the user selects 'Keep it' return to the loops page, effectively a browser back action.

### Add a loops

The Add a Loops button navigates to `/outer-loop`.
