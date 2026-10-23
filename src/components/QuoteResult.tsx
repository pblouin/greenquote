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

      <h3>Your inputs</h3>
      <p>
        {quote.inputs.fullName} ({quote.inputs.email}), {quote.inputs.address}
        <br />
        {quote.inputs.monthlyConsumptionKwh} kWh per month, {quote.inputs.systemSizeKw} kW system,
        down payment {formatEur(quote.inputs.downPayment)}
      </p>
    </section>
  );
}
