# CLAUDE.md — Project Context for Claude Code

This file provides context for Claude Code when working on this project. Read it before making changes.

---

The goal of the application is to demo some advanced development features for mobile. It will run in the mobile browser. It would be nice if it works well on desktop as well, but for design decisions favor mobile every time.

DO NOT implement the anthropic SDK features for now. That is in for completeness. It is ok to stub them out, but no implementation.

---

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (source copied into `components/ui/`, not a black-box import, use the 'radix' components.)
- **AI:** `@anthropic-ai/sdk` — raw SDK, no Vercel AI SDK or other abstraction layer (see note above, stub in, but do not implenent)
- **Validation:** Zod — used to validate and type structured AI responses
- **Persistence:** Supabase — hosted Postgres with built-in auth and row-level security. See `PERSISTENCE.md` for full details.
- **Analytics:** Mixpanel — product analytics for DAU/WAU/MAU and feature instrumentation. See `ANALYTICS.md` for the event catalogue and integration pattern.
- **Hosting:** Vercel (connected to GitHub, auto-deploys on push to `main`)

Keep the package footprint minimal. Do not introduce new dependencies without discussion.

---

## Architecture

This is a **monorepo** — frontend and backend live together in a single Next.js project. There is no separate backend service.

```
/
├── app/
│   ├── page.tsx              # React pages (frontend)
│   ├── components/           # Shared UI components
│   ├── api/                  # API routes (server-side, never exposed to client)
│   └── auth/callback/        # OAuth callback route (see PERSISTENCE.md)
├── lib/
│   ├── supabase/
│   │   └── client.ts         # Supabase browser client utility
│   ├── analytics.ts          # Mixpanel track() utility and event catalogue
│   ├── canned-responses.ts   # Hardcoded demo responses, keyed by workflow
│   └── types.ts              # Shared TypeScript types and Zod schemas
├── middleware.ts              # Demo mode router + Supabase session refresh
├── PERSISTENCE.md            # Data layer: Supabase, auth, schema, RLS
├── ANALYTICS.md              # Mixpanel event catalogue and integration pattern
└── .env.local                # Local secrets (never commit this)
```

---
## Specifcations

* configuration files will go in `yaml/*.yaml`
* coding instructions will be at the root of the repo:
  + CLAUDE.md (this file)
  + PERSISTENCE.md = how to persist data (and sign in /out)
  + ANALYTICS.md - how do analytics
  + SCREENS.md - overall plan for screens
* specifications for indidual screens will be:
  + screens/*.md

## Demo Mode

The app has two operating modes controlled by an environment variable:

```
DEMO_MODE=true   # Returns canned responses, no AI calls made
DEMO_MODE=false  # Live mode, calls Anthropic API
```

### How it works

`proxy.ts` intercepts all incoming requests. In demo mode, it matches the request path against a set of regex patterns and returns the appropriate canned response. The real API route handlers never execute.

**Important:** `proxy.ts` also handles Supabase session refresh for non-demo requests. Both concerns live in the same file — do not create a second proxy. See `PERSISTENCE.md` for the composition pattern.

> **Note:** Next.js 16 replaced `middleware.ts` with `proxy.ts`. The exported function must be named `proxy` (or a default export) rather than `middleware`.

```typescript
const mockedRoutes = [
  { pattern: /\/api\/intake/, response: intakeResponse },
  { pattern: /\/api\/recommend/, response: treatmentResponse },
  { pattern: /\/api\/summary/, response: summaryResponse },
];
```

**Important:** Canned responses must match the exact JSON shape that live API responses return. The frontend must never know which mode is active.

### Why this matters

- The app was built UI-first with canned responses. The AI was retrofitted later.
- Demo mode is used for pitches and demos where connectivity cannot be guaranteed.
- Adding a small artificial delay (`setTimeout ~800ms`) in demo mode simulates realistic LLM latency.

---

## AI Integration

All Anthropic API calls live in `app/api/` routes — never in client-side code. The API key is server-side only.

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

Use Zod schemas to validate and type structured responses from the AI. Define schemas in `lib/types.ts` and share them between API routes and frontend components.

---

## Mobile-First Layout

This app targets mobile browsers. All pages must use the mobile-first centered layout pattern:

```tsx
<div className="flex flex-1 justify-center">
  <div className="w-full max-w-sm flex flex-col flex-1">
    {/* page content */}
  </div>
</div>
```

- The outer div fills available height and centers horizontally
- The inner `max-w-sm` container constrains content to a phone-width column
- On desktop this renders as a tall narrow panel — that is intentional

**Every page must use this wrapper.** Do not render full-width layouts.

---

## Styling & Theming

shadcn/ui components are in `components/ui/` as owned source code — edit them freely. Theming is via CSS custom properties in `globals.css`. To update branding:

- **Colors:** Edit CSS variables in `globals.css`
- **Fonts:** Update `next/font` configuration in `app/layout.tsx` and the Tailwind config
- **Border radius / spacing:** CSS variables in `globals.css`
- **Icons:** Lucide React is the default; swap per-component as needed

Use the `cn()` utility (from `lib/utils.ts`) when merging Tailwind classes to avoid specificity conflicts.

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` / Vercel dashboard | Anthropic API access |
| `DEMO_MODE` | `.env.local` / Vercel dashboard | Toggle canned responses |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Vercel dashboard | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Vercel dashboard | Supabase public API key |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | `.env.local` / Vercel dashboard | Mixpanel project token (use dev token locally, prod token on Vercel) |

See `PERSISTENCE.md` for Supabase configuration. See `ANALYTICS.md` for Mixpanel configuration and event catalogue.

Never put secrets in the codebase. Never commit `.env.local`.

---

## Deployment

- **Production:** Push to `main` → Vercel auto-deploys
- **Preview:** Push any branch → Vercel generates a unique preview URL
- **Local:** `npm run dev` with `.env.local`

Preview deployments can have their own environment variable overrides (e.g. `DEMO_MODE=true` on preview, `false` on production).

Please add this to the package.json file:
```json
"scripts": {
  "dev": "next dev",
  "dev:mobile": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "next start"
}
```

---

## What Not To Do

- Do not add the Vercel AI SDK — we are using the raw Anthropic SDK deliberately
- Do not put API keys or secrets in source code or commit them
- Do not make Anthropic API calls from client-side components
- Do not install the full shadcn/ui package — components are added individually via the CLI and owned as source
- Do not use `localStorage` or `sessionStorage` — this is a stateless app; use Supabase for all persistence (see `PERSISTENCE.md`)
- Do not create a second `proxy.ts` — demo mode and Supabase session refresh are composed in the same file
- Do not fire ad-hoc analytics events — all events must be defined in the catalogue in `ANALYTICS.md`
- Do not call `mixpanel.track()` directly — always use the `track()` utility from `lib/analytics.ts`
- Do not point `.env.local` at the production Mixpanel token — use the `flowmind-dev` project locally

## Route Parameter Contracts

Query parameters passed between screens are defined as Zod schemas in `lib/types.ts` — not in the screen specs or inline in components.

Schemas chain via `.extend()` to reflect how params accumulate across the flow:

```typescript
export const OuterLoopParams = z.object({ category: z.string() });
export const InnerLoopParams = OuterLoopParams.extend({ "sub-category": z.string() });
// etc.
```

Screen specs reference the schema by name (`see HowLongParams in lib/types.ts`) rather than duplicating the param list. `lib/types.ts` is the single source of truth.

---

## Icons

Use the icon library found at http:\\lucided.dev, importing via ```lucided-react```.

## use of breadcrumbs

For all page to page navigation, implement a back button which takes the user to the prior page.

