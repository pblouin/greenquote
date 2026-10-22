import { NextResponse } from "next/server";
import { jsonError, withLogging } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { fieldErrors, registerSchema } from "@/lib/validation";

export const POST = withLogging(async (req) => {
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Invalid input", fieldErrors(parsed.error));

  const { fullName, email, password } = parsed.data;
  if (findUserByEmail(email)) {
    return jsonError(409, "Email already registered", { email: "Email already registered" });
  }

  const user = await createUser(fullName, email, password);
  const res = NextResponse.json({ user }, { status: 201 });
  await setSessionCookie(res, user);
  return res;
});
