export const PRICE_PER_KW_EUR = 1200;
export const TERMS_YEARS = [5, 10, 15] as const;

export type RiskBand = "A" | "B" | "C";

export const APR_BY_BAND: Record<RiskBand, number> = { A: 0.069, B: 0.089, C: 0.119 };

export type Offer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

export type PricingResult = {
  systemPrice: number;
  principal: number;
  riskBand: RiskBand;
  offers: Offer[];
};

export function riskBand(monthlyConsumptionKwh: number, systemSizeKw: number): RiskBand {
  if (monthlyConsumptionKwh >= 400 && systemSizeKw <= 6) return "A";
  if (monthlyConsumptionKwh >= 250) return "B";
  return "C";
}

// Standard amortization: P * r / (1 - (1 + r)^-n), with r the monthly rate and n the months
export function monthlyPayment(principal: number, apr: number, termYears: number): number {
  const r = apr / 12;
  const n = termYears * 12;
  if (principal <= 0) return 0;
  if (r === 0) return roundCents(principal / n);
  return roundCents((principal * r) / (1 - Math.pow(1 + r, -n)));
}

export function priceQuote(input: {
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
}): PricingResult {
  const systemPrice = roundCents(input.systemSizeKw * PRICE_PER_KW_EUR);
  const principal = roundCents(systemPrice - (input.downPayment ?? 0));
  const band = riskBand(input.monthlyConsumptionKwh, input.systemSizeKw);
  const apr = APR_BY_BAND[band];

  const offers = TERMS_YEARS.map((termYears) => ({
    termYears,
    apr,
    principalUsed: principal,
    monthlyPayment: monthlyPayment(principal, apr, termYears),
  }));

  return { systemPrice, principal, riskBand: band, offers };
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}
