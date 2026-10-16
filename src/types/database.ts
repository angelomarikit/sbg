export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus =
  | "awaiting_payment"
  | "payment_review"
  | "paid"
  | "rejected"
  | "refunded";

export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  specifications: Json | null;
  usage_notes: string | null;
  ingredients: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string | null;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  regular_total: number;
  promotional_price: number;
  label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export interface SiteSection {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  content_json: Json | null;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  publish_status: string;
}

export interface Testimonial {
  id: string;
  customer_name: string | null;
  quote: string | null | undefined;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  approval_status: string;
  requires_compliance_review: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_visible: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  account_holder: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Order {
  id: string;
  public_reference: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: Json;
  shipping_fee: number;
  subtotal: number;
  discount_total: number;
  grand_total: number;
  payment_method_id: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  promotion_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface SiteSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  messenger_url: string | null;
  shipping_fee_flat: number;
  free_shipping_threshold: number | null;
  footer_description: string | null;
  disclaimer: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  policies: Json | null;
}

export interface Database {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
  };
}
