import { NextResponse } from "next/server";
import { jsonError, withLogging } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { listAllQuotes } from "@/lib/quotes";

export const GET = withLogging(async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError(401, "Not signed in");
  if (session.role !== "admin") return jsonError(403, "Admins only");

  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  return NextResponse.json({ quotes: listAllQuotes(search) });
});
