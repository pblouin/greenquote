import { NextResponse } from "next/server";
import { withLogging } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export const POST = withLogging(async () => {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
});
