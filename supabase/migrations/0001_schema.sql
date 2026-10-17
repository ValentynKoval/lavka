-- Lavka: core schema (profiles, shops, categories, products, images, favorites, cart).
-- Prices are stored in kopiykas (1/100 UAH) as integers.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.product_status as enum ('draft', 'active', 'archived');

-- Profiles -------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  avatar_url  text,
  role        public.user_role not null default 'buyer',
  created_at  timestamptz not null default now()
);

-- Shops ----------------------------------------------------------------------
create table public.shops (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references public.profiles (id) on delete cascade,
  slug        text not null unique,
  name        text not null,
  tagline     text not null default '',
  story       text not null default '',
  region_slug text not null default '',
  city        text not null default '',
  avatar_url  text not null default '',
  cover_url   text not null default '',
  created_at  timestamptz not null default now(),
  constraint shops_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- Categories (reference data, seeded below) ----------------------------------
create table public.categories (
  slug       text primary key,
  name       text not null,
  sort_order int  not null default 0
);

insert into public.categories (slug, name, sort_order) values
  ('ceramics', 'Кераміка', 1),
  ('jewelry',  'Прикраси', 2),
  ('textile',  'Текстиль', 3),
  ('wood',     'Дерево', 4),
  ('candles',  'Свічки та аромати', 5),
  ('art',      'Ілюстрації', 6),
  ('leather',  'Шкіра', 7),
  ('home',     'Для дому', 8);

-- Products -------------------------------------------------------------------
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  shop_id          uuid not null references public.shops (id) on delete cascade,
  slug             text not null unique,
  title            text not null,
  description      text not null default '',
  category_slug    text not null references public.categories (slug),
  materials        text[] not null default '{}',
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  stock            integer not null default 0 check (stock >= 0),
  status           public.product_status not null default 'draft',
  tags             text[] not null default '{}',
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index products_shop_idx     on public.products (shop_id);
create index products_status_idx   on public.products (status, created_at desc);
create index products_category_idx on public.products (category_slug) where status = 'active';
create index products_price_idx    on public.products (price) where status = 'active';
create index products_materials_idx on public.products using gin (materials);
create index products_search_idx   on public.products using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || array_to_string(tags, ' '))
);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  sort_order int  not null default 0
);

create index product_images_product_idx on public.product_images (product_id, sort_order);

-- Favorites & cart -----------------------------------------------------------
create table public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.cart_items (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity   integer not null check (quantity > 0 and quantity <= 99),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Triggers -------------------------------------------------------------------

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Opening a shop promotes the owner to seller.
create or replace function public.promote_shop_owner()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set role = 'seller' where id = new.owner_id and role = 'buyer';
  return new;
end;
$$;

create trigger on_shop_created
  after insert on public.shops
  for each row execute function public.promote_shop_owner();

-- Users may edit their profile but never their own role (only service role / triggers can).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and current_setting('request.jwt.claim.role', true) = 'authenticated' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger on_profile_update
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
