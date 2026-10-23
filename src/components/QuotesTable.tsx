import Link from "next/link";
import type { Quote } from "@/lib/quotes";
import { formatDate, formatEur } from "@/lib/format";

export function QuotesTable({
  quotes,
  showOwner = false,
}: {
  quotes: Quote[];
  showOwner?: boolean;
}) {
  if (quotes.length === 0) return <p>No quotes yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {showOwner && <th scope="col">Customer</th>}
            <th scope="col">System size</th>
            <th scope="col">Price</th>
            <th scope="col">Band</th>
            <th scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.id}>
              <td>{formatDate(quote.createdAt)}</td>
              {showOwner && (
                <td>
                  {quote.inputs.fullName}
                  <br />
                  <span className="hint">{quote.inputs.email}</span>
                </td>
              )}
              <td>{quote.inputs.systemSizeKw} kW</td>
              <td>{formatEur(quote.systemPrice)}</td>
              <td>{quote.riskBand}</td>
              <td>
                <Link href={`/quotes/${quote.id}`}>View quote {quote.id}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
