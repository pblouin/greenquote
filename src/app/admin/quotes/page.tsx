import { notFound } from "next/navigation";
import { QuotesTable } from "@/components/QuotesTable";
import { listAllQuotes } from "@/lib/quotes";
import { requireSession } from "@/lib/session";

type Props = { searchParams: Promise<{ search?: string }> };

export default async function AdminQuotesPage({ searchParams }: Props) {
  const session = await requireSession();
  if (session.role !== "admin") notFound();

  const { search = "" } = await searchParams;
  const quotes = listAllQuotes(search);

  return (
    <>
      <h1>All quotes</h1>
      {/* A plain GET form: submitting it reloads the page with ?search=... */}
      <form role="search" className="field" style={{ maxWidth: 460, marginBottom: "1rem" }}>
        <label htmlFor="search">Filter by customer name or email</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input id="search" name="search" defaultValue={search} style={{ flex: 1 }} />
          <button type="submit">Filter</button>
        </div>
      </form>
      <QuotesTable quotes={quotes} showOwner />
    </>
  );
}
