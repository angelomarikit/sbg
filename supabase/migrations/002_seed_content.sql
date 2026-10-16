insert into public.site_pages (id, title, slug) values ('home', 'Home', 'home')
on conflict (id) do nothing;

insert into public.categories (id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Salveo Barley Grass', 'sbg', 1),
  ('11111111-1111-1111-1111-111111111102', 'Salveo Supplements', 'supplements', 2)
on conflict (slug) do nothing;

insert into public.site_settings (brand_name, logo_url, shipping_fee_flat, footer_description, disclaimer)
select 'Salveo Barley Grass', '/assets/brand/logo.png', 150,
  'Authorized Salveo affiliate — explore products and packages for everyday wellness.',
  'Food supplements are not substitutes for a balanced diet. NO APPROVED THERAPEUTIC CLAIMS where applicable.'
where not exists (select 1 from public.site_settings limit 1);

-- Products (UUIDs fixed for seed references)
insert into public.products (id, name, slug, sku, category_id, short_description, description, regular_price, sale_price, stock_quantity, is_active, is_featured, specifications, ingredients, usage_notes)
values
  ('22222222-2222-2222-2222-222222222201', 'Krio Pure Antarctic Krill Oil — 60 Softgels', 'krio-krill-oil-60', 'KRIO-60', '11111111-1111-1111-1111-111111111102', 'Dietary supplement with EPA, DHA, and astaxanthin.', 'NO APPROVED THERAPEUTIC CLAIMS.', 2499, null, 50, true, false, '{"count":"60 softgels"}'::jsonb, 'Krill oil', 'Follow label directions.'),
  ('22222222-2222-2222-2222-222222222202', 'SBG On The Go — 12 Sachets', 'sbg-on-the-go-12', 'SBG-OTG-12', '11111111-1111-1111-1111-111111111101', '100% organic barley grass powder sachets.', 'NO APPROVED THERAPEUTIC CLAIMS.', 899, null, 100, true, true, '{"sachets":12}'::jsonb, 'Barley grass powder', 'Mix with water per package.'),
  ('22222222-2222-2222-2222-222222222203', 'SBG Capsules — 120 Veggie Caps', 'sbg-capsules-120', 'SBG-CAP-120', '11111111-1111-1111-1111-111111111101', '500 mg veggie capsules.', 'NO APPROVED THERAPEUTIC CLAIMS.', 1899, 1699, 80, true, true, '{"capsules":120}'::jsonb, 'Barley grass leaf powder', 'Take as directed on label.'),
  ('22222222-2222-2222-2222-222222222204', 'SBG Trial Pack — 80g', 'sbg-trial-pack-80g', 'SBG-TRIAL-80', '11111111-1111-1111-1111-111111111101', 'Powder trial pack 80g.', 'NO APPROVED THERAPEUTIC CLAIMS.', 599, null, 120, true, false, '{"weight":"80g"}'::jsonb, 'Barley grass powder', 'Mix with water per package.'),
  ('22222222-2222-2222-2222-222222222205', 'TheoCoBar Choco Powder Drink Mix — 250g', 'theocobar-250g', 'TCB-250', '11111111-1111-1111-1111-111111111101', 'Cacao, coconut sugar, organic SBG.', 'NO APPROVED THERAPEUTIC CLAIMS.', 799, null, 60, true, false, '{"net":"250g"}'::jsonb, 'See packaging', 'Serving suggestion on pack.'),
  ('22222222-2222-2222-2222-222222222206', 'ZAP Trace Mineral Drops — 60 mL', 'zap-trace-minerals-60ml', 'ZAP-60', '11111111-1111-1111-1111-111111111102', 'Trace mineral drops from seawater.', 'NO APPROVED THERAPEUTIC CLAIMS.', 699, null, 40, true, false, '{"volume":"60mL"}'::jsonb, 'Trace minerals', 'Use as directed.'),
  ('22222222-2222-2222-2222-222222222207', 'SBG Powder Jar — 240g', 'sbg-powder-jar-240g', 'SBG-JAR-240', '11111111-1111-1111-1111-111111111101', '100% organic barley grass powder jar.', 'NO APPROVED THERAPEUTIC CLAIMS.', 2499, null, 30, true, true, '{"weight":"240g"}'::jsonb, 'Barley grass powder', 'Mix with water per package.')
on conflict (slug) do nothing;

insert into public.product_images (product_id, public_url, alt_text, sort_order, is_primary) values
  ('22222222-2222-2222-2222-222222222201', '/assets/products/product-1.png', 'Krio Krill Oil', 0, true),
  ('22222222-2222-2222-2222-222222222202', '/assets/products/product-2.png', 'SBG On The Go', 0, true),
  ('22222222-2222-2222-2222-222222222203', '/assets/products/product-3.png', 'SBG Capsules', 0, true),
  ('22222222-2222-2222-2222-222222222204', '/assets/products/product-4.png', 'SBG Trial Pack', 0, true),
  ('22222222-2222-2222-2222-222222222205', '/assets/products/product-5.png', 'TheoCoBar', 0, true),
  ('22222222-2222-2222-2222-222222222206', '/assets/products/product-6.png', 'ZAP Trace Minerals', 0, true),
  ('22222222-2222-2222-2222-222222222207', '/assets/promotions/promo-5.png', 'SBG Powder Jar', 0, true)
on conflict do nothing;

insert into public.promotions (id, name, slug, description, image_url, regular_total, promotional_price, label, is_active, is_featured, image_price_note)
values
  ('33333333-3333-3333-3333-333333333301', 'SWAPP Gold Membership Package', 'swapp-gold-membership', '2 jars, 3 trial packs, 1 capsule bottle.', '/assets/promotions/promo-3.png', 12499, 7998, '30% lifetime discount program', true, true, 'Verify image shows P7,998 pay price'),
  ('33333333-3333-3333-3333-333333333302', 'SWAPP Gold — 3+1 Jar Offer', 'swapp-gold-3-plus-1', '3 jars + 1 free jar.', '/assets/promotions/promo-4.png', 14000, 7998, 'Bundle savings', true, false, 'Verify save P6,002 vs DB totals'),
  ('33333333-3333-3333-3333-333333333303', 'SWAPP Silver Membership Package', 'swapp-silver-membership', '1 jar + 2 trial packs.', '/assets/promotions/promo-5.png', 5900, 3880, '20% lifetime discount program', true, true, 'Verify pay P3,880')
on conflict (slug) do nothing;

insert into public.faqs (question, answer, sort_order) values
  ('What is Salveo Barley Grass?', 'Salveo Barley Grass (SBG) is a food supplement from barley grass in several formats.', 1),
  ('What product formats are available?', 'Powder jar, trial pack, on-the-go sachets, and capsules.', 2),
  ('How can I place an order?', 'Choose a product, set quantity, and complete checkout.', 3),
  ('What payment methods are accepted?', 'Manual QR payments as shown at checkout (GCash, Maya, bank transfer).', 4),
  ('How do I submit proof of payment?', 'Upload your receipt on checkout after placing the order.', 5),
  ('How can I check my order status?', 'Use order status lookup with your reference and mobile number.', 6),
  ('How do I contact customer support?', 'See footer contact details or Messenger link.', 7)
on conflict do nothing;

insert into public.testimonials (customer_name, quote, image_url, sort_order, is_visible, approval_status, requires_compliance_review)
values
  ('Customer poster', null, '/assets/testimonials/testimonial-1.png', 1, true, 'approved', true),
  ('Customer poster', null, '/assets/testimonials/testimonial-2.png', 2, true, 'approved', true),
  ('Customer poster', null, '/assets/testimonials/testimonial-3.png', 3, true, 'approved', true);

insert into public.site_sections (page_id, section_key, section_type, title, subtitle, body, content_json, image_url, display_order, is_visible, publish_status)
values
  ('home', 'hero', 'hero', 'Choose Salveo for Your Family''s Everyday Wellness', 'YOUR DAILY WELLNESS COMPANION', 'Discover the Salveo Barley Grass product range and find an option that fits your everyday routine.', '{"primaryCta":{"label":"Explore Products","href":"#products"},"secondaryCta":{"label":"View Promos","href":"#promos"}}'::jsonb, '/assets/banners/banner.jpeg', 1, true, 'published'),
  ('home', 'why_choose', 'split', 'Discover Salveo Barley Grass', 'Learn more about the product range and the ingredients behind it.', 'Salveo Barley Grass is available in multiple convenient formats.', '{"bullets":["Barley grass leaf ingredient","Powder and capsule formats","Everyday convenience","Usage guidance on packaging"]}'::jsonb, '/assets/features/feature-1.jpg', 4, true, 'published'),
  ('home', 'lifestyle', 'split', 'Make Salveo Part of Your Everyday Routine', null, 'Build a simple wellness habit with formats that match your lifestyle.', '{"cta":{"label":"Find Your Product","href":"#products"}}'::jsonb, '/assets/lifestyle/mode-1.jpg', 6, true, 'published')
on conflict (page_id, section_key) do nothing;
