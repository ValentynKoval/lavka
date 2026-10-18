-- Fix: payment_status CASE expression must be cast to the enum type.
create or replace function public.place_order(
  p_shop_id uuid,
  p_items jsonb,
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
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order has no items';
  end if;

  if p_promo_code is not null and p_promo_code <> '' then
    select percent into v_percent from public.promo_codes
    where code = upper(p_promo_code) and active and (expires_at is null or expires_at > now());
    if not found then
      raise exception 'Promo code is not valid';
    end if;
  end if;

  insert into public.orders (buyer_id, shop_id, subtotal, discount, total, promo_code, delivery, payment_method, payment_status)
  values (
    v_buyer, p_shop_id, 0, 0, 0,
    nullif(upper(p_promo_code), ''),
    coalesce(p_delivery, '{}'::jsonb),
    p_payment_method,
    (case when p_payment_method = 'card_demo' then 'paid' else 'pending' end)::public.payment_status
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::int;
    if v_qty is null or v_qty <= 0 or v_qty > 99 then
      raise exception 'Invalid quantity';
    end if;
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
