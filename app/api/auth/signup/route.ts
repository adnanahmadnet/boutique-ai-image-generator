import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, isUniqueViolation, query, queryOne } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { claimGuestOrders } from "@/lib/auth-claim";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Lenient on purpose — accepts spaces, dashes, parens, and a leading + for
// international numbers. This just needs to catch obvious junk, not enforce
// a strict format the support team can't dial anyway.
const PHONE_RE = /^[+\d][\d\s\-()]{6,19}$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Sign up isn't configured yet." }, { status: 503 });
  }

  let name: string | undefined;
  let email: string | undefined;
  let password: string | undefined;
  let phone: string | undefined;
  let boutiqueName: string | undefined;
  try {
    const body = await request.json();
    name = body.name?.trim();
    email = body.email?.trim().toLowerCase();
    password = body.password;
    phone = body.phone?.trim();
    boutiqueName = body.boutiqueName?.trim();
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
  // Required so the support team always has a way to reach a buyer that
  // doesn't depend on them checking email.
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`signup:${ip}`, { windowSeconds: 600, maxHits: 10 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  // The shared login form checks public.admins first, so a buyer row sharing
  // the admin's email could never be signed into. Reject it here rather than
  // creating an account that silently doesn't work. Deliberately worded the
  // same as a duplicate buyer email so this can't be used to probe for the
  // admin address.
  const adminEmail = await queryOne<{ id: string }>(
    `select id from public.admins where email = $1`,
    [email]
  );

  if (adminEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  // Same reasoning as the admin check above — a support account is also
  // created out-of-band (by an admin, from /admin/support-team), so public
  // signup must not let a buyer row collide with one.
  const supportEmail = await queryOne<{ id: string }>(
    `select id from public.support_agents where email = $1`,
    [email]
  );

  if (supportEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  // Public signup only ever creates a buyer account. Admin is a fully
  // separate identity (public.admins) that this endpoint can't reach — see
  // db/migrations/0003_separate_admin_table.sql.
  let userId: string;
  try {
    const row = await queryOne<{ id: string }>(
      `insert into public.users (email, password_hash, full_name)
       values ($1, $2, $3)
       returning id`,
      [email, passwordHash, name]
    );
    userId = row!.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }
    console.error("[auth/signup]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Contact details live in public.profiles, separate from the auth-only
  // public.users row (see db/migrations/0001_init.sql) — surfaced to the
  // admin and support dashboards so support can actually reach a buyer.
  try {
    await query(
      `insert into public.profiles (id, boutique_name, phone) values ($1, $2, $3)`,
      [userId, boutiqueName || null, phone]
    );
  } catch (profileError) {
    console.error("[auth/signup] failed to create profile", profileError);
  }

  await createSession(userId);

  try {
    await claimGuestOrders(userId, email);
  } catch (claimError) {
    console.error("[auth/signup] failed to claim guest orders", claimError);
  }

  return NextResponse.json({
    ok: true,
    // Always confirmed — no transactional email provider is wired up for a
    // confirmation-link flow, so accounts are usable immediately.
    needsConfirmation: false,
  });
}
