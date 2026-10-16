-- Salveo Barley Grass — initial schema, RLS, RPC helpers

create extension if not exists "pgcrypto";

-- Admin profiles
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  description text,
  regular_price numeric(12,2) not null check (regular_price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_archived boolean not null default false,
  seo_title text,
  seo_description text,
  specifications jsonb,
  usage_notes text,
  ingredients text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text,
  public_url text,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  regular_total numeric(12,2) not null,
  promotional_price numeric(12,2) not null,
  label text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  image_price_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotion_items (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null default 1 check (quantity > 0)
);

create table if not exists public.site_pages (
  id text primary key,
  title text not null,
  slug text not null unique
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  page_id text not null references public.site_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  title text,
  subtitle text,
  body text,
  content_json jsonb,
  image_url text,
  display_order int not null default 0,
  is_visible boolean not null default true,
  publish_status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, section_key)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  category text not null,
  storage_path text,
  public_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  quote text,
  image_url text,
  sort_order int not null default 0,
  is_visible boolean not null default false,
  approval_status text not null default 'pending_review',
  requires_compliance_review boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_holder text,
  account_number text,
  qr_image_url text,
  instructions text,
  is_active boolean not null default true,
  display_order int not null default 0
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null default 'Salveo Barley Grass',
  logo_url text,
  contact_phone text,
  contact_email text,
  messenger_url text,
  shipping_fee_flat numeric(12,2) not null default 150,
  free_shipping_threshold numeric(12,2),
  footer_description text,
  disclaimer text,
  seo_default_title text,
  seo_default_description text,
  social_facebook text,
  social_instagram text,
  policies jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique,
  idempotency_key text unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_address jsonb not null,
  shipping_fee numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null,
  discount_total numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null,
  payment_method_id uuid references public.payment_methods(id),
  payment_status text not null default 'awaiting_payment',
  fulfillment_status text not null default 'pending',
  admin_notes text,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  promotion_id uuid references public.promotions(id),
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null
);

create table if not exists public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method_id uuid references public.payment_methods(id),
  receipt_storage_path text,
  transaction_reference text,
  submitted_at timestamptz not null default now(),
  review_status text not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status_type text not null,
  old_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_reference on public.orders(public_reference);
create index if not exists idx_orders_payment_status on public.orders(payment_status);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles ap
    where ap.id = auth.uid() and ap.role in ('admin', 'staff')
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
for each row execute function public.touch_updated_at();

-- RLS
alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_items enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.payment_methods enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.order_status_history enable row level security;
alter table public.activity_logs enable row level security;

-- Public read policies
create policy "public read active products" on public.products for select using (is_active = true and is_archived = false);
create policy "public read product images" on public.product_images for select using (true);
create policy "public read active promotions" on public.promotions for select using (is_active = true);
create policy "public read promotion items" on public.promotion_items for select using (true);
create policy "public read published sections" on public.site_sections for select using (publish_status = 'published' and is_visible = true);
create policy "public read visible faqs" on public.faqs for select using (is_visible = true);
create policy "public read approved testimonials" on public.testimonials for select using (is_visible = true and approval_status = 'approved');
create policy "public read active payment methods" on public.payment_methods for select using (is_active = true);
create policy "public read site settings" on public.site_settings for select using (true);
create policy "public read categories" on public.categories for select using (true);

-- Admin all
create policy "admin all products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all product_images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all promotion_items" on public.promotion_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all sections" on public.site_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all faqs" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all payment_methods" on public.payment_methods for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all site_settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all order_items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all payment_submissions" on public.payment_submissions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all activity" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read profiles" on public.admin_profiles for select using (public.is_admin());

-- Quote + order RPC (security definer)
create or replace function public.get_checkout_quote(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric := 0;
  v_shipping numeric := 150;
  v_threshold numeric;
  item jsonb;
  v_product_id uuid;
  v_qty int;
  v_price numeric;
begin
  select shipping_fee_flat, free_shipping_threshold into v_shipping, v_threshold
  from public.site_settings limit 1;
  if v_shipping is null then v_shipping := 150; end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'quantity')::int, 1);
    select coalesce(sale_price, regular_price) into v_price from public.products where id = v_product_id and is_active = true;
    if v_price is null then
      raise exception 'Product unavailable: %', v_product_id;
    end if;
    v_subtotal := v_subtotal + (v_price * v_qty);
  end loop;

  if v_threshold is not null and v_subtotal >= v_threshold then
    v_shipping := 0;
  end if;

  return jsonb_build_object(
    'subtotal', v_subtotal,
    'discount_total', 0,
    'shipping_fee', v_shipping,
    'grand_total', v_subtotal + v_shipping
  );
end;
$$;

create or replace function public.create_order(
  p_idempotency_key text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_address jsonb,
  p_payment_method_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
  v_order_id uuid;
  v_ref text;
  v_quote jsonb;
  item jsonb;
  v_product_id uuid;
  v_qty int;
  v_price numeric;
  v_name text;
begin
  select id into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if v_existing is not null then
    return (select jsonb_build_object('id', id, 'public_reference', public_reference, 'grand_total', grand_total, 'payment_status', payment_status) from public.orders where id = v_existing);
  end if;

  v_quote := public.get_checkout_quote(p_items);
  v_ref := 'SBG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    public_reference, idempotency_key, customer_name, customer_email, customer_phone,
    delivery_address, shipping_fee, subtotal, discount_total, grand_total,
    payment_method_id, payment_status
  ) values (
    v_ref, p_idempotency_key, p_customer_name, p_customer_email, p_customer_phone,
    p_delivery_address,
    (v_quote->>'shipping_fee')::numeric,
    (v_quote->>'subtotal')::numeric,
    (v_quote->>'discount_total')::numeric,
    (v_quote->>'grand_total')::numeric,
    p_payment_method_id,
    'awaiting_payment'
  ) returning id into v_order_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'quantity')::int, 1);
    select name, coalesce(sale_price, regular_price) into v_name, v_price
    from public.products where id = v_product_id;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, line_total)
    values (v_order_id, v_product_id, v_name, v_qty, v_price, v_price * v_qty);
  end loop;

  insert into public.order_status_history (order_id, status_type, new_status, note)
  values (v_order_id, 'payment', 'awaiting_payment', 'Order created');

  return (select jsonb_build_object('id', id, 'public_reference', public_reference, 'grand_total', grand_total, 'payment_status', payment_status) from public.orders where id = v_order_id);
end;
$$;

create or replace function public.submit_payment_proof(
  p_order_id uuid,
  p_payment_method_id uuid,
  p_receipt_path text,
  p_transaction_reference text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.payment_submissions (order_id, payment_method_id, receipt_storage_path, transaction_reference)
  values (p_order_id, p_payment_method_id, p_receipt_path, p_transaction_reference);

  update public.orders
  set payment_status = 'payment_review', updated_at = now()
  where id = p_order_id and payment_status in ('awaiting_payment', 'rejected');

  insert into public.order_status_history (order_id, status_type, old_status, new_status, note)
  values (p_order_id, 'payment', 'awaiting_payment', 'payment_review', 'Payment proof submitted');
end;
$$;

create or replace function public.order_status_lookup(p_reference text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
  where public_reference = p_reference
    and regexp_replace(customer_phone, '\s', '', 'g') = regexp_replace(p_phone, '\s', '', 'g')
  limit 1;

  if v_order.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'reference', v_order.public_reference,
    'payment_status', v_order.payment_status,
    'fulfillment_status', v_order.fulfillment_status,
    'grand_total', v_order.grand_total
  );
end;
$$;

grant execute on function public.get_checkout_quote(jsonb) to anon, authenticated;
grant execute on function public.create_order(text, text, text, text, jsonb, uuid, jsonb) to anon, authenticated;
grant execute on function public.submit_payment_proof(uuid, uuid, text, text) to anon, authenticated;
grant execute on function public.order_status_lookup(text, text) to anon, authenticated;
