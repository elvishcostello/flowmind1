# HowOftenPicker Component

**Location:** `components/how-often-picker.tsx`

Reusable frequency picker used by both the loop creation flow (`how-often`) and the update-tasks screen (change-mode). All UI logic lives here — calling code supplies the current value and handles persistence.

## Props

```typescript
interface HowOftenPickerProps {
  options: HowOftenOption[];  // from lib/config.ts via server component
  value: string;              // current how_often value
  days: string[];             // current selected days
  onChange: (value: string, days: string[]) => void;  // called when selection is committed
  onAdvance?: (value: string) => void;  // optional — creation flow uses this to navigate immediately
}
```

## Behaviour

Renders a wrapping group of frequency buttons, one per `HowOftenOption`. Action semantics:

| action | behaviour |
|---|---|
| `advance` | If `onAdvance` is provided, calls `onAdvance(label)` only. Otherwise calls `onChange(label, [])`. Never calls both. |
| `enable` | Calls `onChange(label, [])` and shows `Add This Loop` button |
| `day-chooser-single` | Reveals day-chooser in single-select mode |
| `day-chooser-multi` | Reveals day-chooser in multi-select mode |

When a day-chooser action is active, a horizontal rule and centered wrapping group of day buttons (Mon–Sun) is shown below the frequency buttons. Selected days are highlighted with `bg-primary`. An `Add This Loop` button is shown once at least one day is selected — tapping it calls `onChange(label, selectedDays)`.

The currently active frequency button (matching `value` prop) is highlighted on initial render.

## Usage

**Creation flow** (`how-often-client.tsx`):
```tsx
<HowOftenPicker
  options={options}
  value=""
  days={[]}
  onChange={async (value, days) => { await persistLoop(value, days); router.replace('/your-loops'); }}
  onAdvance={async (value) => { await persistLoop(value, null); router.replace('/your-loops'); }}
/>
```

**Update-tasks** (`update-tasks-client.tsx`):
```tsx
<HowOftenPicker
  options={howOftenOptions}
  value={howOften}
  days={days}
  onChange={(value, newDays) => {
    setHowOften(value);
    setDays(newDays);
    setIsChangingFrequency(false);
  }}
/>
```
