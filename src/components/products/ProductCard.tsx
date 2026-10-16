import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPHP } from "@/lib/formatting/currency";
import { getEffectivePrice, type ProductWithImage } from "@/services/catalogService";
import { resolveAssetUrl } from "@/config/assets";
import { ProductImageFrame } from "@/components/products/ProductImageFrame";

type ProductCardProps = {
  product: ProductWithImage;
  fallbackImage: string;
};

export function ProductCard({ product, fallbackImage }: ProductCardProps) {
  const price = getEffectivePrice(product);
  const onSale =
    product.sale_price != null && product.sale_price < product.regular_price;
  const discountPct = onSale
    ? Math.round((1 - product.sale_price! / product.regular_price) * 100)
    : 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/80 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <ProductImageFrame
        src={resolveAssetUrl(product.primary_image_url, fallbackImage)}
        alt={product.name}
        size="card"
      />
      <CardContent className="flex min-h-[220px] flex-1 flex-col pt-5">
        <div className="flex flex-1 flex-col gap-3">
          <div className="space-y-1">
            <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-deep">
              {product.name}
            </h3>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted">
              {product.short_description}
            </p>
          </div>
          <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-deep">{formatPHP(price)}</span>
            {onSale && (
              <>
                <span className="text-sm text-muted line-through">
                  {formatPHP(product.regular_price)}
                </span>
                <Badge variant="sale">-{discountPct}%</Badge>
              </>
            )}
          </div>
          <p className="text-xs text-muted">
            {product.stock_quantity > 0 ? "In stock" : "Out of stock"}
          </p>
        </div>
        <Button
          asChild
          className="mt-4 w-full shrink-0"
          disabled={product.stock_quantity <= 0}
        >
          <Link to={`/products/${product.slug}`}>View Product</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
