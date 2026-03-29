# ANALYTICS.md — Product Analytics Context for Claude Code

This file describes the analytics strategy for Flowmind. Read it alongside CLAUDE.md and PERSISTENCE.md before instrumenting any new screens or features.

---

## Overview

Product analytics are handled by **Mixpanel** — a hosted event-based analytics platform. The product team uses Mixpanel directly to monitor DAU/WAU/MAU, funnels, and feature adoption. Engineers are responsible for firing the right events at the right moments; the product team owns the dashboards.

Mixpanel events are fired client-side and sent directly to Mixpanel's servers — they never touch Supabase. The two systems are completely separate. See `PERSISTENCE.md` for the Supabase data model.

Do not add any other analytics service. Do not use Google Analytics. Do not fire ad-hoc events outside this catalogue — all events must be defined here first.

---

## Package

```bash
npm install mixpanel-browser
```

One package only. No wrapper libraries.

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | `.env.local` / Vercel dashboard | Mixpanel project token |

The token is `NEXT_PUBLIC_` intentionally — Mixpanel is a client-side library. It is not a secret.

---

## Dev vs Production Projects

Mixpanel events fired from `localhost` are indistinguishable from production events unless you use separate projects. Use two Mixpanel projects:

| Project | Token in | Purpose |
|---|---|---|
| `flowmind-dev` | `.env.local` | Local development and testing |
| `flowmind-prod` | Vercel dashboard | Real user data |

Never point `.env.local` at the production token. Never let development events pollute production dashboards.

---

## Client Setup

Initialise Mixpanel once at the top level, inside the sign-in guard (only for authenticated users):

```typescript
// lib/analytics.ts
import mixpanel from 'mixpanel-browser'

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!

export function initAnalytics() {
  mixpanel.init(token, { persistence: 'localStorage' })
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  mixpanel.identify(userId)
  if (traits) mixpanel.people.set(traits)
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return
  try {
    mixpanel.track(event, properties)
  } catch {
    // never let analytics crash the app
  }
}

export function resetAnalytics() {
  mixpanel.reset() // call on sign out
}
```

Import `track` from this utility everywhere. Do not call `mixpanel.track()` directly in components.

The `track()` utility is deliberately fire-and-forget — it never throws, never blocks the UI, and never awaits a response. Analytics cannot crash the app.

---

## User Identity

Call `identifyUser` immediately after the Supabase session is confirmed. This links all subsequent events to the correct Mixpanel profile:

```typescript
identifyUser(session.user.id, {
  $email: profile.email,
  $name: profile.display_name,
  acquisition_source: profile.acquisition_source,
  created_at: profile.created_at,
})
```

Call `resetAnalytics()` on sign out to prevent event bleed between users on shared devices.

---

## Event Catalogue

All events are typed. The `AnalyticsEvent` type is the single source of truth — add new events here before implementing them.

```typescript
// lib/analytics.ts — extend this type as new events are needed
export type AnalyticsEvent =
  // Auth
  | 'sign_in'
  | 'sign_out'
  | 'onboarding_completed'

  // Loops
  | 'loop_created'
  | 'loop_updated'
  | 'loop_deleted'
  | 'loop_viewed'

  // Session
  | 'session_started'
  | 'session_ended'

  // Features
  | 'capture_opened'          // frictionless capture triggered
  | 'capture_submitted'       // capture completed
  | 'brain_space_opened'
  | 'brain_space_submitted'
```

### Event properties

| Event | Required properties | Optional properties |
|---|---|---|
| `sign_in` | — | `provider` ('google') |
| `onboarding_completed` | `duration_seconds` | — |
| `loop_created` | `loop_id` | `has_metadata` (bool) |
| `loop_updated` | `loop_id`, `fields_changed` | — |
| `loop_deleted` | `loop_id` | — |
| `loop_viewed` | `loop_id` | — |
| `session_started` | — | `session_count` |
| `capture_submitted` | `modality` | — |
| `brain_space_submitted` | — | — |

---

## Where to Fire Events

| Screen / action | Event to fire |
|---|---|
| Google OAuth callback completes | `sign_in` |
| Sign out button tapped | `sign_out` |
| Final onboarding screen completed | `onboarding_completed` |
| App loads with valid session | `session_started` |
| Loop save confirmed | `loop_created` or `loop_updated` |
| Loop delete confirmed | `loop_deleted` |
| Capture sheet opens | `capture_opened` |
| Capture submitted successfully | `capture_submitted` |
| Brain Space sheet opens | `brain_space_opened` |
| Brain Space submitted | `brain_space_submitted` |

---

## Demo Mode

Do not fire Mixpanel events in demo mode. The `track()` utility above already handles this guard — demo sessions must never pollute analytics data.

---

## DAU / WAU / MAU

Mixpanel computes DAU/WAU/MAU automatically from `session_started` events tied to identified users. The product team uses Mixpanel's built-in retention and funnel reports — no custom SQL queries required on their end.

The `user_activity` table in Supabase (see `PERSISTENCE.md`) maintains `session_count` and `last_access` for in-app logic only. These are not analytics — do not use them to compute engagement metrics.

---

## What Not To Do

- Do not call `mixpanel.track()` directly — always use the `track()` utility from `lib/analytics.ts`
- Do not fire events that are not in the `AnalyticsEvent` type — add them to the catalogue first
- Do not identify users before the Supabase session is confirmed
- Do not fire events in demo mode — the utility guards this automatically
- Do not track PII beyond email and display name — no device data, no location, no free-text content from loops
- Do not point `.env.local` at the production Mixpanel token — use the `flowmind-dev` project locally
- Do not create Mixpanel dashboards that duplicate what Supabase can answer directly — Mixpanel is for behavioural analytics, Supabase is for app data
- Do not add a `user_sessions` table to Supabase — Mixpanel's `session_started` event is the session log
