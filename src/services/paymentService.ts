import { tryGetSupabase } from "@/lib/supabase/client";
import type { PaymentMethod } from "@/types/database";

const defaultMethods: PaymentMethod[] = [
  {
    id: "local-gcash",
    name: "GCash (Manual QR)",
    account_holder: "Configure in Admin",
    account_number: "—",
    qr_image_url: null,
    instructions:
      "Transfer the exact order total, then upload your payment screenshot on this page.",
    is_active: true,
    display_order: 1,
  },
];

export async function fetchActivePaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = tryGetSupabase();
  if (!supabase) return defaultMethods;

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error || !data?.length) return defaultMethods;
  return data as PaymentMethod[];
}
