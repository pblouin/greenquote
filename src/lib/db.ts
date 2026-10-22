import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

let db: DatabaseSync | undefined;

// Opens the database once, creates the tables and the admin user if needed
export function getDb(): DatabaseSync {
  if (db) return db;

  const dbPath = process.env.DATABASE_PATH ?? "./data/greenquote.db";
  if (dbPath !== ":memory:") fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
  seedAdmin(db);
  return db;
}

function seedAdmin(database: DatabaseSync) {
  const email = (process.env.ADMIN_EMAIL ?? "admin@test.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin1234";

  const existing = database.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return;

  database
    .prepare("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run("Admin", email, bcrypt.hashSync(password, 10));
  logger.info("seeded admin user", { email });
}
