import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function fetchSettings() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });
  const [form, setForm] = useState({
    brand_name: "",
    contact_phone: "",
    contact_email: "",
    messenger_url: "",
    shipping_fee_flat: 150,
    footer_description: "",
    disclaimer: "",
    seo_default_title: "",
    seo_default_description: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name ?? "",
        contact_phone: settings.contact_phone ?? "",
        contact_email: settings.contact_email ?? "",
        messenger_url: settings.messenger_url ?? "",
        shipping_fee_flat: Number(settings.shipping_fee_flat ?? 150),
        footer_description: settings.footer_description ?? "",
        disclaimer: settings.disclaimer ?? "",
        seo_default_title: settings.seo_default_title ?? "",
        seo_default_description: settings.seo_default_description ?? "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      if (settings?.id) {
        const { error } = await supabase.from("site_settings").update(form).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-deep">Website Settings</h1>
      <form
        className="space-y-4 rounded-xl border border-border bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div>
          <Label>Brand name</Label>
          <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Contact phone</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Messenger URL</Label>
          <Input value={form.messenger_url} onChange={(e) => setForm({ ...form, messenger_url: e.target.value })} />
        </div>
        <div>
          <Label>Flat shipping fee (PHP)</Label>
          <Input
            type="number"
            value={form.shipping_fee_flat}
            onChange={(e) => setForm({ ...form, shipping_fee_flat: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Footer description</Label>
          <Textarea
            value={form.footer_description}
            onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
          />
        </div>
        <div>
          <Label>Disclaimer</Label>
          <Textarea value={form.disclaimer} onChange={(e) => setForm({ ...form, disclaimer: e.target.value })} />
        </div>
        <div>
          <Label>SEO default title</Label>
          <Input
            value={form.seo_default_title}
            onChange={(e) => setForm({ ...form, seo_default_title: e.target.value })}
          />
        </div>
        <div>
          <Label>SEO default description</Label>
          <Textarea
            value={form.seo_default_description}
            onChange={(e) => setForm({ ...form, seo_default_description: e.target.value })}
          />
        </div>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
