import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/site-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Proxies signInWithOtp through our own rate-limited route (by IP and by
// email) rather than calling the Supabase SDK directly from the browser,
// per the doc's "rate-limit the login endpoint" requirement.
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Login isn't configured yet." }, { status: 503 });
  }

  let email: string | undefined;
  try {
    const body = await request.json();
    email = body.email?.trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit(`login-ip:${ip}`, { windowSeconds: 600, maxHits: 10 }),
    checkRateLimit(`login-email:${email.toLowerCase()}`, { windowSeconds: 600, maxHits: 5 }),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback` },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
