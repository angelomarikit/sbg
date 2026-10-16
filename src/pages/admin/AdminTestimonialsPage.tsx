import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

async function fetchTestimonials() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-testimonials"], queryFn: fetchTestimonials });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("testimonials")
        .update({ approval_status: "approved", is_visible: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial approved for publication");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, image_url }: { id: string; image_url: string }) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("testimonials").update({ image_url }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial image updated");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Testimonials</h1>
      <p className="text-sm text-muted">
        Upload poster images to Supabase Storage. Disease-related claims require compliance review
        before publishing.
      </p>
      <div className="space-y-4">
        {(items ?? []).map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-deep">{item.customer_name ?? "Anonymous"}</h2>
              <Badge variant={item.approval_status === "approved" ? "default" : "sale"}>
                {item.approval_status}
              </Badge>
              {item.requires_compliance_review && <Badge variant="sale">Compliance review</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted">{item.quote}</p>
            <div className="mt-4">
              <ImageUploadField
                label="Testimonial poster"
                folder="testimonials"
                category="testimonials"
                value={item.image_url ?? ""}
                onChange={(url) => updateImage.mutate({ id: item.id, image_url: url })}
                previewClassName="max-h-56"
              />
            </div>
            {item.approval_status !== "approved" && (
              <Button size="sm" className="mt-3" onClick={() => approveMutation.mutate(item.id)}>
                Approve & publish
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
