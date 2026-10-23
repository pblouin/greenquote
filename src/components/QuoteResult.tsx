import type { Quote } from "@/lib/quotes";
import { formatEur, formatPercent } from "@/lib/format";

export function QuoteResult({ quote }: { quote: Quote }) {
  return (
    <section aria-labelledby="result-title">
      <h2 id="result-title">Your pre-qualification</h2>
      <dl className="summary">
        <div>
          <dt>System price</dt>
          <dd>{formatEur(quote.systemPrice)}</dd>
        </div>
        <div>
          <dt>Amount financed</dt>
          <dd>{formatEur(quote.principal)}</dd>
        </div>
        <div>
          <dt>Risk band</dt>
          <dd>{quote.riskBand}</dd>
        </div>
      </dl>

      <h3>Installment offers</h3>
      <ul className="offers" role="list">
        {quote.offers.map((offer) => (
          <li key={offer.termYears} className="offer">
            <div>{offer.termYears} years</div>
            <div className="amount">{formatEur(offer.monthlyPayment)} / month</div>
            <div className="hint">APR {formatPercent(offer.apr)}</div>
          </li>
        ))}
      </ul>

      <h3>Request details</h3>
      <dl className="details">
        <dt>Name</dt>
        <dd>{quote.inputs.fullName}</dd>
        <dt>Email</dt>
        <dd>{quote.inputs.email}</dd>
        <dt>Address</dt>
        <dd>{quote.inputs.address}</dd>
        <dt>Monthly consumption</dt>
        <dd>{quote.inputs.monthlyConsumptionKwh} kWh</dd>
        <dt>System size</dt>
        <dd>{quote.inputs.systemSizeKw} kW</dd>
        <dt>Down payment</dt>
        <dd>{formatEur(quote.inputs.downPayment)}</dd>
      </dl>
    </section>
  );
}
