import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <h1>Sign in</h1>
      <AuthForm mode="login" />
      <p>
        No account yet? <Link href="/register">Register</Link>
      </p>
    </>
  );
}
