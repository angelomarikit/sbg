import { z } from "zod";

const phMobileRegex = /^(\+639|09)\d{9}$/;

export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  mobile: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => phMobileRegex.test(v), {
      message: "Enter a valid Philippine mobile number (09XXXXXXXXX)",
    }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetAddress: z.string().min(5, "Enter your street address"),
  postalCode: z.string().min(4, "Enter postal code"),
  deliveryInstructions: z.string().optional(),
  paymentMethodId: z.string().min(1, "Select a payment method"),
  transactionReference: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const orderLookupSchema = z.object({
  reference: z.string().min(6, "Enter your order reference"),
  mobile: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => phMobileRegex.test(v), {
      message: "Enter the mobile number used on the order",
    }),
});
