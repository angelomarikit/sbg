insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('payment-qr', 'payment-qr', true),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

create policy "public read public-media"
on storage.objects for select
using (bucket_id = 'public-media');

create policy "admin manage public-media"
on storage.objects for all
using (bucket_id = 'public-media' and public.is_admin())
with check (bucket_id = 'public-media' and public.is_admin());

create policy "public read payment qr"
on storage.objects for select
using (bucket_id = 'payment-qr');

create policy "admin manage payment qr"
on storage.objects for all
using (bucket_id = 'payment-qr' and public.is_admin())
with check (bucket_id = 'payment-qr' and public.is_admin());

create policy "admin read receipts"
on storage.objects for select
using (bucket_id = 'payment-receipts' and public.is_admin());

create policy "upload receipts"
on storage.objects for insert
with check (bucket_id = 'payment-receipts');
