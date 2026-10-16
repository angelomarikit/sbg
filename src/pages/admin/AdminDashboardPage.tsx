import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchDashboardStats() {
  const supabase = getSupabase();
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { count: awaitingPayment } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "awaiting_payment");
  const { count: paymentReview } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "payment_review");
  const { count: paidOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "paid");

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("public_reference, customer_name, grand_total, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: salesRows } = await supabase
    .from("orders")
    .select("grand_total")
    .eq("payment_status", "paid");

  const verifiedSales = (salesRows ?? []).reduce(
    (sum, row) => sum + Number(row.grand_total ?? 0),
    0,
  );

  return {
    totalOrders: totalOrders ?? 0,
    awaitingPayment: awaitingPayment ?? 0,
    paymentReview: paymentReview ?? 0,
    paidOrders: paidOrders ?? 0,
    verifiedSales,
    recentOrders: recentOrders ?? [],
  };
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const stats = [
    { label: "Total Orders", value: data?.totalOrders ?? 0 },
    { label: "Awaiting Payment", value: data?.awaitingPayment ?? 0 },
    { label: "Payment Review", value: data?.paymentReview ?? 0 },
    { label: "Confirmed Orders", value: data?.paidOrders ?? 0 },
    { label: "Verified Sales", value: formatPHP(data?.verifiedSales ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-deep">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-deep">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-deep">Recent Orders</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-4">Reference</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).map((order) => (
                <tr key={order.public_reference} className="border-b border-border/70">
                  <td className="py-2 pr-4 font-medium">{order.public_reference}</td>
                  <td className="py-2 pr-4">{order.customer_name}</td>
                  <td className="py-2 pr-4">{formatPHP(Number(order.grand_total))}</td>
                  <td className="py-2">{order.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
