# API reference

All bodies are JSON. Authenticated endpoints read the `gq_session` cookie (httpOnly, set by register/login).
Errors look like `{ "error": "message", "fields": { "fieldName": "message" } }` (`fields` only on validation errors).

## Health

`GET /api/health` → `200 { "status": "ok", "time": "..." }`

## Auth

| Method | Path                 | Body                            | Success                       | Errors                          |
| ------ | -------------------- | ------------------------------- | ----------------------------- | ------------------------------- |
| POST   | `/api/auth/register` | `{ fullName, email, password }` | `201 { user }` + cookie       | `400` invalid, `409` email used |
| POST   | `/api/auth/login`    | `{ email, password }`           | `200 { user }` + cookie       | `400` invalid, `401` wrong      |
| POST   | `/api/auth/logout`   |                                 | `200 { ok: true }`, clears it |                                 |

## Quotes

### `POST /api/quotes` (signed in)

Body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@test.com",
  "address": "Torstrasse 1, Berlin",
  "monthlyConsumptionKwh": 450,
  "systemSizeKw": 6,
  "downPayment": 1200
}
```

`downPayment` is optional and cannot exceed the system price. Response `201`:

```json
{
  "id": 1,
  "userId": 2,
  "createdAt": "2026-10-09 08:08:54",
  "inputs": {
    "fullName": "Jane Doe",
    "email": "jane@test.com",
    "address": "Torstrasse 1, Berlin",
    "monthlyConsumptionKwh": 450,
    "systemSizeKw": 6,
    "downPayment": 1200
  },
  "systemPrice": 7200,
  "principal": 6000,
  "riskBand": "A",
  "offers": [
    { "termYears": 5, "apr": 0.069, "principalUsed": 6000, "monthlyPayment": 118.52 },
    { "termYears": 10, "apr": 0.069, "principalUsed": 6000, "monthlyPayment": 69.36 },
    { "termYears": 15, "apr": 0.069, "principalUsed": 6000, "monthlyPayment": 53.59 }
  ]
}
```

Errors: `400` invalid input, `401` not signed in.

### `GET /api/quotes` (signed in)

`200 { "quotes": [Quote] }`: only the caller's quotes, newest first.

### `GET /api/quotes/:id` (signed in)

`200 Quote`. Returns `404` if the quote does not exist or belongs to someone else (admins can read all).

### `GET /api/admin/quotes?search=` (admin)

`200 { "quotes": [Quote] }`: all quotes, filtered by owner name or email when `search` is set.
`401` not signed in, `403` not an admin.
