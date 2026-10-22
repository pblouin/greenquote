import { describe, expect, it } from "vitest";
import { monthlyPayment, priceQuote, riskBand } from "@/lib/pricing";

describe("riskBand", () => {
  it("gives A for high consumption and a small system", () => {
    expect(riskBand(400, 6)).toBe("A");
  });

  it("gives B when consumption is high but the system is larger than 6 kW", () => {
    expect(riskBand(500, 6.5)).toBe("B");
  });

  it("gives B from 250 kWh", () => {
    expect(riskBand(250, 4)).toBe("B");
  });

  it("gives C below 250 kWh", () => {
    expect(riskBand(249, 4)).toBe("C");
  });
});

describe("monthlyPayment", () => {
  it("matches the standard amortization formula", () => {
    expect(monthlyPayment(7200, 0.069, 5)).toBe(142.23);
    expect(monthlyPayment(10000, 0.089, 10)).toBe(126.14);
  });

  it("is 0 when nothing is financed", () => {
    expect(monthlyPayment(0, 0.069, 5)).toBe(0);
  });

  it("splits evenly when the rate is 0", () => {
    expect(monthlyPayment(1200, 0, 5)).toBe(20);
  });
});

describe("priceQuote", () => {
  it("computes price, principal, band and three offers", () => {
    const result = priceQuote({ monthlyConsumptionKwh: 450, systemSizeKw: 6, downPayment: 1000 });

    expect(result.systemPrice).toBe(7200);
    expect(result.principal).toBe(6200);
    expect(result.riskBand).toBe("A");
    expect(result.offers.map((o) => o.termYears)).toEqual([5, 10, 15]);
    expect(result.offers.every((o) => o.apr === 0.069 && o.principalUsed === 6200)).toBe(true);
  });

  it("treats a missing down payment as 0", () => {
    expect(priceQuote({ monthlyConsumptionKwh: 100, systemSizeKw: 5 }).principal).toBe(6000);
  });
});
