import { Pool, type QueryResultRow } from "pg";

// Kept on globalThis so Next.js dev hot reloads reuse one pool instead of
// orphaning a new one (each holding open connections) on every module reload.
const globalForPool = globalThis as unknown as { __pgPool?: Pool };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!globalForPool.__pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Missing DATABASE_URL. Copy .env.example to .env.local and fill in your Supabase (Session/Transaction pooler) connection string."
      );
    }
    // Hosted Postgres (Supabase) requires SSL; a local dev database doesn't.
    const host = new URL(connectionString).hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    globalForPool.__pgPool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      // Supabase's pooler caps total clients (15 in session mode), and every
      // serverless instance gets its own pool — keep each one small and let
      // idle connections go quickly.
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalForPool.__pgPool;
}

// Runs a query and returns every matching row.
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

// Runs a query and returns the first matching row, or null.
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// True when a Postgres error is a unique-constraint violation (code 23505),
// e.g. a duplicate email on signup or a duplicate webhook event id.
export function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
