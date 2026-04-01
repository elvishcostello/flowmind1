**Flow:** Settings overlay (Sheet), accessible from the Loops flow top bar. Not a full page — does not affect the nav stack.

## Overview

Implement a Settings screen for the Flowmind app. Settings should be accessible via a gear icon in the top-right corner of the main app screens, sliding in as a `Sheet` component from the right side (shadcn/ui `<Sheet>`). It is **not** a full page navigation — it is an overlay panel that preserves the user's sense of place.

---

## Files to Create or Modify

### 1. `components/settings-sheet.tsx` ← **Create this**

A self-contained component that renders the gear icon trigger and the full settings sheet content.

### 2. Modify any top-bar / header component on `Today` and other main screens

Import and drop in `<SettingsSheet />` to the top-right of the header.

---

## Component Spec: `SettingsSheet`

### Trigger

- A `Settings` icon (use `lucide-react`: `import { Settings } from "lucide-react"`)
- Icon only, no label
- Positioned top-right in the app header bar
- Use `variant="ghost"` `<Button>` wrapper so it has a proper tap target

### Sheet Layout

Use shadcn `<Sheet>`, `<SheetContent side="right">`, `<SheetHeader>`, `<SheetTitle>`.

Structure the sheet content in three vertical zones:

```
┌─────────────────────────────┐
│  ← [X close]    Settings    │  ← SheetHeader (shadcn default)
├─────────────────────────────┤
│                             │
│  👤  [User's display name]  │  ← Identity block (top zone)
│      [user email if avail]  │
│                             │
├─────────────────────────────┤
│                             │
│  (reserved for future       │  ← Middle zone — leave empty for now
│   settings sections)        │     with a TODO comment
│                             │
├─────────────────────────────┤
│  [ Return to Orientation ]  │  ← Bottom zone
│  [ Sign Out               ] │
└─────────────────────────────┘
```

---

## Data Requirements

### User Identity

Pull the current user's **display name** and **email** from `useUserProfile()` — both fields are available on the `UserProfile` type (`username` and `email`).

- Display name: render as `font-medium text-sm`
- Email: render below name as `text-xs text-muted-foreground`, only if present
- If display name is unavailable, fall back to `"Your Account"` as placeholder

### Sign Out

Call your existing auth sign-out method (e.g. `supabase.auth.signOut()`).

After sign-out completes:
- Close the sheet
- Redirect to `/` (or your root auth route)

Use `useRouter` from `next/navigation` for the redirect.

### Return to Orientation

Navigate to `/signin/feeling` using `router.replace('/signin/feeling')` (stack reset — see CLAUDE.md Navigation).

Close the sheet before or during navigation.

This button should be labeled **"Return to Orientation"** — not "back" or "restart".

---

## Styling Notes

- **Identity block**: subtle, not prominent. Use `text-muted-foreground` for email.
- **Return to Orientation button**: `variant="outline"`, full width, normal weight label
- **Sign Out button**: `variant="ghost"`, full width, use `text-destructive` color class
- Both bottom-zone buttons should have a visible `<Separator />` above them
- Sheet width: default shadcn sheet width is fine on mobile; cap at `max-w-sm` on larger screens

---

## Integration Checklist

- [ ] `SettingsSheet` component created at `components/settings-sheet.tsx`
- [ ] Auth hook wired up — display name and email render correctly
- [ ] Sign out calls auth provider and redirects to `/`
- [ ] Return to Orientation navigates to `/signin/feeling`
- [ ] Gear icon appears in the top-right of the `Your Loops` screen header
- [ ] Sheet closes cleanly on both actions
- [ ] Tested on mobile viewport — sheet doesn't overflow, buttons have adequate tap targets (min 44px height)
