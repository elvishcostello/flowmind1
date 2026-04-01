# SCREENS.md — App Screen Inventory

All screens in the app with their navigation relationships.

| screen_id             | name                     | route                    | entry_from            | exits_to              |
|-----------------------|--------------------------|--------------------------|-----------------------|-----------------------|
| home                  | Home                     | `/`                      | —                     | signin                |
| signin-feeling        | You Know That Feeling    | `/signin/feeling`        | signin                | signin-cleaning-intro |
| signin-cleaning-intro | Introduction to Cleaning | `/signin/cleaning-intro` | signin-feeling        | rewards-intro         |
| loops                 | Loops                    | `/loops`                 | signin-cleaning-intro | —                     |
| rewards-intro         | Introduction to Rewards  | `/rewards-intro`         | loops                 | your-loops            |
| your-loops            | Your Loops               | `/your-loops`            | rewards-intro         | -                     |
| outer-loop            | Outer Loop               | `/outer-loop`            | TBD                   | inner-loop            |
| inner-loop            | Inner Loop               | `/inner-loop`            | outer-loop            | -                     |

| settings              | Settings                 | overlay (Sheet)          | any main screen header  | signin-feeling / `/`  |

## Notes

- All non-home screens include a `BreadcrumbNav` back button that calls `router.back()`.
- Most screens guard against unauthenticated access: if no `userProfile` is present in context, they redirect to `/`.
- if the exit is not specified, you can ignore this
- The settings screen is a `Sheet` overlay (not a page), triggered by a gear icon in the top-right of main screen headers. Implemented in `components/settings-sheet.tsx`.
