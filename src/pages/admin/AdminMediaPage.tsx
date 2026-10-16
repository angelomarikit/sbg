import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [file, setFile] = useState<File | null>(null);
  const { data: media } = useQuery({ queryKey: ["admin-media"], queryFn: fetchMedia });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file");
      const supabase = getSupabase();
      const path = `${category}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("public-media").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("public-media").getPublicUrl(path);
      const { error } = await supabase.from("media_assets").insert({
        filename: file.name,
        category,
        storage_path: path,
        public_url: publicUrlData.publicUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      setFile(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Upload failed"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Media Library</h1>
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
        <div>
          <Label>Image file</Label>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => uploadMutation.mutate()} disabled={!file}>
            Upload
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(media ?? []).map((asset) => (
          <div key={asset.id} className="rounded-xl border border-border bg-white p-3">
            {asset.public_url && (
              <img src={asset.public_url} alt="" className="h-32 w-full rounded-lg object-cover" />
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
