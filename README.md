# GreenQuote

Solar financing pre-qualification. A signed-in user enters their consumption and system size and gets
a system price, a risk band and three installment offers. Admins can see and filter every quote.

## Prerequisites

- Node.js 24 or newer (the app uses the SQLite module built into Node, so there is no database server)
- npm
- Docker (optional)

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000. On first start the database file is created in `data/` and an admin is seeded
from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@test.com` / `admin1234`).

With Docker:

```bash
cp .env.example .env
docker compose up --build
```

## Test and quality checks

```bash
npm test            # unit + integration tests (Vitest)
npm run lint        # ESLint (Next.js rules)
npm run typecheck   # TypeScript
npm run format      # Prettier
```

- Unit tests: `tests/pricing.test.ts` (risk band, amortization, pricing), `tests/validation.test.ts`.
- Integration tests: `tests/api.test.ts` calls the real route handlers against an in-memory SQLite
  database: auth, validation, pricing, ownership and admin rules.

## Project layout

```
db/schema.sql            tables users and quotes (run on start, idempotent)
src/lib/pricing.ts       pricing model, pure functions
src/lib/validation.ts    Zod schemas shared by the browser and the API
src/lib/db.ts            SQLite connection, schema, admin seed
src/lib/users.ts         user queries + password hashing
src/lib/quotes.ts        quote queries + ownership rule
src/lib/auth.ts          JWT session cookie
src/lib/session.ts       session helpers for server pages
src/lib/api.ts           request logging wrapper + error helper
src/app/api/...          REST endpoints (see API.md)
src/app/...              pages: /login, /register, /quotes, /quotes/new, /quotes/[id], /admin/quotes
src/components/          form, result and table components
```

## Design decisions and trade-offs

- **One Next.js app** for UI and API. One process to run and deploy, one language, types shared between
  front and back (the same Zod schema validates the form and the request).
- **SQLite via `node:sqlite`**: no extra service and no native dependency. Fine for one instance; for
  several instances I would move to Postgres (Cloud SQL) behind the same query functions.
- **Plain SQL, no ORM**: the schema is two tables, an ORM would add more concepts than it saves.
  The trade-off is no migration history; `schema.sql` uses `CREATE TABLE IF NOT EXISTS`.
- **Auth**: email/password, bcrypt hashes, a signed JWT (HS256, 7 days) in an httpOnly, SameSite=Lax cookie.
  Stateless, so logout only clears the cookie and a token cannot be revoked before it expires.
- **Authorization on the server**: every endpoint and protected page checks the session. Quote ownership is
  checked in `canView`; another user's quote returns 404 so ids are not leaked. Admin routes return 403.
- **Offers are stored as JSON** in the quote row, so a quote keeps the price it was given even if the pricing
  model changes later.
- **Money** is in EUR, rounded to cents. A real system would store integer cents.
- **Logging**: every API request logs one JSON line (method, path, status, duration), errors are logged and
  returned as a generic 500.

## What I would do next

1. Postgres + a migration tool, integer cents for money.
2. CI pipeline (GitHub Actions or Cloud Build): install, lint, typecheck, test, build the image, push to
   Artifact Registry, deploy to Cloud Run. Cloud Run because it is a stateless container that scales to zero,
   with Cloud SQL for the database and Secret Manager for `SESSION_SECRET`.
3. E2E test with Playwright: register, request a quote, see the results.
4. Rate limiting on login, CSRF token for the cookie-based POSTs, session revocation.
5. Amortization schedule and PDF export, OpenAPI docs.
6. Request ids in logs and error tracking (Sentry or Cloud Error Reporting).
