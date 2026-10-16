import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/supabase/uploadMedia";

type ProductImageRow = {
  id: string;
  product_id: string;
  public_url: string | null;
  sort_order: number;
  is_primary: boolean;
};

async function fetchProductImages(productId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as ProductImageRow[];
}

export function ProductImagesEditor({ productId }: { productId: string | null }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: images } = useQuery({
    queryKey: ["admin-product-images", productId],
    queryFn: () => fetchProductImages(productId!),
    enabled: !!productId,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });

  const uploadAndAttach = async (file: File) => {
    if (!productId) {
      toast.error("Save the product first, then upload images.");
      return;
    }
    setUploading(true);
    try {
      const { publicUrl, storagePath } = await uploadImageToStorage({
        file,
        bucket: "public-media",
        folder: `products/${productId}`,
        category: "products",
      });
      const supabase = getSupabase();
      const isFirst = !(images?.length);
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        public_url: publicUrl,
        storage_path: storagePath,
        sort_order: images?.length ?? 0,
        is_primary: isFirst,
      });
      if (error) throw error;
      toast.success("Product image uploaded");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const setPrimary = useMutation({
    mutationFn: async (imageId: string) => {
      if (!productId) return;
      const supabase = getSupabase();
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
      const { error } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const removeImage = useMutation({
    mutationFn: async (imageId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("product_images").delete().eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image removed");
      refresh();
    },
  });

  if (!productId) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm text-muted">
        Save this product once to enable image uploads to Supabase Storage.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface/50 p-4">
      <Label>Product images (Supabase Storage)</Label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(images ?? []).map((img) => (
          <div key={img.id} className="relative rounded-lg border border-border bg-white p-2">
            {img.public_url && (
              <img src={img.public_url} alt="" className="mx-auto h-36 w-full object-contain" />
            )}
            <div className="mt-2 flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={img.is_primary ? "default" : "secondary"}
                onClick={() => setPrimary.mutate(img.id)}
              >
                <Star className="mr-1 h-3 w-3" />
                {img.is_primary ? "Primary" : "Set primary"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeImage.mutate(img.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadAndAttach(f);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Upload product image"}
      </Button>
    </div>
  );
}
