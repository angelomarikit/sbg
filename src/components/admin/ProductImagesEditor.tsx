import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/supabase/uploadMedia";

export type PendingProductImage = {
  clientId: string;
  publicUrl: string;
  storagePath: string;
  isPrimary: boolean;
};

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

function newClientId() {
  return crypto.randomUUID();
}

type ProductImagesEditorProps = {
  productId: string | null;
  /** Used for storage folder when creating a product (before save). */
  stagingKey: string;
  pendingImages: PendingProductImage[];
  onPendingImagesChange: (images: PendingProductImage[]) => void;
};

export function ProductImagesEditor({
  productId,
  stagingKey,
  pendingImages,
  onPendingImagesChange,
}: ProductImagesEditorProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: images } = useQuery({
    queryKey: ["admin-product-images", productId],
    queryFn: () => fetchProductImages(productId!),
    enabled: !!productId,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });

  const uploadFolder = productId
    ? `products/${productId}`
    : `products/staging/${stagingKey || "new"}`;

  const uploadAndAttach = async (file: File) => {
    setUploading(true);
    try {
      const { publicUrl, storagePath } = await uploadImageToStorage({
        file,
        bucket: "public-media",
        folder: uploadFolder,
        category: "products",
      });

      if (!productId) {
        const isFirst = pendingImages.length === 0;
        onPendingImagesChange([
          ...pendingImages,
          {
            clientId: newClientId(),
            publicUrl,
            storagePath,
            isPrimary: isFirst,
          },
        ]);
        toast.success("Image uploaded — save the product to publish it");
        return;
      }

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

  const setPendingPrimary = (clientId: string) => {
    onPendingImagesChange(
      pendingImages.map((img) => ({
        ...img,
        isPrimary: img.clientId === clientId,
      })),
    );
  };

  const removePending = (clientId: string) => {
    const next = pendingImages.filter((img) => img.clientId !== clientId);
    if (next.length && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onPendingImagesChange(next);
  };

  const savedGallery = images ?? [];
  const showPending = !productId;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface/50 p-4">
      <div>
        <Label>Product images</Label>
        <p className="mt-1 text-xs text-muted">
          Upload photos to Supabase Storage. You can add images before saving a new product; they
          attach when you click Save product.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {showPending &&
          pendingImages.map((img) => (
            <div key={img.clientId} className="relative rounded-lg border border-border bg-white p-2">
              <img src={img.publicUrl} alt="" className="mx-auto h-36 w-full object-contain" />
              <div className="mt-2 flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={img.isPrimary ? "default" : "secondary"}
                  onClick={() => setPendingPrimary(img.clientId)}
                >
                  <Star className="mr-1 h-3 w-3" />
                  {img.isPrimary ? "Primary" : "Set primary"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => removePending(img.clientId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

        {productId &&
          savedGallery.map((img) => (
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
                <Button type="button" size="sm" variant="ghost" onClick={() => removeImage.mutate(img.id)}>
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

/** Insert gallery rows after a new product is created. */
export async function attachPendingProductImages(
  productId: string,
  pendingImages: PendingProductImage[],
) {
  if (!pendingImages.length) return;
  const supabase = getSupabase();
  const { error } = await supabase.from("product_images").insert(
    pendingImages.map((img, index) => ({
      product_id: productId,
      public_url: img.publicUrl,
      storage_path: img.storagePath,
      sort_order: index,
      is_primary: img.isPrimary,
    })),
  );
  if (error) throw error;
}
