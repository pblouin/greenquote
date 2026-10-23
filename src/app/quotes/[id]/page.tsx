import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteResult } from "@/components/QuoteResult";
import { canView, getQuoteById } from "@/lib/quotes";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ id: string }> };

export default async function QuotePage({ params }: Props) {
  const session = await requireSession();
  const quote = getQuoteById(Number((await params).id));
  if (!quote || !canView(session, quote)) notFound();

  return (
    <>
      <p>
        <Link href="/quotes">Back to my quotes</Link>
      </p>
      <h1>Quote #{quote.id}</h1>
      <QuoteResult quote={quote} />
    </>
  );
}
