import { useEffect } from "react";
import {
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_TITLE,
  toAbsoluteUrl,
} from "@/config/site";

type PageMetaProps = {
  title?: string;
  description?: string;
  /** Path or full URL; defaults to site OG banner. */
  image?: string;
  /** When true, sets og:type to product (PDP). */
  ogType?: "website" | "product";
};

function upsertMeta(
  selector: string,
  attrs: Record<string, string>,
  content: string,
) {
  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    for (const [key, value] of Object.entries(attrs)) {
      tag.setAttribute(key, value);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function PageMeta({
  title,
  description,
  image = DEFAULT_OG_IMAGE_PATH,
  ogType = "website",
}: PageMetaProps) {
  useEffect(() => {
    const pageTitle = title ?? DEFAULT_OG_TITLE;
    const pageDescription = description ?? DEFAULT_OG_DESCRIPTION;
    const pageImage = toAbsoluteUrl(image);

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: "description" }, pageDescription);

    upsertMeta('meta[property="og:title"]', { property: "og:title" }, pageTitle);
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      pageDescription,
    );
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, pageImage);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, ogType);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "Salveo Barley Grass");

    const canonical = typeof window !== "undefined" ? window.location.href : "";
    if (canonical) {
      upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    }

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, pageTitle);
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      pageDescription,
    );
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, pageImage);
  }, [title, description, image, ogType]);

  return null;
}
