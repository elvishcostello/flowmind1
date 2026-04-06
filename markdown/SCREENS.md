# SCREENS.md — App Screen Inventory

All screens in the app with their navigation relationships.

| screen_id             | name                     | route                    | entry_from            | exits_to              |
|-----------------------|--------------------------|--------------------------|-----------------------|-----------------------|
| home                  | Home                     | `/`                      | —                     | signin                |
| signin-feeling        | You Know That Feeling    | `/signin/feeling`        | signin                | signin-cleaning-intro |
| signin-cleaning-intro | Introduction to Cleaning | `/signin/cleaning-intro` | signin-feeling        | rewards-intro         |
| rewards-intro         | Introduction to Rewards  | `/rewards-intro`         | signin-cleaning-intro | your-loops            |
| your-loops            | Your Loops               | `/your-loops`            | rewards-intro         | outer-loop            |
| outer-loop            | Outer Loop               | `/outer-loop`            | your-loops            | inner-loop            |
| inner-loop            | Inner Loop               | `/inner-loop`            | outer-loop            | how-long              |
| how-long              | How Long                 | `/how-long`              | inner-loop            | how-often             |
| how-often             | How Often                | `/how-often`             | how-long              | —                     |
| loops                 | Loops                    | `/loops`                 | — (stub)              | —                     |

| settings              | Settings                 | overlay (Sheet)          | any main screen header  | signin-feeling / `/`  |

## Notes

- All non-home screens include a `BreadcrumbNav` back button that calls `router.back()`.
- Most screens guard against unauthenticated access: if no `userProfile` is present in context, they redirect to `/`.
- if the exit is not specified, you can ignore this
- The settings screen is a `Sheet` overlay (not a page), triggered by a gear icon in the top-right of main screen headers. Implemented in `components/settings-sheet.tsx`.

## useSearchParams and Suspense

Any client component that calls `useSearchParams()` must be wrapped in a `<Suspense>` boundary, or Next.js will throw a prerender error and serve a 404 in production.

Two patterns are used in this codebase:

**Split file pattern** (preferred for pages that also read YAML server-side):
```tsx
// page.tsx — server component
import { Suspense } from "react";
import { MyClient } from "./my-client";

export default function MyPage() {
  return <Suspense><MyClient /></Suspense>;
}
```

**Self-wrapping pattern** (for all-in-one client component pages):
```tsx
// page.tsx — client component
function MyContent() {
  const searchParams = useSearchParams(); // safe inside Suspense
  // ...
}

export default function MyPage() {
  return <Suspense><MyContent /></Suspense>;
}
```
