# Lavka — handmade goods marketplace

> A portfolio project: a niche marketplace where Ukrainian makers sell ceramics, jewelry, textiles, woodwork, candles, art and leather goods. UI in Ukrainian, code in English.

**Live demo:** https://lavka-green.vercel.app · **Repository:** https://github.com/ValentynKoval/lavka

![Lavka home page](docs/screenshots/home.png)

## What it does

| Area | Features |
| --- | --- |
| Storefront | Home page with curated picks, collections and featured makers; category tiles; responsive design system built for a "handmade" feel (linen/clay palette, Playfair Display + Manrope). |
| Catalog | Full-text search, filters by category, material, maker region, price range and stock; four sort orders; URL-driven state (shareable links), pagination. |
| Product | Gallery with thumbnails, price with discounts, stock badges, materials/region facts, related products, maker story block. |
| Makers | Public shop page with cover, avatar, story and all products; makers directory. |
| Buyer | Favourites and cart persisted in the browser and synced to the account after sign-in; cart grouped by maker with totals and discounts. |
| Auth | E-mail + password sign-up / sign-in (Supabase Auth), roles buyer / seller / admin. |
| Seller cabinet | Open a shop (onboarding), dashboard with stock alerts, product CRUD with multi-image upload to Supabase Storage, inline stock editing, drafts/archive. |
| Data | Postgres schema with RLS policies, triggers and a storage bucket; migrations in the repo; seed script with 10 shops and 60+ products. |
| Demo mode | Without Supabase keys the app runs on the same data through an in-memory repository layer, so the UI works anywhere. |

Stage 2 (planned): chat with the maker, Stripe test checkout, orders, reviews, admin moderation, analytics.

## Screenshots

| Catalog with filters | Product page |
| --- | --- |
| ![Catalog](docs/screenshots/catalog.png) | ![Product](docs/screenshots/product.png) |

| Maker shop | Makers directory |
| --- | --- |
| ![Shop](docs/screenshots/shop.png) | ![Makers](docs/screenshots/shops.png) |

## Tech stack

- **Next.js 16** (App Router, React Server Components, Server Actions, `proxy.ts`), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4** with custom design tokens, **lucide-react** icons
- **Supabase**: Postgres, Auth, Storage, Row Level Security (`@supabase/ssr` for cookie-based sessions)
- **Zustand** (persisted client state), **Zod** (validation)
- **Vitest** for unit tests, **ESLint** (next/core-web-vitals + typescript)
- **Vercel** for hosting

### Architecture notes

```
src/
  app/            routes (home, catalog, product, shop, shops, favorites, cart, login, register, seller/*)
  components/     ui primitives, layout, product, catalog, cart, auth, seller, home sections
  data/           taxonomy (categories, materials, regions) and demo dataset
  lib/
    catalog/      pure filter / sort / pagination / URL-param logic (tested)
    cart/         pure cart math (tested)
    repositories/ CatalogRepository, SellerRepository, UserDataRepository, AuthService
      mock/       in-memory implementation on demo data
      supabase/   Postgres implementation
    stores/       Zustand stores (cart, favourites)
    supabase/     server/browser clients, DB row types
supabase/
  migrations/     0001 schema, 0002 RLS, 0003 storage
  seed.ts         idempotent seed using the service role key
scripts/          demo image downloader, migration runner
```

Pages talk to repository interfaces, never to Supabase directly, so the same screens run on demo data or on a real database.

## Getting started

```bash
git clone https://github.com/ValentynKoval/lavka.git
cd lavka
npm install
cp .env.example .env.local   # leave empty for demo mode
npm run dev                  # http://localhost:3000
```

Demo seller account (demo mode and seeded database): `olena@lavka.demo` / `demo1234` (other makers: `marta@`, `iryna@`, `vasyl@`, `halyna@`, `petro@`, `sofia@`, `andrii@`, `taras@`, `oksana@lavka.demo`).

### Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) and copy **Project URL**, **anon/publishable key** and **service_role/secret key** into `.env.local` (see `.env.example`).
2. Apply migrations — either paste `supabase/migrations/*.sql` into the SQL editor in order, or set `SUPABASE_DB_PASSWORD` and run:
   ```bash
   npm run db:migrate
   ```
3. Seed demo data (creates confirmed demo users, shops and products):
   ```bash
   npm run db:seed
   ```
4. For a frictionless demo, disable "Confirm email" in Authentication → Providers → Email.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run dev:demo` | Dev server (the latter forces demo data even with keys present) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run test` | Vitest unit tests (filters, URL params, cart, utils) |
| `npm run build` | Production build |
| `npm run check` | All of the above in sequence |
| `npm run demo:images` | Re-download demo photos from Unsplash into `public/demo` |
| `npm run db:migrate` / `npm run db:seed` | Apply migrations / seed Supabase |

### Environment variables

| Variable | Where used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | seed script only (server-side secret) |
| `SUPABASE_DB_PASSWORD` | migration runner only |
| `LAVKA_DATA_SOURCE=demo` | optional, forces demo repositories |
| `NEXT_PUBLIC_SITE_URL` | optional, for Open Graph metadata |

## Credits

Photos: [Unsplash](https://unsplash.com) (Unsplash License). Built with Claude Code.

## License

MIT
