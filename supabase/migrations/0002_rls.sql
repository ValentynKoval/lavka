-- Lavka: row level security policies.

alter table public.profiles       enable row level security;
alter table public.shops          enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.favorites      enable row level security;
alter table public.cart_items     enable row level security;

-- Helpers --------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_shop(shop uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.shops where id = shop and owner_id = auth.uid());
$$;

-- Profiles: public read (names/avatars are shown on shop pages), self update.
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "users update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Categories: read-only reference data.
create policy "categories are viewable by everyone"
  on public.categories for select using (true);

-- Shops: public read; one shop per authenticated user; owner edits.
create policy "shops are viewable by everyone"
  on public.shops for select using (true);
create policy "authenticated users open their own shop"
  on public.shops for insert to authenticated with check (auth.uid() = owner_id);
create policy "owners update their shop"
  on public.shops for update to authenticated using (auth.uid() = owner_id or public.is_admin()) with check (auth.uid() = owner_id or public.is_admin());
create policy "owners delete their shop"
  on public.shops for delete to authenticated using (auth.uid() = owner_id or public.is_admin());

-- Products: active products are public; owners see and manage all of theirs.
create policy "active products are viewable by everyone"
  on public.products for select using (status = 'active' or public.owns_shop(shop_id) or public.is_admin());
create policy "owners insert products into their shop"
  on public.products for insert to authenticated with check (public.owns_shop(shop_id));
create policy "owners update their products"
  on public.products for update to authenticated using (public.owns_shop(shop_id) or public.is_admin()) with check (public.owns_shop(shop_id) or public.is_admin());
create policy "owners delete their products"
  on public.products for delete to authenticated using (public.owns_shop(shop_id) or public.is_admin());

-- Product images follow their product.
create policy "images of visible products are viewable"
  on public.product_images for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.owns_shop(p.shop_id) or public.is_admin()))
  );
create policy "owners manage images of their products"
  on public.product_images for all to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (public.owns_shop(p.shop_id) or public.is_admin())))
  with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_shop(p.shop_id) or public.is_admin())));

-- Favorites and cart are private to their owner.
create policy "users manage their favorites"
  on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage their cart"
  on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
