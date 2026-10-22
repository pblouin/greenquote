import { NextResponse } from "next/server";
import { jsonError, withLogging } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { canView, getQuoteById } from "@/lib/quotes";

type Context = { params: Promise<{ id: string }> };

export const GET = withLogging<Context>(async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError(401, "Not signed in");

  const quote = getQuoteById(Number((await params).id));
  // Same 404 for "missing" and "not yours", so ids of other users' quotes are not revealed
  if (!quote || !canView(session, quote)) return jsonError(404, "Quote not found");

  return NextResponse.json(quote);
});
