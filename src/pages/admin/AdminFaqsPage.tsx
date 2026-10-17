import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function fetchFaqs() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

type FaqDraft = {
  question: string;
  answer: string;
  sort_order: number;
  is_visible: boolean;
};

const emptyDraft: FaqDraft = {
  question: "",
  answer: "",
  sort_order: 0,
  is_visible: true,
};

export function AdminFaqsPage() {
  const qc = useQueryClient();
  const { data: faqs } = useQuery({ queryKey: ["admin-faqs"], queryFn: fetchFaqs });
  const [newFaq, setNewFaq] = useState<FaqDraft>({ ...emptyDraft, sort_order: (faqs?.length ?? 0) + 1 });

  const saveMutation = useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: FaqDraft }) => {
      const supabase = getSupabase();
      if (id) {
        const { error } = await supabase.from("faqs").update(draft).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("faqs").insert(draft);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ saved");
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ removed");
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep">FAQs</h1>
        <p className="text-sm text-muted">Edit questions and answers on the landing page FAQ section.</p>
      </div>

      <div className="space-y-4">
        {(faqs ?? []).map((faq) => (
          <FaqEditorCard
            key={faq.id}
            draft={{
              question: faq.question,
              answer: faq.answer,
              sort_order: faq.sort_order,
              is_visible: faq.is_visible,
            }}
            onSave={(draft) => saveMutation.mutate({ id: faq.id, draft })}
            onDelete={() => {
              if (window.confirm("Delete this FAQ?")) deleteMutation.mutate(faq.id);
            }}
          />
        ))}
      </div>

      <form
        className="space-y-3 rounded-xl border border-border bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(
            { draft: newFaq },
            {
              onSuccess: () => {
                setNewFaq({ ...emptyDraft, sort_order: (faqs?.length ?? 0) + 2 });
              },
            },
          );
        }}
      >
        <h2 className="font-bold text-deep">Add FAQ</h2>
        <div>
          <Label>Question</Label>
          <Input
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Answer</Label>
          <Textarea
            rows={4}
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={newFaq.sort_order}
              onChange={(e) => setNewFaq({ ...newFaq, sort_order: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={newFaq.is_visible}
              onChange={(e) => setNewFaq({ ...newFaq, is_visible: e.target.checked })}
            />
            Visible on site
          </label>
        </div>
        <Button type="submit">Add FAQ</Button>
      </form>
    </div>
  );
}

function FaqEditorCard({
  draft: initial,
  onSave,
  onDelete,
}: {
  draft: FaqDraft;
  onSave: (draft: FaqDraft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(initial);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4">
      <div>
        <Label>Question</Label>
        <Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          rows={4}
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Sort order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={draft.is_visible}
            onChange={(e) => setDraft({ ...draft, is_visible: e.target.checked })}
          />
          Visible on site
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onSave(draft)}>
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
