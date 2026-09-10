import type { NextRequest } from "next/server";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";

export interface RateLimitOptions {
  windowSeconds: number;
  maxHits: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// Windowed counter backed by public.rate_limit_hits (see db/migrations).
// Fails open (allows the request) if the database isn't configured or the
// count/insert query errors — a rate-limiter outage should never take down
// the endpoints it protects.
export async function checkRateLimit(
  bucketKey: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return { allowed: true, remaining: options.maxHits };
  }

  if (!isDatabaseConfigured()) {
    console.warn("[rate-limit] Database not configured — rate limiting disabled.");
    return { allowed: true, remaining: options.maxHits };
  }

  try {
    const windowStart = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

    const row = await queryOne<{ count: string }>(
      `select count(*) as count from public.rate_limit_hits where bucket_key = $1 and created_at >= $2`,
      [bucketKey, windowStart]
    );

    const hits = Number(row?.count ?? 0);
    if (hits >= options.maxHits) {
      return { allowed: false, remaining: 0 };
    }

    await query(`insert into public.rate_limit_hits (bucket_key) values ($1)`, [bucketKey]);

    return { allowed: true, remaining: options.maxHits - hits - 1 };
  } catch (error) {
    console.error("[rate-limit] unexpected error", error);
    return { allowed: true, remaining: options.maxHits };
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
