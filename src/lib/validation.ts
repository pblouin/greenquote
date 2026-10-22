import { z } from "zod";
import { PRICE_PER_KW_EUR } from "./pricing";

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const quoteSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    address: z.string().trim().min(1, "Address is required"),
    monthlyConsumptionKwh: z.coerce.number().positive("Must be greater than 0"),
    systemSizeKw: z.coerce.number().positive("Must be greater than 0").max(100, "Max 100 kW"),
    downPayment: z.coerce.number().min(0, "Cannot be negative").optional(),
  })
  .refine((q) => (q.downPayment ?? 0) <= q.systemSizeKw * PRICE_PER_KW_EUR, {
    message: "Down payment cannot exceed the system price",
    path: ["downPayment"],
  });

export type QuoteInput = z.infer<typeof quoteSchema>;

// Turns a Zod error into { fieldName: "first message" } for the UI
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
