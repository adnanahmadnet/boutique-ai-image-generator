import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, isUniqueViolation, query, queryOne } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/get-current-admin";
import { hashPassword } from "@/lib/auth/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Creates a support-team account. Unlike buyer signup, this is admin-only —
// support agents have no public self-signup path, mirroring how
// db/seed-admin.mjs is the only way to create the admin row.
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 403 });
  }

  let name: string | undefined;
  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    name = body.name?.trim();
    email = body.email?.trim().toLowerCase();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
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

  // Same email-collision guard as public signup, checked in the other
  // direction: a support account can't be created over an existing admin
  // or buyer email either, so login always resolves to exactly one identity.
  const existingAdmin = await queryOne<{ id: string }>(
    `select id from public.admins where email = $1`,
    [email]
  );
  if (existingAdmin) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  const existingUser = await queryOne<{ id: string }>(
    `select id from public.users where email = $1`,
    [email]
  );
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    await query(
      `insert into public.support_agents (email, password_hash, full_name)
       values ($1, $2, $3)`,
      [email, passwordHash, name]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }
    console.error("[admin/support-agents]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
