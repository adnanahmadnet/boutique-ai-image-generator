import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimGuestOrders } from "@/lib/auth-claim";
import { isAdminEmail } from "@/lib/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Sign up isn't configured yet." }, { status: 503 });
  }

  let name: string | undefined;
  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    name = body.name?.trim();
    email = body.email?.trim();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`signup:${ip}`, { windowSeconds: 600, maxHits: 10 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    // GoTrue returns "User already registered" (no dedicated error code) once
    // an email is taken and confirmations are disabled — normalize to a
    // clearer, consistent message rather than passing its wording through.
    const isDuplicate = /already registered|already exists/i.test(error.message);
    return NextResponse.json(
      { error: isDuplicate ? "An account with this email already exists." : error.message },
      { status: 400 }
    );
  }

  if (data.user && data.session) {
    // A session came back immediately (email confirmation disabled) — claim
    // any guest-checkout orders placed with this email before signup.
    try {
      await claimGuestOrders(data.user.id, email);
    } catch (claimError) {
      console.error("[auth/signup] failed to claim guest orders", claimError);
    }
  }

  return NextResponse.json({
    ok: true,
    // If email confirmation is still enabled on the Supabase project, there's
    // no session yet — the client should tell the user to check their email.
    needsConfirmation: !data.session,
    isAdmin: isAdminEmail(email),
  });
}
