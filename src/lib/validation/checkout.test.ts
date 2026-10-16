import { describe, expect, it } from "vitest";
import { checkoutFormSchema } from "@/lib/validation/checkout";

describe("checkoutFormSchema", () => {
  it("accepts valid PH mobile numbers", () => {
    const result = checkoutFormSchema.safeParse({
      fullName: "Juan Dela Cruz",
      mobile: "09171234567",
      email: "",
      region: "NCR",
      province: "Metro Manila",
      city: "Quezon City",
      barangay: "Bagong Pag-asa",
      streetAddress: "123 Example Street",
      postalCode: "1100",
      paymentMethodId: "test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid mobile", () => {
    const result = checkoutFormSchema.safeParse({
      fullName: "Test",
      mobile: "1234",
      region: "NCR",
      province: "Metro Manila",
      city: "Quezon City",
      barangay: "Test",
      streetAddress: "123 Test Street Long Enough",
      postalCode: "1100",
      paymentMethodId: "test",
    });
    expect(result.success).toBe(false);
  });
});
