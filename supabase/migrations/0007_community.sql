-- Stage 5: commissions, notifications (via triggers), fuzzy search, collections, Q&A, process steps.

-- --- Fuzzy search ---------------------------------------------------------------
create extension if not exists pg_trgm;
create index if not exists products_title_trgm_idx on public.products using gin (title gin_trgm_ops);

-- Candidate products for a free-text query: substring match or trigram similarity on the title.
create or replace function public.search_products(q text)
returns table (id uuid, score real)
language sql stable
as $$
  select p.id,
         greatest(
           similarity(p.title, q),
           word_similarity(q, p.title),
           case when p.title ilike '%' || q || '%' or p.description ilike '%' || q || '%' or array_to_string(p.tags, ' ') ilike '%' || q || '%' then 1.0 else 0.0 end
         )::real as score
  from public.products p
  where p.status = 'active'
    and (p.title % q
         or word_similarity(q, p.title) > 0.45
         or p.title ilike '%' || q || '%'
         or p.description ilike '%' || q || '%'
         or array_to_string(p.tags, ' ') ilike '%' || q || '%')
  order by score desc
  limit 200;
$$;

-- Titles closest to a query, used to build a "did you mean" suggestion.
create or replace function public.suggest_titles(q text)
returns table (title text, score real)
language sql stable
as $$
  select p.title, word_similarity(q, p.title)::real as score
  from public.products p
  where p.status = 'active'
  order by score desc
  limit 8;
$$;

-- --- Process steps ("how it's made") -----------------------------------------------
alter table public.products add column if not exists process jsonb not null default '[]';

-- --- Commissions (custom orders) ---------------------------------------------------
do $$ begin
  create type public.commission_status as enum ('new', 'quoted', 'accepted', 'declined', 'done');
exception when duplicate_object then null; end $$;

create table if not exists public.commissions (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid not null references public.profiles (id) on delete cascade,
  shop_id     uuid not null references public.shops (id) on delete cascade,
  product_id  uuid references public.products (id) on delete set null,
  title       text not null,
  description text not null default '',
  budget      integer check (budget is null or budget >= 0),
  deadline    date,
  status      public.commission_status not null default 'new',
  quote_price integer check (quote_price is null or quote_price >= 0),
  quote_days  integer check (quote_days is null or quote_days > 0),
  quote_note  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists commissions_buyer_idx on public.commissions (buyer_id, created_at desc);
create index if not exists commissions_shop_idx on public.commissions (shop_id, created_at desc);

alter table public.commissions enable row level security;
create policy "buyers and owners see commissions"
  on public.commissions for select to authenticated
  using (auth.uid() = buyer_id or public.owns_shop(shop_id) or public.is_admin());
create policy "buyers create commissions"
  on public.commissions for insert to authenticated
  with check (auth.uid() = buyer_id);
create policy "buyers and owners update commissions"
  on public.commissions for update to authenticated
  using (auth.uid() = buyer_id or public.owns_shop(shop_id))
  with check (auth.uid() = buyer_id or public.owns_shop(shop_id));

-- --- Notifications ---------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}',
  href       text not null default '',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
create policy "users see their notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "users mark their notifications read"
  on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete their notifications"
  on public.notifications for delete to authenticated using (auth.uid() = user_id);

alter publication supabase_realtime add table public.notifications;

-- Inserts happen only from triggers (security definer), so users cannot forge notifications.
create or replace function public.notify(p_user uuid, p_type text, p_payload jsonb, p_href text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, type, payload, href) values (p_user, p_type, coalesce(p_payload, '{}'::jsonb), coalesce(p_href, ''));
$$;

create or replace function public.notify_order_new() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from shops where id = new.shop_id;
  if v_owner is not null then
    perform notify(v_owner, 'order_new', jsonb_build_object('number', new.number, 'total', new.total), '/seller/orders/' || new.id);
  end if;
  return new;
end $$;
drop trigger if exists orders_notify_new on public.orders;
create trigger orders_notify_new after insert on public.orders for each row execute function public.notify_order_new();

create or replace function public.notify_order_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    perform notify(new.buyer_id, 'order_status', jsonb_build_object('number', new.number, 'status', new.status), '/orders/' || new.id);
  end if;
  return new;
end $$;
drop trigger if exists orders_notify_status on public.orders;
create trigger orders_notify_status after update on public.orders for each row execute function public.notify_order_status();

create or replace function public.notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_buyer uuid; v_owner uuid; v_recipient uuid;
begin
  select c.buyer_id, s.owner_id into v_buyer, v_owner from conversations c join shops s on s.id = c.shop_id where c.id = new.conversation_id;
  v_recipient := case when new.sender_id = v_buyer then v_owner else v_buyer end;
  if v_recipient is not null and v_recipient <> new.sender_id then
    perform notify(v_recipient, 'message', jsonb_build_object('preview', left(new.body, 80)), '/messages/' || new.conversation_id);
  end if;
  return new;
end $$;
drop trigger if exists messages_notify on public.messages;
create trigger messages_notify after insert on public.messages for each row execute function public.notify_message();

create or replace function public.notify_review() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_title text; v_slug text;
begin
  select s.owner_id, p.title, p.slug into v_owner, v_title, v_slug from products p join shops s on s.id = p.shop_id where p.id = new.product_id;
  if v_owner is not null and v_owner <> new.user_id then
    perform notify(v_owner, 'review', jsonb_build_object('title', v_title, 'rating', new.rating), '/product/' || v_slug || '#reviews');
  end if;
  return new;
end $$;
drop trigger if exists reviews_notify on public.reviews;
create trigger reviews_notify after insert on public.reviews for each row execute function public.notify_review();

create or replace function public.notify_commission() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from shops where id = new.shop_id;
  if tg_op = 'INSERT' then
    perform notify(v_owner, 'commission_new', jsonb_build_object('title', new.title), '/seller/commissions');
  elsif new.status is distinct from old.status then
    if new.status = 'accepted' then
      perform notify(v_owner, 'commission_accepted', jsonb_build_object('title', new.title), '/seller/commissions');
    else
      perform notify(new.buyer_id, 'commission_' || new.status::text, jsonb_build_object('title', new.title, 'price', new.quote_price), '/commissions');
    end if;
  end if;
  return new;
end $$;
drop trigger if exists commissions_notify on public.commissions;
create trigger commissions_notify after insert or update on public.commissions for each row execute function public.notify_commission();

create or replace function public.touch_commission() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists commissions_touch on public.commissions;
create trigger commissions_touch before update on public.commissions for each row execute function public.touch_commission();

-- Favourites: price drop and back in stock.
create or replace function public.notify_product_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if new.status <> 'active' then return new; end if;
  if new.price < old.price then
    for v_user in select user_id from favorites where product_id = new.id loop
      perform notify(v_user, 'price_drop', jsonb_build_object('title', new.title, 'price', new.price, 'oldPrice', old.price), '/product/' || new.slug);
    end loop;
  end if;
  if old.stock = 0 and new.stock > 0 then
    for v_user in select user_id from favorites where product_id = new.id loop
      perform notify(v_user, 'back_in_stock', jsonb_build_object('title', new.title), '/product/' || new.slug);
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists products_notify_change on public.products;
create trigger products_notify_change after update of price, stock on public.products for each row execute function public.notify_product_change();

-- --- Collections (public wishlists) --------------------------------------------------
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint collections_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table if not exists public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  note          text not null default '',
  added_at      timestamptz not null default now(),
  primary key (collection_id, product_id)
);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
create policy "public or own collections are visible"
  on public.collections for select using (is_public or auth.uid() = owner_id);
create policy "users manage their collections"
  on public.collections for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "items follow their collection"
  on public.collection_items for select
  using (exists (select 1 from public.collections c where c.id = collection_id and (c.is_public or c.owner_id = auth.uid())));
create policy "owners manage collection items"
  on public.collection_items for all to authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));

-- --- Product questions & answers -----------------------------------------------------
create table if not exists public.product_questions (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  answer      text,
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists product_questions_product_idx on public.product_questions (product_id, created_at desc);

alter table public.product_questions enable row level security;
create policy "questions are viewable by everyone" on public.product_questions for select using (true);
create policy "users ask questions" on public.product_questions for insert to authenticated with check (auth.uid() = user_id);
create policy "shop owners answer questions"
  on public.product_questions for update to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_shop(p.shop_id)))
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_shop(p.shop_id)));
create policy "askers delete their questions" on public.product_questions for delete to authenticated using (auth.uid() = user_id);

create or replace function public.notify_question() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_title text; v_slug text;
begin
  select s.owner_id, p.title, p.slug into v_owner, v_title, v_slug from products p join shops s on s.id = p.shop_id where p.id = new.product_id;
  if tg_op = 'INSERT' then
    if v_owner is not null and v_owner <> new.user_id then
      perform notify(v_owner, 'question', jsonb_build_object('title', v_title, 'preview', left(new.body, 80)), '/product/' || v_slug || '#questions');
    end if;
  elsif new.answer is not null and old.answer is distinct from new.answer then
    perform notify(new.user_id, 'answer', jsonb_build_object('title', v_title, 'preview', left(new.answer, 80)), '/product/' || v_slug || '#questions');
  end if;
  return new;
end $$;
drop trigger if exists product_questions_notify on public.product_questions;
create trigger product_questions_notify after insert or update on public.product_questions for each row execute function public.notify_question();
