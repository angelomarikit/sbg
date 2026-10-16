import {
  defaultFaqs,
  defaultSections,
} from "@/config/defaultCatalog";
import { landingTestimonialPosters } from "@/config/testimonialPosters";
import { tryGetSupabase } from "@/lib/supabase/client";
import type { Faq, SiteSection, Testimonial } from "@/types/database";
import type { SiteSettings } from "@/types/database";
import { localAssets } from "@/config/assets";
import { DISCLAIMERS } from "@/config/theme";

const defaultSettings: SiteSettings = {
  id: "local",
  brand_name: "Salveo Barley Grass",
  logo_url: localAssets.brand.logo,
  contact_phone: null,
  contact_email: null,
  messenger_url: null,
  shipping_fee_flat: 150,
  free_shipping_threshold: null,
  footer_description:
    "Authorized Salveo affiliate — explore barley grass products and packages for everyday wellness.",
  disclaimer: DISCLAIMERS.footer,
  seo_default_title: "Salveo Barley Grass",
  seo_default_description:
    "Explore Salveo Barley Grass products, packages, and order with local assistance.",
  social_facebook: null,
  social_instagram: null,
  policies: {
    privacy: "Privacy policy — configure in admin.",
    terms: "Terms and conditions — configure in admin.",
    shipping: "Shipping policy — configure in admin.",
    refund: "Refund policy — configure in admin.",
  },
};

export async function fetchLandingSections(): Promise<SiteSection[]> {
  const supabase = tryGetSupabase();
  if (!supabase) {
    return defaultSections.filter((s) => s.is_visible).sort((a, b) => a.display_order - b.display_order);
  }

  const { data } = await supabase
    .from("site_sections")
    .select("*")
    .eq("page_id", "home")
    .eq("publish_status", "published")
    .eq("is_visible", true)
    .order("display_order");

  if (!data?.length) {
    return defaultSections.filter((s) => s.is_visible).sort((a, b) => a.display_order - b.display_order);
  }
  return data as SiteSection[];
}

export async function fetchSectionByKey(key: string): Promise<SiteSection | null> {
  const sections = await fetchLandingSections();
  return sections.find((s) => s.section_key === key) ?? defaultSections.find((s) => s.section_key === key) ?? null;
}

export async function fetchFaqs(): Promise<Faq[]> {
  const supabase = tryGetSupabase();
  if (!supabase) return defaultFaqs;

  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order");

  return (data as Faq[])?.length ? (data as Faq[]) : defaultFaqs;
}

/** Testimonials for the home page — visible CMS rows, or default poster assets. */
export async function fetchLandingTestimonials(): Promise<Testimonial[]> {
  const supabase = tryGetSupabase();
  if (!supabase) {
    return landingTestimonialPosters;
  }

  const { data: visible } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_visible", true)
    .not("image_url", "is", null)
    .order("sort_order");

  if (visible?.length) {
    return visible as Testimonial[];
  }

  const { data: approved } = await supabase
    .from("testimonials")
    .select("*")
    .eq("approval_status", "approved")
    .order("sort_order");

  if (approved?.length) {
    return approved as Testimonial[];
  }

  return landingTestimonialPosters;
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const supabase = tryGetSupabase();
  if (!supabase) return defaultSettings;

  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return data ? (data as SiteSettings) : defaultSettings;
}
