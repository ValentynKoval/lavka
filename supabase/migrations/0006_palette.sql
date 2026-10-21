-- Stage 4: dominant colours per product for "shop by colour".
alter table public.products
  add column if not exists palette    text[] not null default '{}',
  add column if not exists color_tags text[] not null default '{}';

create index if not exists products_color_tags_idx on public.products using gin (color_tags);
