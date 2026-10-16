const CHECKOUT_KEY = "salveo_checkout_session";

export type CheckoutLineItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  promotionId?: string;
};

export type CheckoutSession = {
  items: CheckoutLineItem[];
  updatedAt: string;
};

export function saveCheckoutSession(session: CheckoutSession) {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(session));
}

export function loadCheckoutSession(): CheckoutSession | null {
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutSession;
  } catch {
    return null;
  }
}

export function clearCheckoutSession() {
  sessionStorage.removeItem(CHECKOUT_KEY);
}

export function setCheckoutFromProduct(item: Omit<CheckoutLineItem, "quantity"> & { quantity?: number }) {
  saveCheckoutSession({
    items: [{ ...item, quantity: item.quantity ?? 1 }],
    updatedAt: new Date().toISOString(),
  });
}
