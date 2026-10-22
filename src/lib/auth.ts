import { SignJWT, jwtVerify } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import type { User } from "./users";

export const SESSION_COOKIE = "gq_session";
const SESSION_DAYS = 7;

export type Session = Pick<User, "id" | "email" | "fullName" | "role">;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 chars");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: Session): Promise<string> {
  return new SignJWT({ email: user.email, fullName: user.fullName, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

// Returns the session if the token is valid and not expired, null otherwise
export async function readSessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: Number(payload.sub),
      email: String(payload.email),
      fullName: String(payload.fullName),
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
  return readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(res: NextResponse, user: Session) {
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
