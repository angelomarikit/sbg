import { useQuery } from "@tanstack/react-query";
import { FadeInSection } from "@/components/sections/FadeInSection";
import { DISCLAIMERS } from "@/config/theme";
import { fetchLandingTestimonials } from "@/services/cmsService";
import { localAssets, resolveAssetUrl } from "@/config/assets";

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["landing-testimonials"],
    queryFn: fetchLandingTestimonials,
  });

  const items = testimonials ?? [];

  return (
    <section id="testimonials" className="bg-gradient-to-b from-white to-fresh/50 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-deep">Customer Experiences</h2>
            <p className="mt-2 text-muted">
              Real stories shared by customers who use Salveo products in their everyday routines.
            </p>
          </div>
        </FadeInSection>

        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <figure
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-center bg-surface p-3 md:p-4">
                  <img
                    src={resolveAssetUrl(t.image_url, localAssets.testimonials.t1)}
                    alt={
                      t.customer_name
                        ? `Customer experience shared by ${t.customer_name}`
                        : "Salveo customer experience poster"
                    }
                    className="h-auto max-h-[420px] w-full object-contain object-center"
                    loading="lazy"
                  />
                </div>
                {t.quote && (
                  <blockquote className="border-t border-border px-4 py-3 text-sm text-muted">
                    {t.quote}
                  </blockquote>
                )}
                {t.customer_name && t.customer_name !== "Customer experience" && (
                  <figcaption className="px-4 pb-4 text-sm font-semibold text-deep">
                    {t.customer_name}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted">
          Individual experiences may vary. Shared materials reflect personal customer stories and are
          not a substitute for professional medical advice. {DISCLAIMERS.therapeutic}
        </p>
      </div>
    </section>
  );
}
