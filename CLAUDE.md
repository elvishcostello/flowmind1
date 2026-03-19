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
│   └── api/                  # API routes (server-side, never exposed to client)
├── lib/
│   ├── canned-responses.ts   # Hardcoded demo responses, keyed by workflow
│   └── types.ts              # Shared TypeScript types and Zod schemas
├── middleware.ts              # Demo mode router — intercepts requests before API routes
└── .env.local                # Local secrets (never commit this)
```

---

## Demo Mode

The app has two operating modes controlled by an environment variable:

```
DEMO_MODE=true   # Returns canned responses, no AI calls made
DEMO_MODE=false  # Live mode, calls Anthropic API
```

### How it works

`middleware.ts` intercepts all incoming requests. In demo mode, it matches the request path against a set of regex patterns and returns the appropriate canned response. The real API route handlers never execute.

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
- Do not use `localStorage` or `sessionStorage` — this is a stateless app

## Icons

Use the icon library found at http:\\lucided.dev, importing via ```lucided-react```.

## use of breadcrumbs

For all page to page navigation, implement a back button which takes the user to the prior page.

