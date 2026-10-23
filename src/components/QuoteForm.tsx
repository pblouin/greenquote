"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "./Field";
import { fieldErrors, quoteSchema } from "@/lib/validation";

type Props = { defaultFullName: string; defaultEmail: string };

export function QuoteForm({ defaultFullName, defaultEmail }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const values = Object.fromEntries(new FormData(event.currentTarget));
    // An empty optional field means "no down payment", not 0 typed by the user
    if (values.downPayment === "") delete values.downPayment;

    const parsed = quoteSchema.safeParse(values);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});

    setSubmitting(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const body = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setErrors(body.fields ?? {});
      setFormError(body.error ?? "Something went wrong");
      return;
    }
    router.push(`/quotes/${body.id}`);
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      <Field
        name="fullName"
        label="Full name"
        defaultValue={defaultFullName}
        error={errors.fullName}
      />
      <Field
        name="email"
        label="Email"
        type="email"
        defaultValue={defaultEmail}
        error={errors.email}
      />
      <Field name="address" label="Address" autoComplete="street-address" error={errors.address} />
      <Field
        name="monthlyConsumptionKwh"
        label="Monthly consumption (kWh)"
        type="number"
        step="any"
        error={errors.monthlyConsumptionKwh}
      />
      <Field
        name="systemSizeKw"
        label="System size (kW)"
        type="number"
        step="any"
        error={errors.systemSizeKw}
      />
      <Field
        name="downPayment"
        label="Down payment (EUR, optional)"
        type="number"
        step="any"
        error={errors.downPayment}
      />
      {formError && (
        <p className="error" role="alert">
          {formError}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? "Calculating..." : "Get pre-qualification"}
      </button>
    </form>
  );
}
