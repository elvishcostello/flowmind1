# CLAUDE.md — Project Context for Claude Code

Read this file before making any changes. When in doubt, read the relevant spec before writing code.

---

## What This App Is

**FlowMind** is a mobile-first productivity app designed specifically for people with ADHD. It runs in the mobile browser (desktop is acceptable but secondary — always favour mobile in design decisions).

**Shame-free design is a first-order constraint.** Every icon choice, copy decision, and interaction pattern must avoid language or imagery that implies self-judgment or failure. This is not a preference — it is a product requirement. When in doubt, ask before implementing.

> AI features (Anthropic SDK) are stubbed out. Do not implement them. Canned responses are used throughout — see Demo Mode below.

---

## Before You Write Any Code

Read these documents in order:

1. **This file** — architecture, conventions, rules
2. **`markdown/SCREENS.md`** — full screen inventory and navigation map
3. **`markdown/PERSISTENCE.md`** — Supabase auth, schema, and data access patterns
4. **The relevant screen spec** — `screens/<screen-name>.md`

Do not start implementing a screen until you have read its spec.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | |
| Styling | Tailwind CSS | Mobile-first, see layout rules below |
| Components | shadcn/ui | Source copied into `components/ui/` — owned code, not a package import |
| Icons | lucide-react | See Icons section below |
| AI | `@anthropic-ai/sdk` | Stubbed only — do not implement |
| Validation | Zod | All schemas live in `lib/types.ts` |
| Persistence | Supabase | See `markdown/PERSISTENCE.md` |
| Analytics | Mixpanel | See `markdown/ANALYTICS.md` — do not call directly |
| Hosting | Vercel | Auto-deploys from `main` |

The package footprint is intentionally minimal. New dependencies should have a clear, specific payoff — avoid packages that solve problems we don't have yet.

---

## Platform Scope

This codebase currently targets **web only** (mobile browser + desktop). Several stack choices reflect that and will need revisiting if native iOS/Android apps are added:

| Choice | Web | When native is added |
|---|---|---|
| Tailwind CSS | ✅ Standard | NativeWind or a separate styling layer for React Native |
| shadcn/ui | ✅ Standard | Web-only — shared primitives will need RN equivalents |
| `@dnd-kit` (drag and drop) | ✅ Standard | Web-only — `reanimated` + `gesture-handler` on native |
| `lucide-react` | ✅ Standard | `lucide-react-native` on native (same icon names) |
| Next.js routing | ✅ Standard | Expo Router on native (similar file-based convention) |

Business logic, Zod schemas, Supabase queries, analytics, YAML config, and canned responses are all platform-agnostic and will carry forward unchanged.

Screen specs may include a `## Platform Notes` section where web and native implementations diverge meaningfully. If you are implementing a web screen, you can ignore those notes.

---

## Architecture

This is a single Next.js project — frontend and backend live together. There is no separate backend service.

```
/
├── app/
│   ├── page.tsx              # Route pages (frontend)
│   ├── api/                  # API routes (server-side only — never import from client)
│   └── auth/callback/        # OAuth callback (see markdown/PERSISTENCE.md)
├── components/
│   ├── ui/                   # shadcn/ui primitives — edit freely, they are owned source
│   ├── conditional-header.tsx
│   ├── breadcrumb-nav.tsx
│   └── how-often-picker.tsx  # Shared picker (see markdown/COMPONENTS.md)
├── lib/
│   ├── supabase/
│   │   └── client.ts         # Supabase browser client — use this, do not instantiate directly
│   ├── analytics.ts          # Mixpanel track() wrapper — always use this, never call mixpanel directly
│   ├── canned-responses.ts   # Demo mode responses, keyed by workflow
│   ├── config.ts             # Parses yaml/ config files — server-side only
│   └── types.ts              # All TypeScript types and Zod schemas — single source of truth
├── yaml/                     # App configuration (source of record — never import directly in components)
│   ├── HOWOFTEN.yaml
│   ├── HOWLONG.yaml
│   └── CLEANING.yaml
├── screens/                  # Screen specifications
│   ├── components/           # Specs for shared components
│   └── *.md                  # One spec per screen
├── proxy.ts                  # Request interceptor — demo mode + Supabase session refresh
├── markdown/
│   ├── PERSISTENCE.md
│   ├── ANALYTICS.md
│   ├── COMPONENTS.md
│   ├── SCREENS.md
│   └── BRAND.md
└── .env.local                # Never commit this
```

**`components/ui/`** — shadcn/ui primitives. These are owned source, not a package. Edit them freely.  
**`components/`** (root level) — shared app-level components like `ConditionalHeader` and `BackNav`. These are part of the app, not primitives.  
Do not confuse the two.

---

## Demo Mode

```
NEXT_PUBLIC_DEMO_MODE=true   # Returns canned responses — no AI calls made
NEXT_PUBLIC_DEMO_MODE=false  # Live mode — calls Anthropic API
```

`proxy.ts` intercepts all requests. In demo mode it matches paths against regex patterns and returns canned responses. The real route handlers never execute. A ~800ms artificial delay simulates realistic LLM latency.

`proxy.ts` also handles Supabase session refresh for non-demo requests. **Both concerns live in the same file — do not create a second proxy file.**

> This project uses `proxy.ts` as a deliberate convention. Do not rename it to `middleware.ts`.

Canned responses must match the exact JSON shape of live API responses. The frontend must never know which mode is active.

---

## AI Integration

All Anthropic API calls live in `app/api/` routes — **never in client-side code.** The API key is server-side only.

```typescript
// app/api/some-workflow/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(req: Request) {
  const { userInput } = await req.json();
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: userInput }],
  });
  return Response.json(message.content);
}
```

Use Zod schemas (from `lib/types.ts`) to validate and type structured AI responses.

---

## Mobile-First Layout

Every page must use this wrapper — no exceptions:

```tsx
<div className="flex flex-1 justify-center">
  <div className="w-full max-w-sm flex flex-col flex-1">
    {/* page content */}
  </div>
</div>
```

On desktop this renders as a tall narrow panel. That is intentional.

---

## Styling & Theming

- **Colors / spacing / radius:** CSS variables in `globals.css`
- **Fonts:** `next/font` in `app/layout.tsx` + Tailwind config
- **Icons:** `lucide-react` — see Icons section below
- **Class merging:** Always use `cn()` from `lib/utils.ts`
- **Brand:** See `markdown/BRAND.md`

---

## Icons

Import from `lucide-react`. Browse available icons at https://lucide.dev.

```typescript
import { Star, CircleCheck, GripVertical } from "lucide-react"
```

---

## Navigation

All in-app navigation uses a single `← Back` button. There are no breadcrumb trails.

- **Back button:** Rendered by `BackNav` in `components/breadcrumb-nav.tsx`. Uses `router.back()` — do not hardcode a parent route.
- **Stack roots** (no back button): `/` and `/your-loops`. The global header is suppressed on these routes. To add a stack root, add its path to `SUPPRESS_HEADER` in `components/conditional-header.tsx`.
- **Stack reset:** When navigating to a stack root programmatically, use `router.replace()` not `router.push()`.

```tsx
router.replace("/your-loops"); // user cannot back-navigate into the previous flow
```

---

## Route Parameter Contracts

Query parameters between screens are defined as Zod schemas in `lib/types.ts`. **Do not define params inline in a component or in a screen spec.**

Schemas chain via `.extend()`:

```typescript
export const OuterLoopParams = z.object({ category: z.string() });
export const InnerLoopParams = OuterLoopParams.extend({ tasks: z.string() });
```

When you need to add a route parameter: define the schema in `lib/types.ts` first, then reference it by name in the screen spec and component.

---

## Persistence

Use the Supabase client from `lib/supabase/client.ts`. Do not instantiate a new client. Do not use `localStorage` or `sessionStorage` — Supabase is the only persistence layer.

See `markdown/PERSISTENCE.md` for the full schema, auth flow, and RLS patterns.

---

## Analytics

Do not call `mixpanel.track()` directly. Always use the `track()` utility from `lib/analytics.ts`. All events must be defined in `markdown/ANALYTICS.md` before use. Do not invent new event names inline.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API — server-side only |
| `NEXT_PUBLIC_DEMO_MODE` | Toggle canned responses |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Use `flowmind-dev` token locally; prod token on Vercel only |

Never put secrets in source code. Never commit `.env.local`.

---

## Deployment

- **Production:** Push to `main` → Vercel auto-deploys
- **Preview:** Push any branch → unique Vercel preview URL
- **Local:** `npm run dev` — or `npm run dev:mobile` to expose on local network for device testing

---

## Screen Spec Conventions

The following are **implicit for every protected screen** — specs do not repeat them:

- **Auth guard:** On mount, redirect to `/` if `userProfile` is absent. Return `null` while unauthenticated.
- **Mobile wrapper:** Every screen uses the `flex flex-1 justify-center` / `max-w-sm` wrapper described above.
- **Standard padding:** `p-6 space-y-8` unless the spec says otherwise.

### Spec format

```
**Flow:** [label]
**Route:** /path  (or **Component:** for overlays)

## Invocation
None  — or —  ?param=<type>  description

## Content
Numbered list of UI elements, top to bottom.
Interactions inline (e.g. "tap → /next-route").

## Behavior   ← optional, only for non-obvious interactions

## Platform Notes   ← optional, only where web and mobile implementations diverge
```

---

## Hard Rules

These are not suggestions. If you are unsure whether something violates one of these, ask before proceeding.

- **Do not make Anthropic API calls from client-side code** — API routes only
- **Do not use `localStorage` or `sessionStorage`** — use Supabase
- **Do not create a second `proxy.ts`** — demo mode and session refresh are composed in one file
- **Do not call `mixpanel.track()` directly** — use `lib/analytics.ts`
- **Do not define route params inline** — define in `lib/types.ts` first
- **Do not install the full shadcn/ui package** — add components individually via CLI
- **Do not use the Vercel AI SDK** — we use the raw Anthropic SDK deliberately
- **Do not violate the shame-free design constraint** — if copy or iconography implies failure or self-judgment, change it
