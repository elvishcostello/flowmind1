# CompletedLoopsButton Component

**Location:** `components/completed-loops-button.tsx`

Reusable button showing the count of completed loops for the current user. Used in any screen top bar that shows loop context. Owns its own Supabase query — callers just render it with no props.

## Props

None. Reads `userProfile` from context and queries Supabase directly.

## Behaviour

On mount, queries the `loops` table for rows where `user_id = current user` and `completed = true`. Renders a rounded outline button with a `Star` icon and the count.

Renders `0` until the query resolves.

## Usage

```tsx
import { CompletedLoopsButton } from "@/components/completed-loops-button";

<CompletedLoopsButton />
```
