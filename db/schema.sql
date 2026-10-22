-- Schema for GreenQuote. Safe to run on every start.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotes (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id                 INTEGER NOT NULL REFERENCES users(id),
  full_name               TEXT    NOT NULL,
  email                   TEXT    NOT NULL,
  address                 TEXT    NOT NULL,
  monthly_consumption_kwh REAL    NOT NULL,
  system_size_kw          REAL    NOT NULL,
  down_payment            REAL    NOT NULL DEFAULT 0,
  system_price            REAL    NOT NULL,
  principal               REAL    NOT NULL,
  risk_band               TEXT    NOT NULL CHECK (risk_band IN ('A', 'B', 'C')),
  offers_json             TEXT    NOT NULL,
  created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
