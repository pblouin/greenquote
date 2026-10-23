import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <h1>Create an account</h1>
      <AuthForm mode="register" />
      <p>
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
