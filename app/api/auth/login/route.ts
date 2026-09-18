import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAdminSession } from "@/lib/auth/admin-session";
import { createSupportSession } from "@/lib/auth/support-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { claimGuestOrders } from "@/lib/auth-claim";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Login isn't configured yet." }, { status: 503 });
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    email = body.email?.trim().toLowerCase();
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
    checkRateLimit(`login-email:${email}`, { windowSeconds: 600, maxHits: 8 }),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  // One form, two identities. The admin table is checked first, and a match
  // issues an admin session (a different table and a different cookie from a
  // buyer session — see lib/auth/admin-session.ts). This is only a shared
  // *entry point*: signup still cannot create an admin, and an admin row can
  // only be created out-of-band by db/seed-admin.mjs.
  const admin = await queryOne<{ id: string; password_hash: string }>(
    `select id, password_hash from public.admins where email = $1`,
    [email]
  );

  if (admin) {
    if (!(await verifyPassword(password, admin.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createAdminSession(admin.id);
    await query(`update public.admins set last_sign_in_at = now() where id = $1`, [admin.id]);

    return NextResponse.json({ ok: true, isAdmin: true });
  }

  // Same shared entry point covers support agents, checked next — their own
  // table and session type (see lib/auth/support-session.ts), created only
  // by an admin from /admin/support-team, never by public signup.
  const agent = await queryOne<{ id: string; password_hash: string }>(
    `select id, password_hash from public.support_agents where email = $1 and is_active = true`,
    [email]
  );

  if (agent) {
    if (!(await verifyPassword(password, agent.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSupportSession(agent.id);
    await query(`update public.support_agents set last_sign_in_at = now() where id = $1`, [
      agent.id,
    ]);

    return NextResponse.json({ ok: true, isAdmin: false, isSupport: true });
  }

  const user = await queryOne<{ id: string; password_hash: string }>(
    `select id, password_hash from public.users where email = $1`,
    [email]
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await createSession(user.id);
  await query(`update public.users set last_sign_in_at = now() where id = $1`, [user.id]);

  try {
    await claimGuestOrders(user.id, email);
  } catch (claimError) {
    console.error("[auth/login] failed to claim guest orders", claimError);
  }

  return NextResponse.json({ ok: true, isAdmin: false, isSupport: false });
}
