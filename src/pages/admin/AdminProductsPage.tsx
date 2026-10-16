import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { formatPHP } from "@/lib/formatting/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

async function fetchProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: fetchProducts });
  const [search, setSearch] = useState("");

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("products").update({ is_archived: true, is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product archived");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-deep">Products</h1>
        <Button asChild>
          <Link to="/admin/products/new">Create product</Link>
        </Button>
      </div>
      <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{formatPHP(Number(product.sale_price ?? product.regular_price))}</td>
                  <td className="p-3">{product.stock_quantity}</td>
                  <td className="p-3">{product.is_active ? "Active" : "Inactive"}</td>
                  <td className="p-3 space-x-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link to={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => archiveMutation.mutate(product.id)}>
                      Archive
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
