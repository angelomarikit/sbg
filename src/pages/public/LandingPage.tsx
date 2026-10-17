import { useQuery } from "@tanstack/react-query";
import {
  HeartHandshake,
  Leaf,
  Package,
  PhoneCall,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FadeInSection } from "@/components/sections/FadeInSection";
import { ProductCard } from "@/components/products/ProductCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { localAssets, resolveAssetUrl } from "@/config/assets";
import { formatPHP } from "@/lib/formatting/currency";
import {
  fetchActiveProducts,
  fetchPromotions,
} from "@/services/catalogService";
import {
  fetchFaqs,
  fetchSectionByKey,
  fetchSiteSettings,
} from "@/services/cmsService";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Skeleton } from "@/components/ui/skeleton";

const trustItems = [
  { icon: Leaf, title: "Barley Grass Product Range" },
  { icon: Package, title: "Convenient Product Formats" },
  { icon: HeartHandshake, title: "Options for Everyday Routines" },
  { icon: PhoneCall, title: "Local Ordering Assistance" },
];

export function LandingPage() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchActiveProducts,
  });
  const { data: promos } = useQuery({ queryKey: ["promotions"], queryFn: fetchPromotions });
  const { data: faqs } = useQuery({ queryKey: ["faqs"], queryFn: fetchFaqs });
  const { data: hero } = useQuery({
    queryKey: ["section", "hero"],
    queryFn: () => fetchSectionByKey("hero"),
  });
  const { data: why } = useQuery({
    queryKey: ["section", "why_choose"],
    queryFn: () => fetchSectionByKey("why_choose"),
  });
  const { data: lifestyle } = useQuery({
    queryKey: ["section", "lifestyle"],
    queryFn: () => fetchSectionByKey("lifestyle"),
  });
  const { data: trustStrip } = useQuery({
    queryKey: ["section", "trust_strip"],
    queryFn: () => fetchSectionByKey("trust_strip"),
  });
  const { data: productsSection } = useQuery({
    queryKey: ["section", "products"],
    queryFn: () => fetchSectionByKey("products"),
  });
  const { data: formatsSection } = useQuery({
    queryKey: ["section", "formats"],
    queryFn: () => fetchSectionByKey("formats"),
  });
  const { data: promotionsSection } = useQuery({
    queryKey: ["section", "promotions"],
    queryFn: () => fetchSectionByKey("promotions"),
  });
  const { data: faqSection } = useQuery({
    queryKey: ["section", "faq"],
    queryFn: () => fetchSectionByKey("faq"),
  });
  const { data: finalCta } = useQuery({
    queryKey: ["section", "final_cta"],
    queryFn: () => fetchSectionByKey("final_cta"),
  });
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const heroJson = (hero?.content_json ?? {}) as Record<string, { label: string; href: string }> & {
    trustLine?: string;
  };
  const whyJson = (why?.content_json ?? {}) as {
    bullets?: string[];
    cta?: { label: string; href: string };
  };
  const lifestyleJson = (lifestyle?.content_json ?? {}) as {
    cta?: { label: string; href: string };
  };
  const trustJson = (trustStrip?.content_json ?? {}) as { items?: { title: string }[] };
  const formatsJson = (formatsSection?.content_json ?? {}) as {
    items?: { title: string; slug: string; caption: string; image_url: string }[];
  };
  const finalCtaJson = (finalCta?.content_json ?? {}) as {
    cta?: { label: string; href: string };
  };

  const trustTitles =
    trustJson.items?.length && trustStrip?.is_visible !== false
      ? trustJson.items.map((i) => i.title)
      : trustItems.map((t) => t.title);

  const formatCards =
    formatsJson.items?.length && formatsSection?.is_visible !== false
      ? formatsJson.items
      : [
          {
            title: "Powder in Jar",
            slug: "sbg-powder-jar-240g",
            caption: "Learn more about this Salveo format.",
            image_url: localAssets.promotions.promo5,
          },
          {
            title: "Trial Pack",
            slug: "sbg-trial-pack-80g",
            caption: "Learn more about this Salveo format.",
            image_url: localAssets.products.product4,
          },
          {
            title: "On The Go Sachets",
            slug: "sbg-on-the-go-12",
            caption: "Learn more about this Salveo format.",
            image_url: localAssets.products.product2,
          },
          {
            title: "Capsules",
            slug: "sbg-capsules-120",
            caption: "Learn more about this Salveo format.",
            image_url: localAssets.products.product3,
          },
        ];

  return (
    <>
      <PageMeta
        title={settings?.seo_default_title ?? "Salveo Barley Grass"}
        description={settings?.seo_default_description ?? undefined}
      />

      <section className="border-b border-border bg-gradient-to-br from-white via-fresh/30 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10 lg:py-14">
          <FadeInSection>
            <div className="max-w-xl lg:max-w-none">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                {hero?.subtitle ?? "YOUR DAILY WELLNESS COMPANION"}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-deep md:text-4xl lg:text-[2.65rem] lg:leading-tight">
                {hero?.title ?? "Choose Salveo for Your Family's Everyday Wellness"}
              </h1>
              <p className="mt-4 text-base text-muted md:text-lg">
                {hero?.body ??
                  "Discover the Salveo Barley Grass product range and find an option that fits your everyday routine."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={heroJson.primaryCta?.href ?? "#products"}>
                    {heroJson.primaryCta?.label ?? "Explore Products"}
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href={heroJson.secondaryCta?.href ?? "#promos"}>
                    {heroJson.secondaryCta?.label ?? "View Promos"}
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted">
                {heroJson.trustLine ?? "Explore the available barley grass formats and packages."}
              </p>
            </div>
          </FadeInSection>
          <FadeInSection>
            <div className="flex w-full items-center justify-center rounded-2xl border border-border bg-white p-3 shadow-sm md:p-4">
              <img
                src={resolveAssetUrl(hero?.image_url, localAssets.banners.hero)}
                alt="Salveo family wellness banner"
                className="h-auto max-h-[min(520px,75vh)] w-full object-contain object-center"
              />
            </div>
          </FadeInSection>
        </div>
      </section>

      {trustStrip?.is_visible !== false && (
        <section className="border-y border-border bg-surface py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4 md:px-6">
            {trustTitles.map((title, index) => {
              const Icon = trustItems[index]?.icon ?? Leaf;
              return (
                <div key={title} className="rounded-xl border border-border bg-white p-4">
                  <Icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
                  <p className="text-sm font-semibold text-deep">{title}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section id="why-salveo" className="bg-gradient-to-b from-fresh/50 to-white py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2">
          <img
            src={resolveAssetUrl(why?.image_url, localAssets.features.whyChoose)}
            alt="Why choose Salveo Barley Grass"
            className="w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <FadeInSection>
            <h2 className="text-3xl font-bold text-deep">
              {why?.title ?? "Discover Salveo Barley Grass"}
            </h2>
            <p className="mt-2 text-muted">{why?.subtitle}</p>
            <p className="mt-4 text-muted">{why?.body}</p>
            <ul className="mt-5 space-y-2">
              {(whyJson.bullets ?? []).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-deep">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6">
              <a href={whyJson.cta?.href ?? "#products"}>
                {whyJson.cta?.label ?? "Explore Our Products"}
              </a>
            </Button>
          </FadeInSection>
        </div>
      </section>

      {productsSection?.is_visible !== false && (
      <section id="products" className="bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-deep">
              {productsSection?.title ?? "Find Your Salveo Product"}
            </h2>
            <p className="mt-2 text-muted">
              {productsSection?.body ??
                "Explore our available products and find the right format for you."}
            </p>
          </div>
          {loadingProducts ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <div className="grid auto-rows-fr items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(products ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  fallbackImage={localAssets.products.product2}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      <section id="lifestyle" className="bg-gradient-to-b from-white to-fresh/40 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-deep">
              {lifestyle?.title ?? "Make Salveo Part of Your Everyday Routine"}
            </h2>
            <p className="mt-4 text-muted">{lifestyle?.body}</p>
            <Button asChild className="mt-6">
              <a href={lifestyleJson.cta?.href ?? "#products"}>
                {lifestyleJson.cta?.label ?? "Find Your Product"}
              </a>
            </Button>
          </FadeInSection>
          <img
            src={resolveAssetUrl(lifestyle?.image_url, localAssets.lifestyle.routine)}
            alt="Salveo lifestyle"
            className="w-full rounded-2xl object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {formatsSection?.is_visible !== false && (
      <section id="formats" className="border-y border-border bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-3xl font-bold text-deep">
            {formatsSection?.title ?? "Available Product Formats"}
          </h2>
          {formatsSection?.body && <p className="mt-2 text-muted">{formatsSection.body}</p>}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {formatCards.map((card) => (
              <div key={card.slug} className="rounded-xl border border-border p-4">
                <img
                  src={resolveAssetUrl(card.image_url, localAssets.products.product2)}
                  alt=""
                  className="mx-auto h-28 object-contain"
                  loading="lazy"
                />
                <h3 className="mt-3 font-semibold text-deep">{card.title}</h3>
                <p className="mt-1 text-sm text-muted">{card.caption}</p>
                <Button asChild variant="secondary" size="sm" className="mt-3 w-full">
                  <Link to={`/products/${card.slug}`}>View details</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {promotionsSection?.is_visible !== false && (
      <section id="promos" className="bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-3xl font-bold text-deep">
            {promotionsSection?.title ?? "More Value with Salveo Packages"}
          </h2>
          <p className="mt-2 text-muted">
            {promotionsSection?.body ?? "Explore available packages and exclusive offers."}
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {(promos ?? []).slice(0, 3).map((promo) => {
              const savings = promo.regular_total - promo.promotional_price;
              return (
                <div key={promo.id} className="overflow-hidden rounded-xl border border-border bg-white">
                  <img
                    src={resolveAssetUrl(promo.image_url, localAssets.promotions.promo3)}
                    alt={promo.name}
                    className="h-56 w-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="space-y-2 p-5">
                    <div className="flex flex-wrap gap-2">
                      {promo.label && <Badge variant="sale">{promo.label}</Badge>}
                    </div>
                    <h3 className="text-lg font-bold text-deep">{promo.name}</h3>
                    <p className="text-sm text-muted">{promo.description}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-deep">
                        {formatPHP(promo.promotional_price)}
                      </span>
                      <span className="text-sm text-muted line-through">
                        {formatPHP(promo.regular_total)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary">Save {formatPHP(savings)}</p>
                    <Button asChild className="w-full">
                      <a href="#products">View package products</a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      <TestimonialsSection />

      {faqSection?.is_visible !== false && (
      <section id="faqs" className="bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold text-deep">
            {faqSection?.title ?? "FAQs"}
          </h2>
          {faqSection?.body && <p className="mt-2 text-center text-muted">{faqSection.body}</p>}
          <Accordion type="single" collapsible className="mt-8">
            {(faqs ?? []).map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      )}

      {finalCta?.is_visible !== false && (
      <section className="bg-fresh py-14">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold text-deep">
            {finalCta?.title ?? "Ready to Explore Salveo?"}
          </h2>
          <p className="mt-3 text-muted">
            {finalCta?.body ?? "Browse our products and choose the option that suits your preferences."}
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href={finalCtaJson.cta?.href ?? "#products"}>
              {finalCtaJson.cta?.label ?? "Shop Salveo Products"}
            </a>
          </Button>
        </div>
      </section>
      )}
    </>
  );
}
