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

## Notes

- All non-home screens include a `BreadcrumbNav` back button that calls `router.back()`.
- Most screens guard against unauthenticated access: if no `userProfile` is present in context, they redirect to `/signin`.
- if the exit is not specified, you can ignore this
