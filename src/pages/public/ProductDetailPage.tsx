import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DISCLAIMERS } from "@/config/theme";
import { resolveAssetUrl, localAssets } from "@/config/assets";
import { formatPHP } from "@/lib/formatting/currency";
import { setCheckoutFromProduct } from "@/features/checkout/checkoutSession";
import {
  fetchActiveProducts,
  fetchProductBySlug,
  getEffectivePrice,
} from "@/services/catalogService";
import { ProductImageFrame } from "@/components/products/ProductImageFrame";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });

  const { data: allProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchActiveProducts,
  });

  const product = data?.product;
  const images = useMemo(() => {
    if (!product) return [];
    if (data?.images?.length) return data.images;
    return [
      {
        id: "fallback",
        product_id: product.id,
        storage_path: null,
        public_url: product.primary_image_url,
        alt_text: product.name,
        sort_order: 0,
        is_primary: true,
      },
    ];
  }, [data?.images, product]);

  const related = (allProducts ?? [])
    .filter((p) => p.slug !== slug && p.category_id === product?.category_id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-deep">Product not found</h1>
        <Button asChild className="mt-4">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const unitPrice = getEffectivePrice(product);
  const onSale = product.sale_price != null && product.sale_price < product.regular_price;
  const gallery = images.map((img) =>
    resolveAssetUrl(img.public_url, localAssets.products.product2),
  );

  const buyNow = () => {
    if (product.stock_quantity <= 0) return;
    setCheckoutFromProduct({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: gallery[0] ?? localAssets.products.product2,
      unitPrice,
      quantity: qty,
    });
    navigate("/checkout");
  };

  return (
    <>
      <PageMeta title={`${product.name} | Salveo`} description={product.short_description ?? undefined} />
      <div className="bg-gradient-to-b from-fresh/60 via-fresh/25 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link to="/#products">← Back to products</Link>
          </Button>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <ProductImageFrame
                src={gallery[activeImage]}
                alt={product.name}
                size="detail"
                className="rounded-xl"
              />
              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {gallery.map((src, idx) => (
                    <button
                      key={src + idx}
                      type="button"
                      className={`shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === idx ? "border-primary" : "border-border"}`}
                      onClick={() => setActiveImage(idx)}
                    >
                      <ProductImageFrame src={src} alt="" size="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5 rounded-2xl border border-border/80 bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <div>
              <p className="text-sm font-medium text-primary">Salveo Product</p>
              <h1 className="mt-1 text-3xl font-bold text-deep">{product.name}</h1>
              <p className="mt-2 text-muted">{product.short_description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-deep">{formatPHP(unitPrice)}</span>
              {onSale && (
                <>
                  <span className="text-lg text-muted line-through">
                    {formatPHP(product.regular_price)}
                  </span>
                  <Badge variant="sale">On sale</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted">
              {product.stock_quantity > 0
                ? `${product.stock_quantity} available`
                : "Currently out of stock"}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-deep">Quantity</span>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center font-semibold">{qty}</span>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQty((q) => Math.min(product.stock_quantity || 1, q + 1))
                  }
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-fresh px-4 py-3 text-sm text-deep">
              Order total: <strong>{formatPHP(unitPrice * qty)}</strong>
            </div>

            <Button size="lg" className="w-full md:w-auto" disabled={product.stock_quantity <= 0} onClick={buyNow}>
              Buy Now
            </Button>

            <p className="text-xs font-semibold text-deep">{DISCLAIMERS.therapeutic}</p>
            </div>
          </div>

          <div className="mt-10 space-y-6 pb-8">
            <section className="rounded-2xl border border-border/80 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-deep">Product Overview</h2>
              <p className="mt-3 whitespace-pre-line text-muted">{product.description}</p>
            </section>
            {product.ingredients && (
              <section className="rounded-2xl border border-primary/15 bg-fresh/40 p-6">
                <h2 className="text-xl font-bold text-deep">Ingredients / Packaging</h2>
                <p className="mt-3 text-muted">{product.ingredients}</p>
              </section>
            )}
            {product.usage_notes && (
              <section className="rounded-2xl border border-border/80 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-deep">Suggested Usage</h2>
                <p className="mt-3 text-muted">{product.usage_notes}</p>
              </section>
            )}
            {!!related.length && (
              <section className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-deep">Related Products</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className="overflow-hidden rounded-xl border border-border bg-white transition hover:border-primary"
                    >
                      <ProductImageFrame
                        src={resolveAssetUrl(p.primary_image_url, localAssets.products.product2)}
                        alt={p.name}
                        size="card"
                        className="h-40"
                      />
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-semibold text-deep">{p.name}</p>
                        <p className="text-sm text-primary">{formatPHP(getEffectivePrice(p))}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-3 md:hidden">
        <Button className="w-full" disabled={product.stock_quantity <= 0} onClick={buyNow}>
          Buy Now — {formatPHP(unitPrice * qty)}
        </Button>
      </div>
    </>
  );
}
