import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Json, SiteSection } from "@/types/database";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SectionExtrasEditor } from "@/components/admin/SectionExtrasEditor";

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

type SectionDraft = {
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  is_visible: boolean;
  content_json: Json | null;
};

const emptyDraft = (): SectionDraft => ({
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  is_visible: true,
  content_json: {},
});

export function AdminPagesPage() {
  const qc = useQueryClient();
  const { data: sections } = useQuery({ queryKey: ["admin-sections"], queryFn: fetchSections });
  const [selectedKey, setSelectedKey] = useState("hero");
  const selected = useMemo(
    () => sections?.find((s) => s.section_key === selectedKey),
    [sections, selectedKey],
  );

  const [draft, setDraft] = useState<SectionDraft>(emptyDraft());

  useEffect(() => {
    if (selected) {
      setDraft({
        title: selected.title ?? "",
        subtitle: selected.subtitle ?? "",
        body: selected.body ?? "",
        image_url: selected.image_url ?? "",
        is_visible: selected.is_visible ?? true,
        content_json: selected.content_json ?? {},
      });
    } else {
      setDraft(emptyDraft());
    }
  }, [selectedKey, selected]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      const payload = {
        title: draft.title || null,
        subtitle: draft.subtitle || null,
        body: draft.body || null,
        image_url: draft.image_url || null,
        content_json: draft.content_json ?? {},
        is_visible: draft.is_visible,
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
          display_order: sectionKeys.indexOf(selectedKey) + 1,
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
      qc.invalidateQueries({ queryKey: ["section", selectedKey] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const showImageField = !["trust_strip", "promotions", "testimonials", "faq", "footer"].includes(selectedKey);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-1">
        <h1 className="mb-3 text-2xl font-bold text-deep">Landing Page Editor</h1>
        {sectionKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${selectedKey === key ? "bg-fresh font-semibold" : "hover:bg-surface"}`}
            onClick={() => setSelectedKey(key)}
          >
            {key.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-white p-5">
        <h2 className="font-bold capitalize text-deep">{selectedKey.replaceAll("_", " ")}</h2>
        {!selected && (
          <p className="text-sm text-muted">No record yet — fill fields and publish to create this section.</p>
        )}
        <div>
          <Label>Heading / title</Label>
          <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        </div>
        <div>
          <Label>Subtitle / eyebrow</Label>
          <Input value={draft.subtitle} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
        </div>
        <div>
          <Label>Body / caption</Label>
          <Textarea
            rows={4}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
        </div>
        {showImageField && (
          <ImageUploadField
            label="Section image"
            folder={`sections/${selectedKey}`}
            category="banners"
            value={draft.image_url}
            onChange={(url) => setDraft((d) => ({ ...d, image_url: url }))}
          />
        )}
        <SectionExtrasEditor
          sectionKey={selectedKey}
          contentJson={draft.content_json}
          onChange={(content_json) => setDraft((d) => ({ ...d, content_json }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.is_visible}
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
