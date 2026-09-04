import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimGuestOrders } from "@/lib/auth-claim";
import { isAdminEmail } from "@/lib/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Login isn't configured yet." }, { status: 503 });
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    email = body.email?.trim();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email) || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Bucket by IP and by email so a single account can't be brute-forced from
  // one IP, and a single IP can't hammer many accounts.
  const ip = getClientIp(request);
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit(`login-ip:${ip}`, { windowSeconds: 600, maxHits: 20 }),
    checkRateLimit(`login-email:${email.toLowerCase()}`, { windowSeconds: 600, maxHits: 8 }),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (data.user) {
    try {
      await claimGuestOrders(data.user.id, email);
    } catch (claimError) {
      console.error("[auth/login] failed to claim guest orders", claimError);
    }
  }

  return NextResponse.json({ ok: true, isAdmin: isAdminEmail(email) });
}
