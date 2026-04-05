**Flow:** Settings overlay — accessible from Loops flow top bar. Not a route; does not affect nav stack.

**Component:** `components/settings-sheet.tsx`

## Invocation
Opened via gear icon (`SettingsSheet` trigger) in the `/your-loops` top bar. No URL params.

## Content
Sheet slides in from right (`side="right"`, `max-w-sm`):

1. Header: "Settings" title
2. Identity block: avatar initial · display name (`username`) · email (muted, if present); fall back to "Your Account"
3. Middle zone: empty (TODO: future settings)
4. Separator
5. "Return to Orientation" button (outline) → `router.replace('/signin/feeling')` + close sheet
6. "Sign Out" button (ghost, destructive color) → `supabase.auth.signOut()` → redirect `/` + close sheet
