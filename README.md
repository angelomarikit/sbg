# Salveo Barley Grass — Affiliate E-Commerce

Premium React + TypeScript storefront with Supabase backend, manual QR checkout, and admin CMS.

## Stack

- Vite, React 19, TypeScript (strict)
- Tailwind CSS v4, Motion, shadcn-style UI primitives
- Supabase (Auth, Postgres, Storage, RLS, RPC)
- TanStack Query, React Hook Form, Zod
- Deploy target: Vercel

## Local development

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Without Supabase env vars, the public site uses local catalog/section fallbacks and a demo checkout stored in `localStorage`.

## Supabase setup

1. Create or use your existing Supabase project.
2. Run migrations in order from [`supabase/migrations/`](supabase/migrations/):
   - `001_initial_schema.sql`
   - `002_seed_content.sql`
   - `003_storage.sql`
   - `004_media_assets_policies.sql`
   - `005_cod_payment.sql`
3. Set environment variables locally and on Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` — your public site URL (required for Facebook/Messenger link previews)

### First admin user

1. In Supabase Auth, create a user (email/password). Do not enable public signup for admin.
2. Insert a profile row:

```sql
insert into public.admin_profiles (id, email, role)
values ('YOUR_AUTH_USER_UUID', 'you@example.com', 'admin');
```

3. Sign in at `/admin/login`.

## Image uploads (Supabase Storage)

While logged in as admin, use **Upload image** on:

- **Products** → edit product → gallery (bucket `public-media`)
- **Landing Page** → section image
- **Promotions** → promo artwork
- **Testimonials** → poster image
- **Payments** → QR code (bucket `payment-qr`)
- **Settings** → site logo
- **Media** → general library

Ensure migrations `003_storage.sql` and `004_media_assets_policies.sql` are applied.

## Checkout payment

Checkout uses **Cash on Delivery (COD)** only — no GCash QR or receipt upload on the site.

1. Run migration `005_cod_payment.sql` on existing Supabase projects.
2. Optional: edit COD instructions under **Admin → Payments**.

## Shipping fee

Configure **Admin → Settings** flat shipping fee (used by `get_checkout_quote` RPC).

## Production build

```bash
npm run lint
npm test
npm run build
```

## Vercel deployment

1. Import the repository/folder into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the same env vars, including `VITE_SITE_URL=https://your-domain.com`.
6. SPA routing is handled by [`vercel.json`](vercel.json).

Default share preview image: `public/assets/og/og-share.jpg` (Open Graph + Twitter `summary_large_image`).

## Brand assets

Original files remain in the project root. Organized copies live under [`public/assets/`](public/assets/). Update paths via admin media uploads and CMS section image URLs.

## Compliance

Testimonials with medical/treatment claims remain **pending** until approved in **Admin → Testimonials**. Product pages include **NO APPROVED THERAPEUTIC CLAIMS** disclaimer text.

## Edge functions

Optional Supabase Edge Function stub: [`supabase/functions/create-order`](supabase/functions/create-order). The app uses PostgreSQL RPC (`create_order`, `get_checkout_quote`, `submit_payment_proof`, `order_status_lookup`) by default.
