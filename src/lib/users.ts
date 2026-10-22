import bcrypt from "bcryptjs";
import { getDb } from "./db";

export type Role = "user" | "admin";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
};

type UserRow = { id: number; full_name: string; email: string; role: Role; password_hash: string };

function toUser(row: UserRow): User {
  return { id: row.id, fullName: row.full_name, email: row.email, role: row.role };
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    UserRow | undefined;
  return row ? { ...toUser(row), passwordHash: row.password_hash } : undefined;
}

export function findUserById(id: number): User | undefined {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : undefined;
}

export async function createUser(fullName: string, email: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = getDb()
    .prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)")
    .run(fullName, email, passwordHash);
  return { id: Number(result.lastInsertRowid), fullName, email, role: "user" };
}

// Returns the user if the password matches, undefined otherwise
export async function checkCredentials(email: string, password: string): Promise<User | undefined> {
  const user = findUserByEmail(email);
  if (!user) return undefined;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return undefined;
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}
