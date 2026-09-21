// Creates or rotates the single admin record in public.admins.
//
// Run with env vars set inline (works in POSIX shells and PowerShell's `&`
// call form differs — simplest is to export them first, or prefix on POSIX):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... node db/seed-admin.mjs
//
// Falls back to reading DATABASE_URL from .env.local if it isn't already in
// the environment (this script runs outside Next.js, which is the only
// thing that loads .env.local automatically).
//
// Safe to re-run: with no admin yet, it creates one. With an admin already
// present, it updates that same row (email/password/name) instead of
// inserting a second one — public.admins.admins_singleton_idx would reject
// a second row anyway, but failing loudly here is more useful than a raw
// constraint-violation stack trace.

import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

// Matches lib/auth/password.ts's SALT_ROUNDS — keep these in sync.
const SALT_ROUNDS = 12;

function loadDotEnvLocal() {
  if (process.env.DATABASE_URL) return;
  try {
    const contents = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env.local — fine, the DATABASE_URL check below will explain.
  }
}

async function main() {
  loadDotEnvLocal();

  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!DATABASE_URL) {
    console.error("Missing DATABASE_URL (set it in .env.local or the environment).");
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... [ADMIN_NAME=\"Your Name\"] node db/seed-admin.mjs"
    );
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  // Mirrors lib/db.ts: hosted Postgres (Supabase) needs SSL, localhost doesn't.
  const host = new URL(DATABASE_URL).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const fullName = ADMIN_NAME?.trim() || null;

    const existing = await pool.query("select id, email from public.admins limit 1");

    if (existing.rows.length === 0) {
      await pool.query(
        `insert into public.admins (email, password_hash, full_name) values ($1, $2, $3)`,
        [email, passwordHash, fullName]
      );
      console.log(`Created admin: ${email}`);
    } else {
      const current = existing.rows[0];
      await pool.query(
        `update public.admins set email = $1, password_hash = $2, full_name = $3 where id = $4`,
        [email, passwordHash, fullName, current.id]
      );
      console.log(`Updated existing admin (was ${current.email}) -> ${email}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
