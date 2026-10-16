import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSection } from "@/types/database";

const sectionKeys = [
  "hero",
  "trust_strip",
  "why_choose",
  "products",
  "lifestyle",
  "formats",
  "promotions",
  "testimonials",
  "brand",
  "faq",
  "final_cta",
  "footer",
];

async function fetchSections() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("site_sections")
    .select("*")
    .eq("page_id", "home")
    .order("display_order");
  if (error) throw error;
  return (data as SiteSection[]) ?? [];
}

export function AdminPagesPage() {
  const qc = useQueryClient();
  const { data: sections } = useQuery({ queryKey: ["admin-sections"], queryFn: fetchSections });
  const [selectedKey, setSelectedKey] = useState("hero");
  const selected = sections?.find((s) => s.section_key === selectedKey);

  const [draft, setDraft] = useState<Partial<SiteSection>>({});

  const loadDraft = (section: SiteSection | undefined) => {
    if (!section) return;
    setDraft(section);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      const payload = {
        title: draft.title,
        subtitle: draft.subtitle,
        body: draft.body,
        image_url: draft.image_url,
        is_visible: draft.is_visible ?? true,
        publish_status: "published",
        updated_at: new Date().toISOString(),
      };
      if (selected?.id) {
        const { error } = await supabase.from("site_sections").update(payload).eq("id", selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_sections").insert({
          page_id: "home",
          section_key: selectedKey,
          section_type: "custom",
          display_order: 0,
          ...payload,
        });
        if (error) throw error;
      }
      await supabase.from("activity_logs").insert({
        action_type: "page_content_published",
        entity_type: "site_section",
        entity_id: selectedKey,
      });
    },
    onSuccess: () => {
      toast.success("Section published");
      qc.invalidateQueries({ queryKey: ["admin-sections"] });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-1">
        <h1 className="mb-3 text-2xl font-bold text-deep">Landing Page Editor</h1>
        {sectionKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${selectedKey === key ? "bg-fresh font-semibold" : "hover:bg-surface"}`}
            onClick={() => {
              setSelectedKey(key);
              loadDraft(sections?.find((s) => s.section_key === key));
            }}
          >
            {key.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-white p-5 space-y-4">
        <h2 className="font-bold capitalize text-deep">{selectedKey.replaceAll("_", " ")}</h2>
        {!selected && (
          <p className="text-sm text-muted">No record yet — fill fields and publish to create this section.</p>
        )}
        <div>
          <Label>Title</Label>
          <Input
            value={draft.title ?? selected?.title ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Input
            value={draft.subtitle ?? selected?.subtitle ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
          />
        </div>
        <div>
          <Label>Body</Label>
          <Textarea
            rows={4}
            value={draft.body ?? selected?.body ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
        </div>
        <div>
          <Label>Image URL</Label>
          <Input
            value={draft.image_url ?? selected?.image_url ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.is_visible ?? selected?.is_visible ?? true}
            onChange={(e) => setDraft((d) => ({ ...d, is_visible: e.target.checked }))}
          />
          Visible on landing page
        </label>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          Publish changes
        </Button>
      </div>
    </div>
  );
}
