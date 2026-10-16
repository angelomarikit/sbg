export const localAssets = {
  brand: {
    logo: "/assets/brand/logo.png",
    ogShare: "/assets/og/og-share.jpg",
  },
  banners: {
    hero: "/assets/banners/banner.jpeg",
  },
  features: {
    whyChoose: "/assets/features/feature-1.jpg",
  },
  lifestyle: {
    routine: "/assets/lifestyle/mode-1.jpg",
  },
  education: {
    info1: "/assets/education/info-1.png",
    info2: "/assets/education/info-2.png",
  },
  products: {
    product1: "/assets/products/product-1.png",
    product2: "/assets/products/product-2.png",
    product3: "/assets/products/product-3.png",
    product4: "/assets/products/product-4.png",
    product5: "/assets/products/product-5.png",
    product6: "/assets/products/product-6.png",
  },
  promotions: {
    promo1: "/assets/promotions/promo-1.png",
    promo2: "/assets/promotions/promo-2.png",
    promo3: "/assets/promotions/promo-3.png",
    promo4: "/assets/promotions/promo-4.png",
    promo5: "/assets/promotions/promo-5.png",
    promo6: "/assets/promotions/promo-6.png",
    promo1jpg: "/assets/promotions/promo1.jpg",
  },
  testimonials: {
    t1: "/assets/testimonials/testimonial-1.png",
    t2: "/assets/testimonials/testimonial-2.png",
    t3: "/assets/testimonials/testimonial-3.png",
  },
} as const;

export function resolveAssetUrl(
  storageUrl: string | null | undefined,
  localFallback: string,
): string {
  return storageUrl?.trim() ? storageUrl : localFallback;
}
