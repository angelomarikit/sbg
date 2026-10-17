import { tryGetSupabase } from "@/lib/supabase/client";
import type { PaymentMethod } from "@/types/database";

/** Fixed UUID — must match `supabase/migrations/005_cod_payment.sql` seed. */
export const COD_PAYMENT_METHOD_ID = "44444444-4444-4444-4444-444444444401";

export const COD_PAYMENT_METHOD: PaymentMethod = {
  id: COD_PAYMENT_METHOD_ID,
  name: "Cash on Delivery",
  account_holder: null,
  account_number: null,
  qr_image_url: null,
  instructions:
    "Pay the exact order total in cash when your order is delivered. Please prepare the amount shown in your order summary.",
  is_active: true,
  display_order: 1,
};

export async function fetchActivePaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = tryGetSupabase();
  if (!supabase) return [COD_PAYMENT_METHOD];

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .eq("id", COD_PAYMENT_METHOD_ID)
    .maybeSingle();

  if (error || !data) return [COD_PAYMENT_METHOD];
  return [data as PaymentMethod];
}
