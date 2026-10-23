"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "./Field";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";

// One form for both sign in and register; register adds the full name field
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const values = Object.fromEntries(new FormData(event.currentTarget));
    const schema = mode === "login" ? loginSchema : registerSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});

    setSubmitting(true);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json();
      setErrors(body.fields ?? {});
      setFormError(body.error ?? "Something went wrong");
      return;
    }
    router.push("/quotes/new");
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {mode === "register" && (
        <Field name="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
      )}
      <Field name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        hint={mode === "register" ? "At least 8 characters" : undefined}
        error={errors.password}
      />
      {formError && (
        <p className="error" role="alert">
          {formError}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
