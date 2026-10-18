# Lavka — project rules for Claude Code

Lavka is a portfolio project: a niche marketplace for handmade goods by Ukrainian makers.
Owner: Valentyn (GitHub `ValentynKoval`, Vercel `valentyngolf`). Claude writes the code; Valentyn sets tasks and reviews.

## Languages

- **UI text: Ukrainian only.** Every user-facing string (pages, forms, errors, toasts, metadata) is in Ukrainian.
- **Code, comments, README, commit messages: English.**
- **Reports to Valentyn: Russian.**

## Definition of done (every round)

`npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` → commit → push → deploy → link + a short report.
Never report "done" after a partial check. On this Windows PC `next build` may need `NODE_OPTIONS=--max-old-space-size=4096`.

## Repository is public

- No secrets in code or git history. Everything sensitive goes through environment variables; `.env.example` lists them.
- `.env.local` is git-ignored and must stay so.
- Demo photos are from Unsplash (free license); `scripts/demo-images.json` keeps their ids.

## Architecture conventions

- Next.js App Router + TypeScript (strict) + Tailwind CSS v4. Design tokens live in `src/app/globals.css` (`@theme`).
- Data access goes through repository interfaces in `src/lib/repositories/types.ts`. Two implementations:
  `mock/` (in-memory demo data, used when Supabase keys are missing or `LAVKA_DATA_SOURCE=demo`) and `supabase/`.
  Pages and server actions never import Supabase directly — they call `getCatalogRepository()` etc.
- Pure logic (catalog filters, URL params, cart math) lives in `src/lib/**` without React and is unit-tested with Vitest.
- Client state (cart, favourites) is in Zustand stores persisted to localStorage and synced to the account when signed in.
- Prices are integers in kopiykas (1/100 UAH). Format with `formatPrice`.
- Schema changes = a new file in `supabase/migrations/` + update `src/lib/supabase/database.types.ts` + seed if needed.
- Server actions validate input with Zod and return `{ error, fieldErrors }` instead of throwing.

## Scope

Stage 1 (done): catalog, search & filters, product page, shop page, favourites, cart, auth, seller cabinet, demo data, deploy.
Stage 2 (done 2026-10-18): checkout and orders (demo payment, no Stripe), reviews, chat with Supabase Realtime, admin panel,
seller analytics, command palette, dark mode, OG images, sitemap/robots/JSON-LD.
Not planned unless asked: real payments (Stripe), e-mail notifications, shipping APIs, English UI.

## Stage 2 conventions

- Orders are created only through the `place_order` RPC (atomic stock check + decrement). Status changes follow `NEXT_STATUSES` in `src/lib/stats/aggregate.ts`.
- Demo stage-2 data (reviews, orders, views, chat) is generated deterministically in `src/data/demo-stage2.ts`; the seed and demo mode share it.
- Dark mode works by overriding design tokens under `:root[data-theme="dark"]`; add new colours as tokens, not hard-coded hex, so both themes stay in sync.
- Charts are plain SVG in `src/components/charts/charts.tsx`; no chart library.
