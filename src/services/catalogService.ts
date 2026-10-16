import { defaultProducts, defaultPromotions } from "@/config/defaultCatalog";
import { tryGetSupabase } from "@/lib/supabase/client";
import { parseMoney } from "@/lib/formatting/currency";
import type { Product, ProductImage, Promotion } from "@/types/database";

export type ProductWithImage = Product & { primary_image_url: string | null };

async function mapProductRow(
  row: Record<string, unknown>,
  images: ProductImage[],
): Promise<ProductWithImage> {
  const productId = row.id as string;
  const primary =
    images.find((i) => i.product_id === productId && i.is_primary) ??
    images.find((i) => i.product_id === productId);
  return {
    ...(row as unknown as Product),
    regular_price: parseMoney(row.regular_price as number),
    sale_price: row.sale_price != null ? parseMoney(row.sale_price as number) : null,
    primary_image_url: primary?.public_url ?? null,
  };
}

export async function fetchActiveProducts(): Promise<ProductWithImage[]> {
  const supabase = tryGetSupabase();
  if (!supabase) {
    return defaultProducts.map((p) => ({
      ...p,
      primary_image_url: p.image_url,
    }));
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  if (error || !products?.length) {
    return defaultProducts.map((p) => ({
      ...p,
      primary_image_url: p.image_url,
    }));
  }

  const ids = products.map((p) => p.id as string);
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", ids)
    .order("sort_order");

  return Promise.all(
    products.map((row) => mapProductRow(row, (images ?? []) as ProductImage[])),
  );
}

export async function fetchProductBySlug(slug: string): Promise<{
  product: ProductWithImage | null;
  images: ProductImage[];
}> {
  const supabase = tryGetSupabase();
  if (!supabase) {
    const local = defaultProducts.find((p) => p.slug === slug);
    if (!local) return { product: null, images: [] };
    return {
      product: { ...local, primary_image_url: local.image_url },
      images: [
        {
          id: "local-img",
          product_id: local.id,
          storage_path: null,
          public_url: local.image_url,
          alt_text: local.name,
          sort_order: 0,
          is_primary: true,
        },
      ],
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) return { product: null, images: [] };

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order");

  const mapped = await mapProductRow(product, (images ?? []) as ProductImage[]);
  return { product: mapped, images: (images ?? []) as ProductImage[] };
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const supabase = tryGetSupabase();
  if (!supabase) return defaultPromotions;

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  if (error || !data?.length) return defaultPromotions;
  return data.map((p) => ({
    ...(p as Promotion),
    regular_total: parseMoney(p.regular_total as number),
    promotional_price: parseMoney(p.promotional_price as number),
  }));
}

export function getEffectivePrice(product: Product): number {
  return product.sale_price != null && product.sale_price > 0
    ? product.sale_price
    : product.regular_price;
}
