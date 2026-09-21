// Applies every file in db/migrations/ in filename order against DATABASE_URL.
//
//   node db/migrate.mjs
//
// Each file runs in its own transaction and is recorded in
// public.schema_migrations, so re-running only applies what's new. Falls back
// to reading DATABASE_URL from .env.local (this script runs outside Next.js,
// which is the only thing that loads .env.local automatically).

import { readFileSync, readdirSync } from "node:fs";
import pg from "pg";

const { Pool } = pg;

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

  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error("Missing DATABASE_URL (set it in .env.local or the environment).");
    process.exit(1);
  }

  // Mirrors lib/db.ts: hosted Postgres (Supabase) needs SSL, localhost doesn't.
  const host = new URL(DATABASE_URL).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  const migrationsDir = new URL("./migrations/", import.meta.url);
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  try {
    await client.query(
      `create table if not exists public.schema_migrations (
         name text primary key,
         applied_at timestamptz not null default now()
       )`
    );
    const applied = new Set(
      (await client.query("select name from public.schema_migrations")).rows.map((r) => r.name)
    );

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip   ${file} (already applied)`);
        continue;
      }
      const sql = readFileSync(new URL(file, migrationsDir), "utf8");
      try {
        await client.query("begin");
        await client.query(sql);
        await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log(`apply  ${file}`);
      } catch (error) {
        await client.query("rollback");
        console.error(`FAILED ${file}: ${error.message}`);
        process.exit(1);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
