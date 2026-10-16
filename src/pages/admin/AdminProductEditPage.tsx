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

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  regular_price: number;
  sale_price: number | "";
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  ingredients: string;
  usage_notes: string;
};

async function fetchProduct(id: string) {
  if (id === "new") return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export function AdminProductEditPage() {
  const { id = "new" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = id === "new";

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const form = useForm<ProductForm>({
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      short_description: "",
      description: "",
      regular_price: 0,
      sale_price: "",
      stock_quantity: 0,
      is_active: true,
      is_featured: false,
      ingredients: "",
      usage_notes: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku ?? "",
        short_description: product.short_description ?? "",
        description: product.description ?? "",
        regular_price: Number(product.regular_price),
        sale_price: product.sale_price != null ? Number(product.sale_price) : "",
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        is_featured: product.is_featured,
        ingredients: product.ingredients ?? "",
        usage_notes: product.usage_notes ?? "",
      });
    }
  }, [product, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductForm) => {
      const supabase = getSupabase();
      const payload = {
        ...values,
        sale_price: values.sale_price === "" ? null : values.sale_price,
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
      }
      await supabase.from("activity_logs").insert({
        action_type: isNew ? "product_created" : "product_updated",
        entity_type: "product",
        entity_id: id,
      });
    },
    onSuccess: () => {
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  if (!isNew && isLoading) return <p>Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep">{isNew ? "Create Product" : "Edit Product"}</h1>
        <Button asChild variant="ghost">
          <Link to="/admin/products">Back</Link>
        </Button>
      </div>
      <form
        className="space-y-4 rounded-xl border border-border bg-white p-5"
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input {...form.register("name", { required: true })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...form.register("slug", { required: true })} />
          </div>
          <div>
            <Label>SKU</Label>
            <Input {...form.register("sku")} />
          </div>
          <div>
            <Label>Regular price</Label>
            <Input type="number" step="0.01" {...form.register("regular_price", { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Sale price</Label>
            <Input type="number" step="0.01" {...form.register("sale_price")} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" {...form.register("stock_quantity", { valueAsNumber: true })} />
          </div>
        </div>
        <div>
          <Label>Short description</Label>
          <Textarea {...form.register("short_description")} />
        </div>
        <div>
          <Label>Full description</Label>
          <Textarea rows={5} {...form.register("description")} />
        </div>
        <div>
          <Label>Ingredients</Label>
          <Textarea {...form.register("ingredients")} />
        </div>
        <div>
          <Label>Usage notes</Label>
          <Textarea {...form.register("usage_notes")} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} /> Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_featured")} /> Featured
          </label>
        </div>
        <Button type="submit" disabled={saveMutation.isPending}>
          Save product
        </Button>
      </form>
    </div>
  );
}
