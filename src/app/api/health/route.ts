import { NextResponse } from "next/server";
import { withLogging } from "@/lib/api";
import { getDb } from "@/lib/db";

export const GET = withLogging(async () => {
  getDb().prepare("SELECT 1").get();
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
});
