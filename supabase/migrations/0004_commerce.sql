-- Lavka stage 2: reviews, orders, promo codes, chat, product views, moderation flags.

-- Moderation ----------------------------------------------------------------
alter table public.shops add column if not exists is_hidden boolean not null default false;

-- Reviews -------------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  body       text not null default '',
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id, created_at desc);

alter table public.reviews enable row level security;
create policy "reviews are viewable by everyone"
  on public.reviews for select using (true);
create policy "users write their own reviews"
  on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "users edit their own reviews"
  on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users or admins delete reviews"
  on public.reviews for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- Promo codes ---------------------------------------------------------------
create table public.promo_codes (
  code       text primary key,
  percent    smallint not null check (percent between 1 and 90),
  active     boolean not null default true,
  expires_at timestamptz
);
insert into public.promo_codes (code, percent) values ('LAVKA10', 10), ('HANDMADE15', 15), ('WELCOME5', 5);

alter table public.promo_codes enable row level security;
create policy "active promo codes are readable"
  on public.promo_codes for select using (active and (expires_at is null or expires_at > now()));
create policy "admins manage promo codes"
  on public.promo_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders --------------------------------------------------------------------
create type public.order_status as enum ('new', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type public.payment_method as enum ('card_demo', 'cod');
create type public.payment_status as enum ('paid', 'pending', 'refunded');

create sequence public.order_number_seq start 1001;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  number         text not null unique default ('LV-' || nextval('public.order_number_seq')::text),
  buyer_id       uuid not null references public.profiles (id) on delete restrict,
  shop_id        uuid not null references public.shops (id) on delete restrict,
  status         public.order_status not null default 'new',
  subtotal       integer not null check (subtotal >= 0),
  discount       integer not null default 0 check (discount >= 0),
  total          integer not null check (total >= 0),
  promo_code     text,
  delivery       jsonb not null default '{}'::jsonb,
  payment_method public.payment_method not null default 'card_demo',
  payment_status public.payment_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index orders_shop_idx  on public.orders (shop_id, created_at desc);

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title      text not null,
  price      integer not null check (price >= 0),
  quantity   integer not null check (quantity > 0),
  image_url  text
);
create index order_items_order_idx on public.order_items (order_id);

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "buyers and shop owners see orders"
  on public.orders for select to authenticated
  using (auth.uid() = buyer_id or public.owns_shop(shop_id) or public.is_admin());
create policy "shop owners update order status"
  on public.orders for update to authenticated
  using (public.owns_shop(shop_id) or public.is_admin()) with check (public.owns_shop(shop_id) or public.is_admin());
create policy "order items follow their order"
  on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or public.owns_shop(o.shop_id) or public.is_admin())));

-- Placing an order is atomic: validates stock, decrements it, writes the order and its items.
-- Called with the buyer's JWT; runs as definer so it can bypass insert policies and lock rows.
create or replace function public.place_order(
  p_shop_id uuid,
  p_items jsonb,            -- [{ "product_id": uuid, "quantity": int }]
  p_delivery jsonb,
  p_payment_method public.payment_method,
  p_promo_code text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_buyer uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_subtotal integer := 0;
  v_percent integer := 0;
  v_discount integer := 0;
  v_qty integer;
begin
  if v_buyer is null then
    raise exception 'Not authenticated';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order has no items';
  end if;

  if p_promo_code is not null then
    select percent into v_percent from public.promo_codes
    where code = upper(p_promo_code) and active and (expires_at is null or expires_at > now());
    if not found then
      raise exception 'Promo code is not valid';
    end if;
  end if;

  insert into public.orders (buyer_id, shop_id, subtotal, discount, total, promo_code, delivery, payment_method, payment_status)
  values (v_buyer, p_shop_id, 0, 0, 0, upper(p_promo_code), p_delivery, p_payment_method,
          case when p_payment_method = 'card_demo' then 'paid' else 'pending' end)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::int;
    select * into v_product from public.products
    where id = (v_item ->> 'product_id')::uuid and shop_id = p_shop_id and status = 'active'
    for update;
    if not found then
      raise exception 'Product % is not available', v_item ->> 'product_id';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Not enough stock for %', v_product.title;
    end if;
    update public.products set stock = stock - v_qty where id = v_product.id;
    insert into public.order_items (order_id, product_id, title, price, quantity, image_url)
    values (v_order_id, v_product.id, v_product.title, v_product.price, v_qty,
            (select url from public.product_images where product_id = v_product.id order by sort_order limit 1));
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_discount := (v_subtotal * v_percent) / 100;
  update public.orders set subtotal = v_subtotal, discount = v_discount, total = v_subtotal - v_discount
  where id = v_order_id;
  return v_order_id;
end;
$$;

-- Chat ----------------------------------------------------------------------
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.profiles (id) on delete cascade,
  shop_id         uuid not null references public.shops (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  unique (buyer_id, shop_id)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.is_conversation_participant(conv uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversations c
    join public.shops s on s.id = c.shop_id
    where c.id = conv and (c.buyer_id = auth.uid() or s.owner_id = auth.uid())
  );
$$;

create or replace function public.bump_conversation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.bump_conversation();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "participants see conversations"
  on public.conversations for select to authenticated
  using (buyer_id = auth.uid() or public.owns_shop(shop_id) or public.is_admin());
create policy "buyers start conversations"
  on public.conversations for insert to authenticated with check (buyer_id = auth.uid());
create policy "participants read messages"
  on public.messages for select to authenticated using (public.is_conversation_participant(conversation_id));
create policy "participants send messages"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));
create policy "recipients mark messages read"
  on public.messages for update to authenticated
  using (public.is_conversation_participant(conversation_id)) with check (public.is_conversation_participant(conversation_id));

alter publication supabase_realtime add table public.messages;

-- Product views (daily counters for analytics) ------------------------------
create table public.product_views (
  product_id uuid not null references public.products (id) on delete cascade,
  day        date not null default current_date,
  views      integer not null default 0,
  primary key (product_id, day)
);

alter table public.product_views enable row level security;
create policy "shop owners read their product views"
  on public.product_views for select to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (public.owns_shop(p.shop_id) or public.is_admin())));

-- Anyone (including guests) can bump a counter; the function runs as definer.
create or replace function public.record_product_view(p_product_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  insert into public.product_views (product_id, day, views)
  values (p_product_id, current_date, 1)
  on conflict (product_id, day) do update set views = public.product_views.views + 1;
$$;
grant execute on function public.record_product_view(uuid) to anon, authenticated;

-- Admin-only aggregate helpers ----------------------------------------------
create or replace function public.admin_counts()
returns table (users bigint, sellers bigint, shops bigint, products bigint, active_products bigint, orders bigint, revenue bigint, reviews bigint, messages bigint)
language sql
stable
security definer set search_path = public
as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where role = 'seller'),
    (select count(*) from public.shops),
    (select count(*) from public.products),
    (select count(*) from public.products where status = 'active'),
    (select count(*) from public.orders where status <> 'cancelled'),
    (select coalesce(sum(total), 0) from public.orders where status <> 'cancelled'),
    (select count(*) from public.reviews),
    (select count(*) from public.messages)
  where public.is_admin();
$$;

