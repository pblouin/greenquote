import { NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { createUser, findUserByEmail, findUserById, type User } from "@/lib/users";

const BASE = "http://localhost:3000";

export async function makeRequest(
  path: string,
  options: { method?: string; body?: unknown; user?: User } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.user) {
    headers.set("Cookie", `${SESSION_COOKIE}=${await createSessionToken(options.user)}`);
  }
  return new NextRequest(BASE + path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

export function createTestUser(email: string) {
  return createUser("Test " + email, email, "password123");
}

export function getAdmin(): User {
  return findUserById(findUserByEmail("admin@test.com")!.id)!;
}

// Route handlers get their dynamic params as a Promise
export const params = (id: number | string) => ({ params: Promise.resolve({ id: String(id) }) });
