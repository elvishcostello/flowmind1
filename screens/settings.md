# Settings Screen — Flowmind Implementation Instructions

## Overview

Implement a Settings screen for the Flowmind app. Settings should be accessible via a gear icon in the top-right corner of the main app screens, sliding in as a `Sheet` component from the right side (shadcn/ui `<Sheet>`). It is **not** a full page navigation — it is an overlay panel that preserves the user's sense of place.

### Why Sheet, not a popup dialog

The use of `<Sheet>` here is a conscious decision:

- **Mobile pattern** — sliding in from the right mirrors native mobile settings drawers (iOS/Android). A centered modal popup feels desktop-native and out of place on mobile.
- **Space** — settings panels grow over time. A Sheet provides full height naturally; a popup becomes cramped or awkwardly tall.
- **Sense of place** — the Sheet keeps the underlying screen visible, reinforcing that settings is a temporary overlay, not a destination.

Settings does contain destructive actions (Sign Out, Return to Orientation). These should each use an `<AlertDialog>` confirmation triggered from *within* the Sheet — the Sheet is the container, the dialog guards the destructive action. This is the same pattern used on `/your-loops` for the close-loop confirmation.

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

Navigate to `/signin-feeling` using `useRouter().push('/signin-feeling')`.

Close the sheet before or during navigation.

This button should be labeled **"Return to Orientation"** — not "back" or "restart". The framing should feel intentional, not like an error recovery.

---

## Styling Notes

Follow Flowmind's shame-free, low-friction design grammar:

- **Identity block**: subtle, not prominent. The user shouldn't feel surveilled by their own name. Use `text-muted-foreground` for email.
- **Return to Orientation button**: `variant="outline"`, full width, normal weight label
- **Sign Out button**: `variant="ghost"`, full width, use `text-destructive` color class to signal it's a terminal action — but keep it visually quiet, not alarming
- Both bottom-zone buttons should have a visible separator (`<Separator />` from shadcn) above them, separating them from future settings content
- Sheet width: default shadcn sheet width is fine on mobile; cap at `max-w-sm` on larger screens

---

## Example Component Skeleton

```tsx
"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
// import your auth hook here, e.g.:
// import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

export function SettingsSheet() {
  const router = useRouter();
  // const user = useUser();
  // const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    // await supabase.auth.signOut();
    router.push("/");
  };

  const handleReturnToOrientation = () => {
    router.push("/signin-feeling");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col max-w-sm">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        {/* Identity block */}
        <div className="flex items-center gap-3 py-4">
          {/* Avatar placeholder */}
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
            {/* First initial of display name or "?" */}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {/* user?.user_metadata?.display_name ?? user?.email ?? "Your Account" */}
            </span>
            <span className="text-xs text-muted-foreground">
              {/* user?.email */}
            </span>
          </div>
        </div>

        {/* Middle zone — future settings sections go here */}
        <div className="flex-1">
          {/* TODO: Add notification settings, appearance, AI behavior, etc. */}
        </div>

        {/* Bottom zone */}
        <div className="flex flex-col gap-2 pb-4">
          <Separator className="mb-2" />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReturnToOrientation}
          >
            Return to Orientation
          </Button>
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Integration Checklist

- [ ] `SettingsSheet` component created at `components/settings-sheet.tsx`
- [ ] Auth hook wired up — display name and email render correctly
- [ ] Sign out calls auth provider and redirects to `/`
- [ ] Return to Orientation navigates to `/signin-feeling`
- [ ] Gear icon appears in the top-right of the `Today` screen header
- [ ] Gear icon appears in the top-right of any other main screens that have a persistent header
- [ ] Sheet closes cleanly on both actions (navigation triggers auto-close; add `open` state control if needed)
- [ ] Tested on mobile viewport — sheet doesn't overflow, buttons have adequate tap targets (min 44px height)
