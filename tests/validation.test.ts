import { describe, expect, it } from "vitest";
import { fieldErrors, quoteSchema } from "@/lib/validation";

const valid = {
  fullName: "Jane Doe",
  email: "Jane@Example.com",
  address: "Torstrasse 1, Berlin",
  monthlyConsumptionKwh: "420",
  systemSizeKw: "5",
};

describe("quoteSchema", () => {
  it("accepts valid input and converts numbers from form strings", () => {
    const parsed = quoteSchema.parse(valid);
    expect(parsed.monthlyConsumptionKwh).toBe(420);
    expect(parsed.email).toBe("jane@example.com");
    expect(parsed.downPayment).toBeUndefined();
  });

  it("rejects missing and non-positive fields", () => {
    const result = quoteSchema.safeParse({ ...valid, address: "", systemSizeKw: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(fieldErrors(result.error))).toEqual(["address", "systemSizeKw"]);
    }
  });

  it("rejects a down payment larger than the system price", () => {
    const result = quoteSchema.safeParse({ ...valid, downPayment: 6001 });
    expect(result.success).toBe(false);
  });
});
