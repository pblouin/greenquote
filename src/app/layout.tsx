import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenQuote",
  description: "Solar financing pre-qualification",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/" className="brand">
            GreenQuote
          </Link>
          <nav aria-label="Main">
            {session && <Link href="/quotes/new">New quote</Link>}
            {session && <Link href="/quotes">My quotes</Link>}
            {session?.role === "admin" && <Link href="/admin/quotes">All quotes</Link>}
          </nav>
          {session ? (
            <span>
              {session.email} <LogoutButton />
            </span>
          ) : (
            <span>
              <Link href="/login">Sign in</Link> · <Link href="/register">Register</Link>
            </span>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
