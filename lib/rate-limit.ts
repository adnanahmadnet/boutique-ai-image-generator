import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface RateLimitOptions {
  windowSeconds: number;
  maxHits: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// Windowed counter backed by public.rate_limit_hits (see supabase/migrations).
// Fails open (allows the request) if Supabase isn't configured or the
// count/insert query errors — a rate-limiter outage should never take down
// the endpoints it protects.
export async function checkRateLimit(
  bucketKey: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return { allowed: true, remaining: options.maxHits };
  }

  if (!isSupabaseConfigured()) {
    console.warn("[rate-limit] Supabase not configured — rate limiting disabled.");
    return { allowed: true, remaining: options.maxHits };
  }

  try {
    const admin = createAdminClient();
    const windowStart = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

    const { count, error } = await admin
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket_key", bucketKey)
      .gte("created_at", windowStart);

    if (error) {
      console.error("[rate-limit] count query failed", error);
      return { allowed: true, remaining: options.maxHits };
    }

    const hits = count ?? 0;
    if (hits >= options.maxHits) {
      return { allowed: false, remaining: 0 };
    }

    const { error: insertError } = await admin
      .from("rate_limit_hits")
      .insert({ bucket_key: bucketKey });

    if (insertError) {
      console.error("[rate-limit] insert failed", insertError);
    }

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
