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

type MethodDraft = {
  name: string;
  account_holder: string;
  account_number: string;
  qr_image_url: string;
  instructions: string;
  is_active: boolean;
  display_order: number;
};

const emptyCreate: MethodDraft = {
  name: "",
  account_holder: "",
  account_number: "",
  qr_image_url: "",
  instructions: "",
  is_active: true,
  display_order: 1,
};

export function AdminPaymentsPage() {
  const qc = useQueryClient();
  const { data: methods } = useQuery({ queryKey: ["admin-payment-methods"], queryFn: fetchMethods });
  const [createForm, setCreateForm] = useState<MethodDraft>({
    ...emptyCreate,
    display_order: (methods?.length ?? 0) + 1,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: MethodDraft }) => {
      const supabase = getSupabase();
      const payload = {
        name: draft.name,
        account_holder: draft.account_holder || null,
        account_number: draft.account_number || null,
        qr_image_url: draft.qr_image_url || null,
        instructions: draft.instructions || null,
        is_active: draft.is_active,
        display_order: draft.display_order,
      };
      if (id) {
        const { error } = await supabase.from("payment_methods").update(payload).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("payment_methods").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment method saved");
      qc.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment method removed");
      qc.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep">Payment Settings</h1>
        <p className="text-sm text-muted">Edit QR codes, account details, and checkout instructions.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {(methods ?? []).map((method) => (
          <PaymentMethodEditor
            key={method.id}
            initial={{
              name: method.name,
              account_holder: method.account_holder ?? "",
              account_number: method.account_number ?? "",
              qr_image_url: method.qr_image_url ?? "",
              instructions: method.instructions ?? "",
              is_active: method.is_active,
              display_order: method.display_order,
            }}
            onSave={(draft) => saveMutation.mutate({ id: method.id, draft })}
            onDelete={() => {
              if (window.confirm("Delete this payment method?")) deleteMutation.mutate(method.id);
            }}
          />
        ))}
      </div>

      <form
        className="max-w-xl space-y-3 rounded-xl border border-border bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(
            { draft: createForm },
            {
              onSuccess: () =>
                setCreateForm({
                  ...emptyCreate,
                  display_order: (methods?.length ?? 0) + 2,
                }),
            },
          );
        }}
      >
        <h2 className="font-bold text-deep">Add payment method</h2>
        <PaymentFields draft={createForm} onChange={setCreateForm} folder="qr-new" />
        <Button type="submit">Save payment method</Button>
      </form>
    </div>
  );
}

function PaymentMethodEditor({
  initial,
  onSave,
  onDelete,
}: {
  initial: MethodDraft;
  onSave: (draft: MethodDraft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(initial);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4">
      <h2 className="font-bold text-deep">{initial.name || "Payment method"}</h2>
      <PaymentFields
        draft={draft}
        onChange={setDraft}
        folder={`qr-${draft.name.toLowerCase().replace(/\s+/g, "-") || "method"}`}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
        />
        Active at checkout
      </label>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onSave(draft)}>
          Save changes
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function PaymentFields({
  draft,
  onChange,
  folder,
}: {
  draft: MethodDraft;
  onChange: (draft: MethodDraft) => void;
  folder: string;
}) {
  return (
    <>
      <div>
        <Label>Name</Label>
        <Input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} required />
      </div>
      <div>
        <Label>Account holder</Label>
        <Input
          value={draft.account_holder}
          onChange={(e) => onChange({ ...draft, account_holder: e.target.value })}
        />
      </div>
      <div>
        <Label>Account number</Label>
        <Input
          value={draft.account_number}
          onChange={(e) => onChange({ ...draft, account_number: e.target.value })}
        />
      </div>
      <ImageUploadField
        label="Payment QR code"
        bucket="payment-qr"
        folder={folder}
        category="payment_qr"
        allowUrlFallback
        value={draft.qr_image_url}
        onChange={(url) => onChange({ ...draft, qr_image_url: url })}
        previewClassName="max-h-64"
      />
      <div>
        <Label>Instructions</Label>
        <Textarea
          value={draft.instructions}
          onChange={(e) => onChange({ ...draft, instructions: e.target.value })}
        />
      </div>
      <div>
        <Label>Display order</Label>
        <Input
          type="number"
          value={draft.display_order}
          onChange={(e) => onChange({ ...draft, display_order: Number(e.target.value) })}
        />
      </div>
    </>
  );
}
