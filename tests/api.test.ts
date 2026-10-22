import { beforeAll, describe, expect, it, vi } from "vitest";
import { GET as health } from "@/app/api/health/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { GET as listMine, POST as createQuote } from "@/app/api/quotes/route";
import { GET as getQuote } from "@/app/api/quotes/[id]/route";
import { GET as listAll } from "@/app/api/admin/quotes/route";
import type { User } from "@/lib/users";
import { createTestUser, getAdmin, makeRequest, params } from "./helpers";

// Keep the test output readable, the JSON logs are not needed here
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

const quoteInput = {
  fullName: "Alice",
  email: "alice@test.com",
  address: "Torstrasse 1, Berlin",
  monthlyConsumptionKwh: 450,
  systemSizeKw: 6,
  downPayment: 1200,
};

let alice: User;
let bob: User;

beforeAll(async () => {
  alice = await createTestUser("alice@test.com");
  bob = await createTestUser("bob@test.com");
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await health(await makeRequest("/api/health"), undefined);
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("ok");
  });
});

describe("auth", () => {
  it("registers a user and sets a session cookie", async () => {
    const res = await register(
      await makeRequest("/api/auth/register", {
        method: "POST",
        body: { fullName: "Carol", email: "carol@test.com", password: "password123" },
      }),
      undefined,
    );
    expect(res.status).toBe(201);
    expect(res.headers.get("set-cookie")).toContain("gq_session=");
  });

  it("refuses a duplicate email", async () => {
    const res = await register(
      await makeRequest("/api/auth/register", {
        method: "POST",
        body: { fullName: "Alice", email: "alice@test.com", password: "password123" },
      }),
      undefined,
    );
    expect(res.status).toBe(409);
  });

  it("logs in with the right password only", async () => {
    const ok = await login(
      await makeRequest("/api/auth/login", {
        method: "POST",
        body: { email: "alice@test.com", password: "password123" },
      }),
      undefined,
    );
    const wrong = await login(
      await makeRequest("/api/auth/login", {
        method: "POST",
        body: { email: "alice@test.com", password: "nope-nope" },
      }),
      undefined,
    );
    expect(ok.status).toBe(200);
    expect(wrong.status).toBe(401);
  });

  it("logs in the seeded admin", async () => {
    const res = await login(
      await makeRequest("/api/auth/login", {
        method: "POST",
        body: { email: "admin@test.com", password: "admin1234" },
      }),
      undefined,
    );
    expect((await res.json()).user.role).toBe("admin");
  });
});

describe("POST /api/quotes", () => {
  it("requires a session", async () => {
    const res = await createQuote(
      await makeRequest("/api/quotes", { method: "POST", body: quoteInput }),
      undefined,
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 with field errors on bad input", async () => {
    const res = await createQuote(
      await makeRequest("/api/quotes", {
        method: "POST",
        body: { ...quoteInput, systemSizeKw: -1 },
        user: alice,
      }),
      undefined,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).fields.systemSizeKw).toBeDefined();
  });

  it("prices, saves and returns the quote", async () => {
    const res = await createQuote(
      await makeRequest("/api/quotes", { method: "POST", body: quoteInput, user: alice }),
      undefined,
    );
    expect(res.status).toBe(201);
    const quote = await res.json();
    expect(quote.systemPrice).toBe(7200);
    expect(quote.principal).toBe(6000);
    expect(quote.riskBand).toBe("A");
    expect(quote.offers).toHaveLength(3);
    expect(quote.inputs.address).toBe(quoteInput.address);
  });
});

describe("reading quotes", () => {
  let aliceQuoteId: number;

  beforeAll(async () => {
    const res = await createQuote(
      await makeRequest("/api/quotes", { method: "POST", body: quoteInput, user: alice }),
      undefined,
    );
    aliceQuoteId = (await res.json()).id;
  });

  it("lets the owner read their quote", async () => {
    const res = await getQuote(await makeRequest("/", { user: alice }), params(aliceQuoteId));
    expect(res.status).toBe(200);
  });

  it("hides the quote from another user", async () => {
    const res = await getQuote(await makeRequest("/", { user: bob }), params(aliceQuoteId));
    expect(res.status).toBe(404);
  });

  it("lets an admin read any quote", async () => {
    const res = await getQuote(await makeRequest("/", { user: getAdmin() }), params(aliceQuoteId));
    expect(res.status).toBe(200);
  });

  it("lists only the current user's quotes", async () => {
    const res = await listMine(await makeRequest("/api/quotes", { user: bob }), undefined);
    expect((await res.json()).quotes).toEqual([]);
  });

  it("blocks the admin list for normal users", async () => {
    const res = await listAll(await makeRequest("/api/admin/quotes", { user: alice }), undefined);
    expect(res.status).toBe(403);
  });

  it("lets the admin filter all quotes by user", async () => {
    const admin = getAdmin();
    const all = await listAll(await makeRequest("/api/admin/quotes", { user: admin }), undefined);
    const bobs = await listAll(
      await makeRequest("/api/admin/quotes?search=bob", { user: admin }),
      undefined,
    );
    expect((await all.json()).quotes.length).toBeGreaterThan(0);
    expect((await bobs.json()).quotes).toEqual([]);
  });
});
