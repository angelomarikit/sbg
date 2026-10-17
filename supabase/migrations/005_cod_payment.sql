-- Checkout: Cash on Delivery only

insert into public.payment_methods (id, name, account_holder, account_number, qr_image_url, instructions, is_active, display_order)
values (
  '44444444-4444-4444-4444-444444444401',
  'Cash on Delivery',
  null,
  null,
  null,
  'Pay the exact order total in cash when your order is delivered. Please prepare the amount shown in your order summary.',
  true,
  1
)
on conflict (id) do update set
  name = excluded.name,
  account_holder = excluded.account_holder,
  account_number = excluded.account_number,
  qr_image_url = null,
  instructions = excluded.instructions,
  is_active = true,
  display_order = 1;

update public.payment_methods
set is_active = false
where id <> '44444444-4444-4444-4444-444444444401';

update public.faqs
set
  answer = 'We accept Cash on Delivery (COD) only. Pay in cash when your order is delivered.',
  question = 'What payment methods are accepted?'
where question ilike '%payment method%';

update public.faqs
set answer = 'No online proof of payment is needed. Prepare the exact cash amount when the courier delivers your order.'
where question ilike '%proof of payment%';
