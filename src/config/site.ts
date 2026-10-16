/** Default social / Open Graph preview image (Ivana Alawi promo banner). */
export const DEFAULT_OG_IMAGE_PATH = "/assets/og/og-share.jpg";

export const DEFAULT_OG_TITLE =
  "Salveo Barley Grass | Choose Salveo for Everyday Wellness";

export const DEFAULT_OG_DESCRIPTION =
  "Authorized Salveo Barley Grass affiliate — explore products, packages, and order with local assistance.";

export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Absolute URL required for og:image and Twitter cards. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = getSiteOrigin();
  if (!origin) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}
