import { localAssets } from "@/config/assets";
import type { Testimonial } from "@/types/database";

/** Default landing-page testimonial posters (local assets). */
export const landingTestimonialPosters: Testimonial[] = [
  {
    id: "poster-1",
    customer_name: "Customer experience",
    quote: null,
    image_url: localAssets.testimonials.t1,
    sort_order: 1,
    is_visible: true,
    approval_status: "approved",
    requires_compliance_review: true,
  },
  {
    id: "poster-2",
    customer_name: "Customer experience",
    quote: null,
    image_url: localAssets.testimonials.t2,
    sort_order: 2,
    is_visible: true,
    approval_status: "approved",
    requires_compliance_review: true,
  },
  {
    id: "poster-3",
    customer_name: "Customer experience",
    quote: null,
    image_url: localAssets.testimonials.t3,
    sort_order: 3,
    is_visible: true,
    approval_status: "approved",
    requires_compliance_review: true,
  },
];
