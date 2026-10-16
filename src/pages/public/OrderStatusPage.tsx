import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPHP } from "@/lib/formatting/currency";
import { orderLookupSchema } from "@/lib/validation/checkout";
import { lookupOrder } from "@/services/orderService";

type LookupValues = { reference: string; mobile: string };

export function OrderStatusPage() {
  const { reference: routeRef } = useParams();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LookupValues>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: {
      reference: routeRef && routeRef !== "demo" ? routeRef : "",
      mobile: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setResult(null);
    try {
      const data = await lookupOrder(values.reference, values.mobile);
      if (!data) {
        setError("No order found for that reference and mobile number.");
        return;
      }
      setResult(data as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    }
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6">
      <PageMeta title="Order Status | Salveo" />
      <h1 className="text-2xl font-bold text-deep">Check Order Status</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order reference and the mobile number used during checkout.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-border p-5">
        <div>
          <Label htmlFor="reference">Order reference</Label>
          <Input id="reference" {...form.register("reference")} />
        </div>
        <div>
          <Label htmlFor="mobile">Mobile number</Label>
          <Input id="mobile" {...form.register("mobile")} />
        </div>
        <Button type="submit" className="w-full">
          Look up order
        </Button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 rounded-xl bg-fresh p-4 text-sm text-deep">
          <p>
            Reference: <strong>{String(result.reference)}</strong>
          </p>
          <p>
            Payment status: <strong>{String(result.payment_status)}</strong>
          </p>
          {"fulfillment_status" in result && (
            <p>
              Fulfillment: <strong>{String(result.fulfillment_status)}</strong>
            </p>
          )}
          {result.grand_total != null && (
            <p>
              Total: <strong>{formatPHP(Number(result.grand_total))}</strong>
            </p>
          )}
        </div>
      )}
      <Button asChild variant="ghost" className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
