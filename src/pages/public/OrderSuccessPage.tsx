import { Link, useLocation, useParams } from "react-router-dom";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { formatPHP } from "@/lib/formatting/currency";
import type { CreatedOrder } from "@/services/orderService";

export function OrderSuccessPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const order = (location.state as { order?: CreatedOrder } | null)?.order;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
      <PageMeta title="Order Received | Salveo" />
      <h1 className="text-3xl font-bold text-deep">Thank You for Your Order!</h1>
      <p className="mt-3 text-muted">
        Your order has been received. Payment confirmation is pending verification.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-left">
        <p className="text-sm text-muted">Order reference</p>
        <p className="text-xl font-bold text-deep">{order?.public_reference ?? id}</p>
        {order?.grand_total != null && (
          <p className="mt-3 text-sm">
            Total amount: <strong>{formatPHP(order.grand_total)}</strong>
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Status: {order?.payment_status ?? "awaiting_payment / payment_review"}
        </p>
        <p className="mt-4 text-sm text-muted">
          If you have not uploaded proof of payment yet, please message support with your reference number.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary">
          <Link to="/">Back to Home</Link>
        </Button>
        <Button asChild>
          <Link to={`/order-status/${order?.public_reference ?? id}`}>View Order Status</Link>
        </Button>
      </div>
    </div>
  );
}
