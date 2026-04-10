# StarCountBadge Component

**Location:** `components/star-count-badge.tsx`

Reusable badge showing the user's star count from `user_activity.star_count`. Used in any screen top bar that shows loop context. Owns its own Supabase query — callers just render it with no props.

## Props

None. Reads `userProfile` from context and queries `user_activity` directly.

## Behaviour

On mount, queries `user_activity` for the row matching the current user and reads `star_count`. Renders a rounded outline button with a `Star` icon and the count.

Renders `0` until the query resolves.

## Usage

```tsx
import { StarCountBadge } from "@/components/star-count-badge";

<StarCountBadge />
```
