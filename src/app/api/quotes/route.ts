import { NextResponse } from "next/server";
import { jsonError, withLogging } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { createQuote, listQuotesForUser } from "@/lib/quotes";
import { fieldErrors, quoteSchema } from "@/lib/validation";

export const POST = withLogging(async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError(401, "Not signed in");

  const parsed = quoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Invalid input", fieldErrors(parsed.error));

  const quote = createQuote(session.id, parsed.data);
  return NextResponse.json(quote, { status: 201 });
});

export const GET = withLogging(async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError(401, "Not signed in");
  return NextResponse.json({ quotes: listQuotesForUser(session.id) });
});
