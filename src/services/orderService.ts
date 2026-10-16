import { isSupabaseConfigured } from "@/config/env";
import { formatPHP } from "@/lib/formatting/currency";
import { generateIdempotencyKey } from "@/lib/utils";
import { tryGetSupabase } from "@/lib/supabase/client";
import type { CheckoutFormValues } from "@/lib/validation/checkout";
import type { CheckoutLineItem } from "@/features/checkout/checkoutSession";

export type CheckoutQuote = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
};

export type CreatedOrder = {
  id: string;
  public_reference: string;
  grand_total: number;
  payment_status: string;
};

const LOCAL_ORDERS_KEY = "salveo_local_orders";

function localOrdersStore(): CreatedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) ?? "[]") as CreatedOrder[];
  } catch {
    return [];
  }
}

export async function getCheckoutQuote(
  items: CheckoutLineItem[],
  shippingFee = 150,
): Promise<CheckoutQuote> {
  const supabase = tryGetSupabase();
  if (supabase) {
    const { data, error } = await supabase.rpc("get_checkout_quote", {
      p_items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        promotion_id: i.promotionId ?? null,
      })),
    });
    if (!error && data) {
      const row = data as Record<string, number>;
      return {
        subtotal: Number(row.subtotal ?? 0),
        discountTotal: Number(row.discount_total ?? 0),
        shippingFee: Number(row.shipping_fee ?? shippingFee),
        grandTotal: Number(row.grand_total ?? 0),
      };
    }
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return {
    subtotal,
    discountTotal: 0,
    shippingFee,
    grandTotal: subtotal + shippingFee,
  };
}

export async function createOrder(params: {
  items: CheckoutLineItem[];
  form: CheckoutFormValues;
  idempotencyKey: string;
}): Promise<CreatedOrder> {
  const supabase = tryGetSupabase();

  const delivery_address = {
    region: params.form.region,
    province: params.form.province,
    city: params.form.city,
    barangay: params.form.barangay,
    street: params.form.streetAddress,
    postal_code: params.form.postalCode,
    instructions: params.form.deliveryInstructions ?? "",
  };

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.rpc("create_order", {
      p_idempotency_key: params.idempotencyKey,
      p_customer_name: params.form.fullName,
      p_customer_email: params.form.email || null,
      p_customer_phone: params.form.mobile,
      p_delivery_address: delivery_address,
      p_payment_method_id: params.form.paymentMethodId,
      p_items: params.items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        promotion_id: i.promotionId ?? null,
      })),
    });

    if (error) throw new Error(error.message);
    return data as CreatedOrder;
  }

  const ref = `SBG-${Date.now().toString(36).toUpperCase()}`;
  const quote = await getCheckoutQuote(params.items);
  const order: CreatedOrder = {
    id: crypto.randomUUID(),
    public_reference: ref,
    grand_total: quote.grandTotal,
    payment_status: "awaiting_payment",
  };
  localStorage.setItem(
    LOCAL_ORDERS_KEY,
    JSON.stringify([order, ...localOrdersStore()]),
  );
  localStorage.setItem(
    `salveo_order_${ref}`,
    JSON.stringify({ order, items: params.items, form: params.form }),
  );
  return order;
}

export async function submitPaymentProof(params: {
  orderId: string;
  paymentMethodId: string;
  transactionReference?: string;
  file?: File;
}): Promise<void> {
  const supabase = tryGetSupabase();
  if (!supabase) {
    return;
  }

  let receiptPath: string | null = null;
  if (params.file) {
    const ext = params.file.name.split(".").pop() ?? "jpg";
    const path = `${params.orderId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-receipts")
      .upload(path, params.file, { upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    receiptPath = path;
  }

  const { error } = await supabase.rpc("submit_payment_proof", {
    p_order_id: params.orderId,
    p_payment_method_id: params.paymentMethodId,
    p_receipt_path: receiptPath,
    p_transaction_reference: params.transactionReference ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function lookupOrder(reference: string, mobile: string) {
  const supabase = tryGetSupabase();
  if (supabase) {
    const { data, error } = await supabase.rpc("order_status_lookup", {
      p_reference: reference,
      p_phone: mobile,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  const stored = localStorage.getItem(`salveo_order_${reference}`);
  if (!stored) return null;
  const parsed = JSON.parse(stored) as { order: CreatedOrder; form: CheckoutFormValues };
  if (parsed.form.mobile.replace(/\s/g, "") !== mobile.replace(/\s/g, "")) return null;
  return {
    reference: parsed.order.public_reference,
    payment_status: parsed.order.payment_status,
    grand_total: parsed.order.grand_total,
    grand_total_formatted: formatPHP(parsed.order.grand_total),
  };
}

export { generateIdempotencyKey };
