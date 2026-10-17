import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type PromoForm = {
  name: string;
  slug: string;
  description: string;
  label: string;
  regular_total: number;
  promotional_price: number;
  image_url: string;
  image_price_note: string;
  is_active: boolean;
  is_featured: boolean;
};

async function fetchPromotion(id: string) {
  if (id === "new") return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminPromotionEditPage() {
  const { id = "new" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = id === "new";

  const { data: promo, isLoading } = useQuery({
    queryKey: ["admin-promotion", id],
    queryFn: () => fetchPromotion(id!),
    enabled: !!id,
  });

  const form = useForm<PromoForm>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      label: "",
      regular_total: 0,
      promotional_price: 0,
      image_url: "",
      image_price_note: "",
      is_active: true,
      is_featured: false,
    },
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");

  useEffect(() => {
    if (promo) {
      form.reset({
        name: promo.name,
        slug: promo.slug,
        description: promo.description ?? "",
        label: promo.label ?? "",
        regular_total: Number(promo.regular_total),
        promotional_price: Number(promo.promotional_price),
        image_url: promo.image_url ?? "",
        image_price_note: promo.image_price_note ?? "",
        is_active: promo.is_active,
        is_featured: promo.is_featured,
      });
    }
  }, [promo, form]);

  useEffect(() => {
    if (!isNew || watchedSlug.trim()) return;
    if (watchedName.trim()) {
      form.setValue("slug", slugify(watchedName), { shouldDirty: true });
    }
  }, [isNew, watchedName, watchedSlug, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: PromoForm) => {
      const supabase = getSupabase();
      const payload = {
        ...values,
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        const { data, error } = await supabase.from("promotions").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
      const { error } = await supabase.from("promotions").update(payload).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (savedId) => {
      toast.success("Promotion saved");
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      navigate(isNew ? `/admin/promotions/${savedId}` : "/admin/promotions");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promotion deleted");
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      navigate("/admin/promotions");
    },
  });

  if (!isNew && isLoading) return <p>Loading…</p>;

  const slugForFolder = form.watch("slug") || "promo";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-deep">{isNew ? "Create promotion" : "Edit promotion"}</h1>
        <Button asChild variant="ghost">
          <Link to="/admin/promotions">Back</Link>
        </Button>
      </div>

      <form
        className="space-y-4 rounded-xl border border-border bg-white p-5"
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      >
        <ImageUploadField
          label="Promo package image"
          folder={`promotions/${slugForFolder}`}
          category="promotions"
          value={form.watch("image_url")}
          onChange={(url) => form.setValue("image_url", url, { shouldDirty: true })}
          previewClassName="max-h-72"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Package name</Label>
            <Input {...form.register("name", { required: true })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...form.register("slug", { required: true })} />
          </div>
          <div>
            <Label>Badge label</Label>
            <Input {...form.register("label")} placeholder="e.g. Bundle savings" />
          </div>
          <div>
            <Label>Regular total (PHP)</Label>
            <Input type="number" step="0.01" {...form.register("regular_total", { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Promotional price (PHP)</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("promotional_price", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <Label>Description / caption</Label>
          <Textarea rows={3} {...form.register("description")} />
        </div>
        <div>
          <Label>Internal price note (optional)</Label>
          <Textarea
            rows={2}
            {...form.register("image_price_note")}
            placeholder="Reminder if artwork shows a different price than the DB"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} /> Active on site
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_featured")} /> Featured
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            Save promotion
          </Button>
          {!isNew && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                if (window.confirm("Delete this promotion?")) deleteMutation.mutate();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
