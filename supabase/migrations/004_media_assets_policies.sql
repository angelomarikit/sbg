-- media_assets had RLS enabled without policies; allow admins to manage library rows

create policy "admin all media_assets"
on public.media_assets for all
using (public.is_admin())
with check (public.is_admin());

create policy "public read media_assets"
on public.media_assets for select
using (true);
