import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
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
  submitPaymentProof,
} from "@/services/orderService";
import { fetchActivePaymentMethods } from "@/services/paymentService";
import { fetchSiteSettings } from "@/services/cmsService";

export function CheckoutPage() {
  const navigate = useNavigate();
  const session = loadCheckoutSession();
  const idempotencyRef = useRef(generateIdempotencyKey());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });
  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchActivePaymentMethods,
  });

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
      paymentMethodId: "",
      transactionReference: "",
    },
  });

  useEffect(() => {
    if (paymentMethods?.length && !form.getValues("paymentMethodId")) {
      form.setValue("paymentMethodId", paymentMethods[0].id);
    }
  }, [paymentMethods, form]);

  const selectedMethod = useMemo(
    () => paymentMethods?.find((m) => m.id === form.watch("paymentMethodId")),
    [paymentMethods, form.watch("paymentMethodId")],
  );

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

      if (receiptFile) {
        try {
          await submitPaymentProof({
            orderId: order.id,
            paymentMethodId: values.paymentMethodId,
            transactionReference: values.transactionReference,
            file: receiptFile,
          });
        } catch {
          toast.message("Order created", {
            description: "Receipt upload failed — you can contact support with your reference.",
          });
        }
      }

      clearCheckoutSession();
      navigate(`/order-success/${order.public_reference}`, {
        state: { order, awaitingReceipt: !receiptFile },
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

            <section className="rounded-xl border border-border p-5">
              <h2 className="text-lg font-bold text-deep">Payment</h2>
              <div className="mt-4 space-y-3">
                {paymentMethods?.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <input
                      type="radio"
                      value={method.id}
                      {...form.register("paymentMethodId")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-deep">{method.name}</p>
                      {method.account_holder && (
                        <p className="text-sm text-muted">{method.account_holder}</p>
                      )}
                      {method.account_number && (
                        <p className="text-sm text-muted">{method.account_number}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedMethod?.qr_image_url && (
                <div className="mt-4 rounded-lg bg-surface p-4 text-center">
                  <img
                    src={selectedMethod.qr_image_url}
                    alt={`${selectedMethod.name} QR code`}
                    className="mx-auto max-h-64"
                  />
                  <a
                    href={selectedMethod.qr_image_url}
                    download
                    className="mt-2 inline-block text-sm font-medium text-primary"
                  >
                    Download QR
                  </a>
                </div>
              )}

              <p className="mt-3 text-sm text-muted">
                {selectedMethod?.instructions ??
                  "Pay the exact amount shown in your order summary, then upload proof below."}
              </p>
              <p className="mt-2 text-sm font-semibold text-deep">
                Amount to pay: {formatPHP(quote?.grandTotal ?? 0)}
              </p>

              <div className="mt-4 grid gap-3">
                <div>
                  <Label htmlFor="transactionReference">Transaction reference (optional)</Label>
                  <Input id="transactionReference" {...form.register("transactionReference")} />
                </div>
                <div>
                  <Label htmlFor="receipt">Upload payment receipt / screenshot</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
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
                  <dt>Grand total</dt>
                  <dd>{formatPHP(quote?.grandTotal ?? 0)}</dd>
                </div>
              </dl>
              <Button type="submit" className="mt-5 w-full" disabled={submitting}>
                {submitting ? "Submitting…" : "Place Order & Submit Details"}
              </Button>
              <p className="mt-3 text-xs text-muted">
                Your order will be received. Payment confirmation is pending verification.
              </p>
            </div>
          </aside>
        </form>
        </div>
      </div>
    </>
  );
}
