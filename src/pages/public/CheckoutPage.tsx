import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPHP } from "@/lib/formatting/currency";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/validation/checkout";
import {
  clearCheckoutSession,
  loadCheckoutSession,
} from "@/features/checkout/checkoutSession";
import {
  createOrder,
  generateIdempotencyKey,
  getCheckoutQuote,
} from "@/services/orderService";
import {
  COD_PAYMENT_METHOD_ID,
  fetchActivePaymentMethods,
} from "@/services/paymentService";
import { fetchSiteSettings } from "@/services/cmsService";

export function CheckoutPage() {
  const navigate = useNavigate();
  const session = loadCheckoutSession();
  const idempotencyRef = useRef(generateIdempotencyKey());
  const [submitting, setSubmitting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });
  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchActivePaymentMethods,
  });

  const codMethod = paymentMethods?.[0];

  const { data: quote } = useQuery({
    queryKey: ["checkout-quote", session?.items],
    queryFn: () => getCheckoutQuote(session!.items, settings?.shipping_fee_flat ?? 150),
    enabled: !!session?.items.length,
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      streetAddress: "",
      postalCode: "",
      deliveryInstructions: "",
      paymentMethodId: COD_PAYMENT_METHOD_ID,
    },
  });

  useEffect(() => {
    const id = codMethod?.id ?? COD_PAYMENT_METHOD_ID;
    form.setValue("paymentMethodId", id);
  }, [codMethod?.id, form]);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
  });

  if (!session?.items?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-deep">Your cart is empty</h1>
        <p className="mt-2 text-muted">Choose a product to start checkout.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild>
            <Link to="/#products">Browse products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const order = await createOrderMutation.mutateAsync({
        items: session.items,
        form: values,
        idempotencyKey: idempotencyRef.current,
      });

      clearCheckoutSession();
      navigate(`/order-success/${order.public_reference}`, {
        state: { order },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create order");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <>
      <PageMeta title="Checkout | Salveo" />
      <div className="min-h-screen bg-gradient-to-b from-fresh/40 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <Button asChild variant="ghost" className="mb-4 -ml-2 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </Link>
          </Button>
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-primary">1. Discover</span>
            <span>→</span>
            <span className="font-semibold text-primary">2. Product</span>
            <span>→</span>
            <span className="font-semibold text-deep">3. Checkout</span>
          </div>

          <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-5">
            <input type="hidden" {...form.register("paymentMethodId")} />

            <div className="space-y-6 lg:col-span-3">
              <section className="rounded-xl border border-border p-5">
                <h2 className="text-lg font-bold text-deep">Customer Information</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...form.register("fullName")} />
                    {form.formState.errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" placeholder="09XXXXXXXXX" {...form.register("mobile")} />
                    {form.formState.errors.mobile && (
                      <p className="mt-1 text-xs text-red-600">{form.formState.errors.mobile.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input id="region" {...form.register("region")} />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" {...form.register("province")} />
                  </div>
                  <div>
                    <Label htmlFor="city">City / Municipality</Label>
                    <Input id="city" {...form.register("city")} />
                  </div>
                  <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input id="barangay" {...form.register("barangay")} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="streetAddress">Detailed Street Address</Label>
                    <Input id="streetAddress" {...form.register("streetAddress")} />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" {...form.register("postalCode")} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (optional)</Label>
                    <Textarea id="deliveryInstructions" {...form.register("deliveryInstructions")} />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-surface/40 p-5">
                <h2 className="text-lg font-bold text-deep">Payment</h2>
                <div className="mt-4 rounded-lg border border-primary/30 bg-white p-4">
                  <p className="font-semibold text-deep">{codMethod?.name ?? "Cash on Delivery"}</p>
                  <p className="mt-2 text-sm text-muted">
                    {codMethod?.instructions ??
                      "Pay the exact order total in cash when your order is delivered."}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-deep">
                    Amount due on delivery: {formatPHP(quote?.grandTotal ?? 0)}
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted">
                  No online payment, QR scan, or receipt upload is required for this order.
                </p>
              </section>
            </div>

            <aside className="lg:col-span-2">
              <div className="sticky top-24 rounded-xl border border-border p-5">
                <h2 className="text-lg font-bold text-deep">Order Summary</h2>
                <ul className="mt-4 space-y-3">
                  {session.items.map((item) => (
                    <li key={item.productId} className="flex gap-3">
                      <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-contain bg-surface" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-deep">{item.name}</p>
                        <p className="text-xs text-muted">
                          Qty {item.quantity} × {formatPHP(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatPHP(item.unitPrice * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd>{formatPHP(quote?.subtotal ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Delivery fee</dt>
                    <dd>{formatPHP(quote?.shippingFee ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between text-base font-bold text-deep">
                    <dt>Grand total (COD)</dt>
                    <dd>{formatPHP(quote?.grandTotal ?? 0)}</dd>
                  </div>
                </dl>
                <Button type="submit" className="mt-5 w-full" disabled={submitting}>
                  {submitting ? "Placing order…" : "Place order"}
                </Button>
                <p className="mt-3 text-xs text-muted">
                  We will contact you to confirm delivery. Payment is collected upon delivery.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </>
  );
}
