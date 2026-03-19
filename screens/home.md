Create a Next.js client component at `app/page.tsx` for route `/`.

This page is a pure auth gate — it has no visible UI. On mount, check `userProfile` from `useUserProfile` context. If there is no `userProfile`, immediately redirect to `/signin`. Render an empty `<div className="flex flex-1" />` while the check runs or while the user is authenticated.
