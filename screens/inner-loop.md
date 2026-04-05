**Flow:** Loops flow, step 2.

**Route:** `/inner-loop`

## Invocation
`?category=<string>` — URL-encoded category name (e.g. `Kitchen`, `Bathroom`). Decoded into local var `category` on load.

## Content
1. Category name (all-caps label)
2. "What needs doing?" label
3. 2-column multi-select card grid (from static `CLEANING_DATA[category]`):
   - Each card: centered icon + task name
   - Tap toggles selection; selected cards styled `bg-primary text-primary-foreground`
4. Full-width "Add Tasks" button (below grid):
   - 0 selected → "Add Tasks" (disabled)
   - 1 selected → "Add 1 Task"
   - N selected → "Add N Tasks"
   - No action yet
