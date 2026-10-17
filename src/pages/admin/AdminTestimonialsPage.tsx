import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

async function fetchTestimonials() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

type TestimonialDraft = {
  customer_name: string;
  quote: string;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
  requires_compliance_review: boolean;
  approval_status: string;
};

const emptyNew: TestimonialDraft = {
  customer_name: "",
  quote: "",
  image_url: "",
  sort_order: 1,
  is_visible: false,
  requires_compliance_review: true,
  approval_status: "pending_review",
};

export function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-testimonials"], queryFn: fetchTestimonials });
  const [newItem, setNewItem] = useState<TestimonialDraft>({
    ...emptyNew,
    sort_order: (items?.length ?? 0) + 1,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: TestimonialDraft }) => {
      const supabase = getSupabase();
      const payload = {
        customer_name: draft.customer_name || null,
        quote: draft.quote || null,
        image_url: draft.image_url || null,
        sort_order: draft.sort_order,
        is_visible: draft.is_visible,
        requires_compliance_review: draft.requires_compliance_review,
        approval_status: draft.approval_status,
      };
      if (id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial saved");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["landing-testimonials"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial removed");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["landing-testimonials"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep">Testimonials</h1>
        <p className="text-sm text-muted">
          Upload poster images, edit captions, and control visibility. Review compliance before publishing
          health-related claims.
        </p>
      </div>

      <div className="space-y-4">
        {(items ?? []).map((item) => (
          <TestimonialEditor
            key={item.id}
            header={
              <>
                <Badge variant={item.approval_status === "approved" ? "default" : "sale"}>
                  {item.approval_status}
                </Badge>
                {item.requires_compliance_review && <Badge variant="sale">Compliance review</Badge>}
              </>
            }
            initial={{
              customer_name: item.customer_name ?? "",
              quote: item.quote ?? "",
              image_url: item.image_url ?? "",
              sort_order: item.sort_order,
              is_visible: item.is_visible,
              requires_compliance_review: item.requires_compliance_review,
              approval_status: item.approval_status,
            }}
            onSave={(draft) => saveMutation.mutate({ id: item.id, draft })}
            onDelete={() => {
              if (window.confirm("Delete this testimonial?")) deleteMutation.mutate(item.id);
            }}
          />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="mb-3 font-bold text-deep">Add testimonial</h2>
        <TestimonialEditor
          initial={newItem}
          onChange={setNewItem}
          onSave={(draft) =>
            saveMutation.mutate(
              { draft },
              {
                onSuccess: () =>
                  setNewItem({ ...emptyNew, sort_order: (items?.length ?? 0) + 2 }),
              },
            )
          }
          submitLabel="Add testimonial"
        />
      </div>
    </div>
  );
}

function TestimonialEditor({
  initial,
  header,
  onSave,
  onDelete,
  onChange,
  submitLabel = "Save changes",
}: {
  initial: TestimonialDraft;
  header?: ReactNode;
  onSave: (draft: TestimonialDraft) => void;
  onDelete?: () => void;
  onChange?: (draft: TestimonialDraft) => void;
  submitLabel?: string;
}) {
  const [draft, setDraft] = useState(initial);

  const update = (partial: Partial<TestimonialDraft>) => {
    const next = { ...draft, ...partial };
    setDraft(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4">
      {header && <div className="flex flex-wrap gap-2">{header}</div>}
      <ImageUploadField
        label="Poster image"
        folder="testimonials"
        category="testimonials"
        value={draft.image_url}
        onChange={(url) => update({ image_url: url })}
        previewClassName="max-h-56"
      />
      <div>
        <Label>Customer name (optional)</Label>
        <Input value={draft.customer_name} onChange={(e) => update({ customer_name: e.target.value })} />
      </div>
      <div>
        <Label>Caption / quote</Label>
        <Textarea rows={3} value={draft.quote} onChange={(e) => update({ quote: e.target.value })} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Sort order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => update({ sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 pb-1 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.is_visible}
              onChange={(e) => update({ is_visible: e.target.checked })}
            />
            Visible on landing page
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.requires_compliance_review}
              onChange={(e) => update({ requires_compliance_review: e.target.checked })}
            />
            Needs compliance review
          </label>
        </div>
      </div>
      <div>
        <Label>Approval status</Label>
        <select
          className="mt-1 h-11 w-full rounded-lg border border-border px-3"
          value={draft.approval_status}
          onChange={(e) => update({ approval_status: e.target.value })}
        >
          <option value="pending_review">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => onSave(draft)}>
          {submitLabel}
        </Button>
        {onDelete && (
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            onSave({
              ...draft,
              approval_status: "approved",
              is_visible: true,
            })
          }
        >
          Approve & publish
        </Button>
      </div>
    </div>
  );
}
