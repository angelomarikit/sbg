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
3. Set environment variables locally and on Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### First admin user

1. In Supabase Auth, create a user (email/password). Do not enable public signup for admin.
2. Insert a profile row:

```sql
insert into public.admin_profiles (id, email, role)
values ('YOUR_AUTH_USER_UUID', 'you@example.com', 'admin');
```

3. Sign in at `/admin/login`.

## Payment QR

1. Open **Admin → Payments**.
2. Add GCash/Maya/bank method with account details and QR image URL (upload via **Admin → Media** to `public-media` or `payment-qr` bucket).

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
5. Add the same Supabase env vars.
6. SPA routing is handled by [`vercel.json`](vercel.json).

## Brand assets

Original files remain in the project root. Organized copies live under [`public/assets/`](public/assets/). Update paths via admin media uploads and CMS section image URLs.

## Compliance

Testimonials with medical/treatment claims remain **pending** until approved in **Admin → Testimonials**. Product pages include **NO APPROVED THERAPEUTIC CLAIMS** disclaimer text.

## Edge functions

Optional Supabase Edge Function stub: [`supabase/functions/create-order`](supabase/functions/create-order). The app uses PostgreSQL RPC (`create_order`, `get_checkout_quote`, `submit_payment_proof`, `order_status_lookup`) by default.
