import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadImageToStorage,
  type StorageBucket,
} from "@/lib/supabase/uploadMedia";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: StorageBucket;
  folder: string;
  category?: string;
  allowUrlFallback?: boolean;
  previewClassName?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  bucket = "public-media",
  folder,
  category,
  allowUrlFallback = true,
  previewClassName = "max-h-48",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadImageToStorage({
        file,
        bucket,
        folder,
        category,
      });
      onChange(publicUrl);
      toast.success("Image uploaded to Supabase Storage");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          <img
            src={value}
            alt=""
            className={`mx-auto w-full object-contain ${previewClassName}`}
          />
        </div>
      ) : (
        <p className="text-xs text-muted">No image selected yet.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>
      {allowUrlFallback && (
        <div>
          <Label className="text-xs text-muted">Or paste image URL</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}
