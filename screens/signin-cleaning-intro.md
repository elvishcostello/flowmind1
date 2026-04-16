**Flow:** Onboarding, step 2
**Route:** `/signin/cleaning-intro`

## Invocation

None. No params.

## Content

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - "You're testing the cleaning module."
   - "Flowmind is going to be more than just cleaning. But you're helping us understand what closing a loop actually feels like."

2. A vertical list of three icon + label rows in `space-y-4`, each `text-sm text-muted-foreground` with icon `h-5 w-5 shrink-0`:
   - `CirclePlus` — "Add what's on your mind"
   - `Check` — "Check off each task"
   - `Star` — "Watch your loops close"

3. A full-width Continue `Button`.

## Button Semantics

| element | action |
|---|---|
| Continue button | Navigates to `/rewards-intro` |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
