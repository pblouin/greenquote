import Link from "next/link";
import { QuotesTable } from "@/components/QuotesTable";
import { listQuotesForUser } from "@/lib/quotes";
import { requireSession } from "@/lib/session";

export default async function MyQuotesPage() {
  const session = await requireSession();
  const quotes = listQuotesForUser(session.id);

  return (
    <>
      <h1>My quotes</h1>
      <p>
        <Link href="/quotes/new">Request a new quote</Link>
      </p>
      <QuotesTable quotes={quotes} />
    </>
  );
}
