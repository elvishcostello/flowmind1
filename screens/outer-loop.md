**Flow:** Loops flow, step 1.

**Route:** `/outer-loop`

## Invocation
None

## Content
1. Two paragraphs: "Where is it?" / "Pick the room or area."
2. 2-column grid of category cards (static `CATEGORIES` array — no YAML parsing):
   - Each card: centered icon + category name
   - Tap → `/inner-loop?category=<name>` (URL-encoded)
