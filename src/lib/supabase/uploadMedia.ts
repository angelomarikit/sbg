import { getSupabase } from "@/lib/supabase/client";

export type StorageBucket = "public-media" | "payment-qr";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, "-").slice(0, 80);
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }
}

export async function uploadImageToStorage(params: {
  file: File;
  bucket: StorageBucket;
  folder: string;
  category?: string;
  recordInLibrary?: boolean;
}): Promise<{ publicUrl: string; storagePath: string }> {
  validateImageFile(params.file);
  const supabase = getSupabase();
  const ext = params.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${params.folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(params.bucket)
    .upload(storagePath, params.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: params.file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage.from(params.bucket).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  if (params.recordInLibrary !== false && params.bucket === "public-media") {
    await supabase.from("media_assets").insert({
      filename: sanitizeFilename(params.file.name),
      category: params.category ?? params.folder,
      storage_path: storagePath,
      public_url: publicUrl,
    });
  }

  return { publicUrl, storagePath };
}
