**Flow:** Loop creation, step 3
**Route:** `/how-long`

## Invocation

Params: see `HowLongParams` in `lib/types.ts`.

## Content

A label at the top: "How long has this been on your mind?"

Then a vertical set of buttons. Read the yaml/HOWLONG.yaml file for a list of values. The button labels should be these values, in the order given.

## Button Semantics

Tapping a button navigates to `/how-often`, passing all current params plus the selected value:

- `?category=<string>` — passed through
- `?tasks=<string>` — passed through (JSON-encoded string[])
- `?how-long=<string>` — the selected button label (URL-encoded)

## Analytics

TODO: Define any events this screen should fire in `markdown/ANALYTICS.md`, then call `track()` here.
