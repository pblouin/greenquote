import { NextResponse, type NextRequest } from "next/server";
import { logger } from "./logger";

type Handler<C> = (req: NextRequest, context: C) => Promise<NextResponse>;

// Wraps a route handler: logs every request with status and duration, turns crashes into a 500
export function withLogging<C>(handler: Handler<C>): Handler<C> {
  return async (req, context) => {
    const start = Date.now();
    const route = { method: req.method, path: req.nextUrl.pathname };
    try {
      const res = await handler(req, context);
      logger.info("request", { ...route, status: res.status, durationMs: Date.now() - start });
      return res;
    } catch (error) {
      logger.error("request failed", {
        ...route,
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export function jsonError(status: number, error: string, fields?: Record<string, string>) {
  return NextResponse.json(fields ? { error, fields } : { error }, { status });
}
