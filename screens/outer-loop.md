Create a Next.js client component at `app/outer-loop/page.tsx` for route `/outer-loop`.

Auth guard: on mount, if no `userProfile` in context, redirect to `/`. Return `null` while unauthenticated.

# Layout

Use the standard mobile-first page wrapper (see CLAUDE.md):
```tsx
<div className="flex flex-1 justify-center">
  <div className="w-full max-w-sm flex flex-col flex-1">
    {/* page content */}
  </div>
</div>
```

## Navigation

This screen is part of the signed-in app. The global `BreadcrumbNav` header is shown (not suppressed).

`BreadcrumbNav` treats `/your-loops` as the breadcrumb root for this route — the back arrow and "Home" crumb both navigate to `/your-loops`, not `/`. This is controlled by `APP_ROUTE_SEGMENTS` in `components/breadcrumb-nav.tsx`.

Do not use `router.back()` for navigation here — the breadcrumb component handles it via `router.push(parent)`.

## Layout

The page is centered vertically and horizontally with `p-6`. Content is constrained to `max-w-sm` and uses `space-y-8`.

Layout from top to bottom:

1. Two short paragraphs in `text-base leading-relaxed space-y-5`:
   - Where is it?
   - Pick the room or area

2. A 2-column grid of Cards, one per top-level key in `CLEANING.yaml`.

  Categories and their icons are defined as a static `CATEGORIES` array in the page component (no runtime YAML parsing). Each card shows:
  - the lucide icon for the category (centered)
  - the category name below it

  Tapping a card navigates to `/inner-loop?category=<name>` (URL-encoded).

