import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

async function fetchOrderDetail(id: string) {
  const supabase = getSupabase();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) throw error;
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const { data: submissions } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("order_id", id)
    .order("submitted_at", { ascending: false });
  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false });
  return { order, items: items ?? [], submissions: submissions ?? [], history: history ?? [] };
}

export function AdminOrderDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => fetchOrderDetail(id),
    enabled: !!id,
  });

  const verifyPayment = useMutation({
    mutationFn: async (approved: boolean) => {
      const supabase = getSupabase();
      const newStatus = approved ? "paid" : "rejected";
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newStatus, fulfillment_status: approved ? "processing" : "pending" })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("order_status_history").insert({
        order_id: id,
        status_type: "payment",
        new_status: newStatus,
        note: approved ? "Payment verified by admin" : "Payment proof rejected",
      });
      await supabase.from("activity_logs").insert({
        action_type: approved ? "payment_verified" : "payment_rejected",
        entity_type: "order",
        entity_id: id,
      });
    },
    onSuccess: () => {
      toast.success("Payment status updated");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
    },
  });

  const updateFulfillment = useMutation({
    mutationFn: async (status: string) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("orders")
        .update({
          fulfillment_status: status,
          tracking_number: tracking || null,
          admin_notes: notes || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Fulfillment updated"),
  });

  if (isLoading || !data) return <p>Loading…</p>;
  const { order, items, submissions, history } = data;
  const address = order.delivery_address as Record<string, string>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep">{order.public_reference}</h1>
          <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Button asChild variant="ghost">
          <Link to="/admin/orders">Back</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-white p-4">
          <h2 className="font-bold text-deep">Customer</h2>
          <p className="mt-2 text-sm">{order.customer_name}</p>
          <p className="text-sm text-muted">{order.customer_phone}</p>
          <p className="text-sm text-muted">{order.customer_email}</p>
          <p className="mt-3 text-sm">
            {address.street}, {address.barangay}, {address.city}, {address.province}, {address.region}{" "}
            {address.postal_code}
          </p>
        </section>
        <section className="rounded-xl border border-border bg-white p-4">
          <h2 className="font-bold text-deep">Totals (snapshot)</h2>
          <p className="mt-2 text-sm">Subtotal: {formatPHP(Number(order.subtotal))}</p>
          <p className="text-sm">Shipping: {formatPHP(Number(order.shipping_fee))}</p>
          <p className="text-lg font-bold">Grand total: {formatPHP(Number(order.grand_total))}</p>
          <p className="mt-2 text-sm">Payment: {order.payment_status}</p>
          <p className="text-sm">Fulfillment: {order.fulfillment_status}</p>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-bold text-deep">Items</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatPHP(Number(item.line_total))}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-bold text-deep">Payment proof</h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No receipt uploaded yet.</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="mt-2 text-sm">
              <p>Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
              <p>Reference: {sub.transaction_reference ?? "—"}</p>
              <p>Review: {sub.review_status}</p>
              {sub.receipt_storage_path && <p className="text-muted">Receipt: {sub.receipt_storage_path}</p>}
            </div>
          ))
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => verifyPayment.mutate(true)}>Mark payment verified</Button>
          <Button variant="secondary" onClick={() => verifyPayment.mutate(false)}>
            Reject payment proof
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-4 space-y-3">
        <h2 className="font-bold text-deep">Fulfillment</h2>
        <div>
          <Label>Tracking number</Label>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
        <div>
          <Label>Internal notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {["processing", "shipped", "delivered", "cancelled"].map((status) => (
            <Button key={status} size="sm" variant="secondary" onClick={() => updateFulfillment.mutate(status)}>
              Mark {status}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-bold text-deep">Timeline</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {history.map((h) => (
            <li key={h.id}>
              {new Date(h.created_at).toLocaleString()} — {h.status_type}: {h.new_status} {h.note ? `(${h.note})` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
