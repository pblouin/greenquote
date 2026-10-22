import { NextResponse } from "next/server";
import { jsonError, withLogging } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";
import { checkCredentials } from "@/lib/users";
import { fieldErrors, loginSchema } from "@/lib/validation";

export const POST = withLogging(async (req) => {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Invalid input", fieldErrors(parsed.error));

  const user = await checkCredentials(parsed.data.email, parsed.data.password);
  if (!user) return jsonError(401, "Wrong email or password");

  const res = NextResponse.json({ user });
  await setSessionCookie(res, user);
  return res;
});
