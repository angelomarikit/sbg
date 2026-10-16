import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const filters = [
  "all",
  "awaiting_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

async function fetchOrders(status: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("orders")
    .select("id, public_reference, customer_name, customer_phone, grand_total, payment_status, fulfillment_status, created_at")
    .order("created_at", { ascending: false });
  if (status !== "all") {
    if (status === "processing" || status === "shipped" || status === "delivered" || status === "cancelled") {
      query = query.eq("fulfillment_status", status);
    } else {
      query = query.eq("payment_status", status);
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: () => fetchOrders(filter),
  });

  const exportCsv = () => {
    const rows = orders ?? [];
    const header = ["reference", "customer", "phone", "total", "payment", "fulfillment"];
    const lines = rows.map((o) =>
      [o.public_reference, o.customer_name, o.customer_phone, o.grand_total, o.payment_status, o.fulfillment_status]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-deep">Orders</h1>
        <Button variant="secondary" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "secondary"} onClick={() => setFilter(f)}>
            {f.replaceAll("_", " ")}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Fulfillment</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="p-3 font-medium">{order.public_reference}</td>
                  <td className="p-3">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-muted">{order.customer_phone}</div>
                  </td>
                  <td className="p-3">{formatPHP(Number(order.grand_total))}</td>
                  <td className="p-3">{order.payment_status}</td>
                  <td className="p-3">{order.fulfillment_status}</td>
                  <td className="p-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link to={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
