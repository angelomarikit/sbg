import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveAssetUrl, localAssets } from "@/config/assets";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-deep">Promotional Packages</h1>
          <p className="text-sm text-muted">
            Add or edit packages shown in the landing promos section. Match prices to your artwork.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/promotions/new">Add promotion</Link>
        </Button>
      </div>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(promos ?? []).map((promo) => {
            const savings = Number(promo.regular_total) - Number(promo.promotional_price);
            return (
              <div key={promo.id} className="overflow-hidden rounded-xl border border-border bg-white">
                <img
                  src={resolveAssetUrl(promo.image_url, localAssets.promotions.promo3)}
                  alt=""
                  className="h-44 w-full object-cover object-top"
                />
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-deep">{promo.name}</h2>
                    {promo.is_active ? <Badge>Active</Badge> : <Badge variant="muted">Inactive</Badge>}
                    {promo.is_featured && <Badge variant="sale">Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted">{promo.description}</p>
                  <p className="text-sm">
                    {formatPHP(Number(promo.promotional_price))}{" "}
                    <span className="text-muted line-through">
                      {formatPHP(Number(promo.regular_total))}
                    </span>
                  </p>
                  <p className="text-sm text-primary">Save {formatPHP(savings)}</p>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/admin/promotions/${promo.id}`}>Edit promotion</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
