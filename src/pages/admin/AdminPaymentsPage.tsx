import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

async function fetchMethods() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("payment_methods").select("*").order("display_order");
  if (error) throw error;
  return data ?? [];
}

export function AdminPaymentsPage() {
  const qc = useQueryClient();
  const { data: methods } = useQuery({ queryKey: ["admin-payment-methods"], queryFn: fetchMethods });
  const [form, setForm] = useState({
    name: "",
    account_holder: "",
    account_number: "",
    qr_image_url: "",
    instructions: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      const { error } = await supabase.from("payment_methods").insert({
        ...form,
        is_active: true,
        display_order: (methods?.length ?? 0) + 1,
      });
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        action_type: "payment_method_created",
        entity_type: "payment_method",
      });
    },
    onSuccess: () => {
      toast.success("Payment method added");
      qc.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      setForm({ name: "", account_holder: "", account_number: "", qr_image_url: "", instructions: "" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("payment_methods").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-deep">Payment Settings</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {(methods ?? []).map((method) => (
          <div key={method.id} className="rounded-xl border border-border bg-white p-4">
            <h2 className="font-bold text-deep">{method.name}</h2>
            <p className="text-sm text-muted">{method.account_holder}</p>
            <p className="text-sm">{method.account_number}</p>
            {method.qr_image_url && (
              <img src={method.qr_image_url} alt="" className="mt-2 h-32 object-contain" />
            )}
            <p className="mt-2 text-xs text-muted">{method.instructions}</p>
            <Button
              size="sm"
              className="mt-3"
              variant="secondary"
              onClick={() => toggleMutation.mutate({ id: method.id, is_active: !method.is_active })}
            >
              {method.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
      <form
        className="max-w-xl space-y-3 rounded-xl border border-border bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <h2 className="font-bold text-deep">Add payment method</h2>
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>Account holder</Label>
          <Input
            value={form.account_holder}
            onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
          />
        </div>
        <div>
          <Label>Account number</Label>
          <Input
            value={form.account_number}
            onChange={(e) => setForm({ ...form, account_number: e.target.value })}
          />
        </div>
        <ImageUploadField
          label="Payment QR code"
          bucket="payment-qr"
          folder="qr"
          category="payment_qr"
          allowUrlFallback
          value={form.qr_image_url}
          onChange={(url) => setForm({ ...form, qr_image_url: url })}
          previewClassName="max-h-64"
        />
        <div>
          <Label>Instructions</Label>
          <Textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </div>
        <Button type="submit">Save payment method</Button>
      </form>
    </div>
  );
}
