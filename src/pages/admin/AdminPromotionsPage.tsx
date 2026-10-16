import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Badge } from "@/components/ui/badge";

async function fetchPromotions() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("promotions").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function AdminPromotionsPage() {
  const { data: promos, isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: fetchPromotions,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Promotional Packages</h1>
      <p className="text-sm text-muted">
        Compare live pricing with promotional artwork. Update images or DB prices when they diverge.
      </p>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(promos ?? []).map((promo) => {
            const savings = Number(promo.regular_total) - Number(promo.promotional_price);
            return (
              <div key={promo.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-deep">{promo.name}</h2>
                  {promo.is_active ? <Badge>Active</Badge> : <Badge variant="muted">Inactive</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">{promo.description}</p>
                <p className="mt-3 text-sm">
                  DB price: {formatPHP(Number(promo.promotional_price))} (was {formatPHP(Number(promo.regular_total))})
                </p>
                <p className="text-sm text-primary">Save {formatPHP(savings)}</p>
                {promo.image_price_note && (
                  <p className="mt-2 rounded-lg bg-accent/20 p-2 text-xs text-deep">
                    Image check: {promo.image_price_note}
                  </p>
                )}
                {promo.image_url && (
                  <img src={promo.image_url} alt="" className="mt-3 max-h-40 rounded-lg object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
