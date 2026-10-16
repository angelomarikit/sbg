import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadImageToStorage } from "@/lib/supabase/uploadMedia";

const categories = ["brand", "banners", "products", "promotions", "testimonials", "lifestyle", "payment_qr", "other"];

async function fetchMedia() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function AdminMediaPage() {
  const qc = useQueryClient();
  const [category, setCategory] = useState("products");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: media } = useQuery({ queryKey: ["admin-media"], queryFn: fetchMedia });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      await uploadImageToStorage({
        file,
        bucket: "public-media",
        folder: category,
        category,
      });
    },
    onSuccess: () => {
      toast.success("Uploaded to Supabase Storage");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Media Library</h1>
      <p className="text-sm text-muted">
        All uploads go to the <strong>public-media</strong> bucket and appear here for reuse.
      </p>
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-white p-4">
        <div>
          <Label>Category</Label>
          <select
            className="mt-1 h-11 rounded-lg border border-border px-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              uploadMutation.mutate(file);
            }}
          />
          <Button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(media ?? []).map((asset) => (
          <div key={asset.id} className="rounded-xl border border-border bg-white p-3">
            {asset.public_url && (
              <img src={asset.public_url} alt="" className="h-32 w-full rounded-lg object-contain bg-surface" />
            )}
            <p className="mt-2 truncate text-xs font-medium">{asset.filename}</p>
            <p className="text-xs text-muted">{asset.category}</p>
            <button
              type="button"
              className="mt-1 text-xs text-primary"
              onClick={() => {
                navigator.clipboard.writeText(asset.public_url ?? "");
                toast.success("URL copied");
              }}
            >
              Copy URL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
