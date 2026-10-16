import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Testimonials</h1>
      <p className="text-sm text-muted">
        Disease-related or treatment claims require manual compliance review before publishing.
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
            {item.image_url && (
              <img src={item.image_url} alt="" className="mt-3 max-h-48 rounded-lg object-cover" />
            )}
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
