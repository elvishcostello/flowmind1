**Flow:** Onboarding, step 3
**Route:** `/rewards-intro`

## Invocation

None. No params.

## Content

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - Closing loops earns you stars.
   - Spend them on whatever feels good to you.

2. A Card containing:
   - A table with three rows:
     | star | 1  | a piece of chocolate |
     | star | 5  | Coffee Break |
     | star | 10 | Episode of a Show |
   - A horizontal separator
   - A text widget that says `+ add your own`

3. A full-width Continue `Button`.

## Button Semantics

| element | action |
|---|---|
| Continue button | Navigates to `/your-loops` |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
