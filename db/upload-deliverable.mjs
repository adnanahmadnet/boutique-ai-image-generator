// Uploads (or replaces) the paid download zip in public.deliverables.
//
//   node db/upload-deliverable.mjs [path-to-file]
//
// Defaults to private/downloads/ai-image-generation-pipeline.zip. The row is
// keyed by the file's basename, which is what /api/download looks up. Re-run
// whenever the zip changes. Falls back to reading DATABASE_URL from
// .env.local (this script runs outside Next.js).

import { readFileSync } from "node:fs";
import path from "node:path";
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

  const filePath = path.resolve(
    process.argv[2] ?? "private/downloads/ai-image-generation-pipeline.zip"
  );
  const name = path.basename(filePath);
  const content = readFileSync(filePath);

  // Mirrors lib/db.ts: hosted Postgres (Supabase) needs SSL, localhost doesn't.
  const host = new URL(DATABASE_URL).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(
      `insert into public.deliverables (name, content, content_type)
       values ($1, $2, 'application/zip')
       on conflict (name) do update
         set content = excluded.content, updated_at = now()`,
      [name, content]
    );
    console.log(`Uploaded ${name} (${content.length} bytes)`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
