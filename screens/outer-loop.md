**Flow:** Loop creation, step 1
**Route:** `/outer-loop`

## Invocation

None. No params — this is the entry point of the loop creation flow.

## Content

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - Where is it?
   - Pick the room or area

2. A 2-column grid of Cards, one per top-level key in `yaml/CLEANING.yaml`.

   Categories and their icons are defined as a static `CATEGORIES` array in the page component (no runtime YAML parsing). Each card shows:
   - the lucide icon for the category (centered)
   - the category name below it

## Button Semantics

| element | action |
|---|---|
| Category card | Navigates to `/inner-loop?category=<name>` (URL-encoded) |

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
