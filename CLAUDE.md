# Lavka — project rules for Claude Code

Lavka is a portfolio project: a niche marketplace for handmade goods by Ukrainian makers.
Owner: Valentyn (GitHub `ValentynKoval`, Vercel `valentyngolf`). Claude writes the code; Valentyn sets tasks and reviews.

## Languages

- **UI text lives in dictionaries** (`src/i18n/messages/uk.ts` is the source; `en.ts` and `ru.ts` must match its shape — TypeScript enforces it).
  Never hard-code a user-facing string in a component: use `getTranslator()` on the server or `useT()` on the client,
  plurals via `tp()`, dates via `formatDate()`. Repositories throw `AppError("dict.key")`; actions translate with `localizeError()`.
  Taxonomy names come from `getTaxonomy(locale)`. Ukrainian stays the default language; product content is not translated.
- **Code, comments, README, commit messages: English.**
- **No `Co-Authored-By` trailers or any AI attribution in commits, PRs, README or the UI** (Valentyn's rule, 2026-10-19).
- **The site does not link to the GitHub repository** (no "open source" badges in the UI); the repo link lives only in README.
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
Stage 3 (done 2026-10-18): UI in three languages (UA/EN/RU) with a cookie-based locale switcher.
Stage 4 (done 2026-10-21): shop by colour (server-side palette extraction), gift finder, interactive makers map, Realtime Presence
viewer counter, /about page with one-click demo sign-in, motion polish (reveal, tilt, fly-to-cart, confetti, progress bar).
Stage 5 (done 2026-10-21): custom orders (commissions), notification centre on DB triggers + Realtime, pg_trgm fuzzy search with
"did you mean", public collections with OG cards, compare table, product Q&A, "how it's made" steps, shop accent colours,
View Transitions morph between catalogue and product.
Not planned unless asked: real payments (Stripe), e-mail notifications, shipping APIs, translated product content.

## Stage 2 conventions

- Orders are created only through the `place_order` RPC (atomic stock check + decrement). Status changes follow `NEXT_STATUSES` in `src/lib/stats/aggregate.ts`.
- Demo stage-2 data (reviews, orders, views, chat) is generated deterministically in `src/data/demo-stage2.ts`; the seed and demo mode share it.
- Dark mode works by overriding design tokens under `:root[data-theme="dark"]`; add new colours as tokens, not hard-coded hex, so both themes stay in sync.
- Charts are plain SVG in `src/components/charts/charts.tsx`; no chart library.

## Stage 4 conventions

- Product colours are derived, never typed: `saveProductAction` runs `extractPaletteFromUrl` (sharp) on the first image and stores
  `palette` (hex) + `color_tags` (from `colorTag()` in `src/lib/color/palette.ts`). Demo palettes live in `src/data/demo-palettes.json`
  (`npm run demo:palettes` regenerates them; keep `scripts/extract-demo-palettes.mjs` in sync with `quantize()`).
- Colour tags are a closed list (`COLOR_TAGS`); adding one means a dictionary entry in all three locales and a swatch in `COLOR_SWATCH`.
- The makers map is hand-made SVG (`src/data/ukraine-map.ts`): a simplified outline plus one anchor per taxonomy region. A new region
  needs an anchor there or it will not appear on the map (there is a test for this).
- Gift finder logic is pure (`src/lib/gifts/finder.ts`): recipient → categories, occasion → tags, style → colour tags + materials.
- Motion: every decorative effect (Reveal, tilt, fly-to-cart, confetti, CountUp) must stay inert under `prefers-reduced-motion`.
- Demo sign-in (`demoSignInAction`) is intentional for the portfolio: the accounts and password are public in the README.

## Stage 5 conventions

- Notifications are never inserted from application code in Supabase mode: Postgres triggers (`notify_*` in 0007) write them.
  Demo mode mirrors each trigger with `mockNotify` at the same points (orders, status, messages, reviews, commissions, products, questions).
  A new notification type needs: the trigger (or mock call), the `NotificationType` union and `notifications.types.<type>` in all three dictionaries.
- Commission transitions live in `COMMISSION_TRANSITIONS` (`src/lib/commissions/transitions.ts`); actions check them per role before writing.
- Free-text search goes through `search_products()` (pg_trgm) in Supabase mode and `fuzzyRank()` in demo mode; keep the two thresholds aligned (0.3).
- `TransitionLink` names only the clicked element for the view transition; the target page gives the same `view-transition-name` to its hero image.
- Collections and questions are plain tables with RLS; the public collection page is `/c/[slug]` and has its own `opengraph-image.tsx`.