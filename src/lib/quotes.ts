import { getDb } from "./db";
import { priceQuote, type Offer, type RiskBand } from "./pricing";
import type { QuoteInput } from "./validation";

export type Quote = {
  id: number;
  userId: number;
  createdAt: string;
  inputs: {
    fullName: string;
    email: string;
    address: string;
    monthlyConsumptionKwh: number;
    systemSizeKw: number;
    downPayment: number;
  };
  systemPrice: number;
  principal: number;
  riskBand: RiskBand;
  offers: Offer[];
};

type QuoteRow = {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  address: string;
  monthly_consumption_kwh: number;
  system_size_kw: number;
  down_payment: number;
  system_price: number;
  principal: number;
  risk_band: RiskBand;
  offers_json: string;
  created_at: string;
};

function toQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    inputs: {
      fullName: row.full_name,
      email: row.email,
      address: row.address,
      monthlyConsumptionKwh: row.monthly_consumption_kwh,
      systemSizeKw: row.system_size_kw,
      downPayment: row.down_payment,
    },
    systemPrice: row.system_price,
    principal: row.principal,
    riskBand: row.risk_band,
    offers: JSON.parse(row.offers_json),
  };
}

export function createQuote(userId: number, input: QuoteInput): Quote {
  const pricing = priceQuote(input);
  const result = getDb()
    .prepare(
      `INSERT INTO quotes (user_id, full_name, email, address, monthly_consumption_kwh,
        system_size_kw, down_payment, system_price, principal, risk_band, offers_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      userId,
      input.fullName,
      input.email,
      input.address,
      input.monthlyConsumptionKwh,
      input.systemSizeKw,
      input.downPayment ?? 0,
      pricing.systemPrice,
      pricing.principal,
      pricing.riskBand,
      JSON.stringify(pricing.offers),
    );
  return getQuoteById(Number(result.lastInsertRowid))!;
}

export function getQuoteById(id: number): Quote | undefined {
  const row = getDb().prepare("SELECT * FROM quotes WHERE id = ?").get(id) as QuoteRow | undefined;
  return row ? toQuote(row) : undefined;
}

export function listQuotesForUser(userId: number): Quote[] {
  const rows = getDb()
    .prepare("SELECT * FROM quotes WHERE user_id = ? ORDER BY id DESC")
    .all(userId) as QuoteRow[];
  return rows.map(toQuote);
}

// Admin: all quotes, optionally filtered by the quote owner's name or email
export function listAllQuotes(search?: string): Quote[] {
  const like = `%${(search ?? "").trim().toLowerCase()}%`;
  const rows = getDb()
    .prepare(
      `SELECT q.* FROM quotes q JOIN users u ON u.id = q.user_id
       WHERE lower(u.full_name) LIKE ? OR lower(u.email) LIKE ?
       ORDER BY q.id DESC`,
    )
    .all(like, like) as QuoteRow[];
  return rows.map(toQuote);
}

export function canView(user: { id: number; role: string }, quote: Quote): boolean {
  return user.role === "admin" || quote.userId === user.id;
}
