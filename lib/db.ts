import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Missing DATABASE_URL. Copy .env.example to .env.local and fill in your local Postgres connection string."
      );
    }
    pool = new Pool({ connectionString });
  }
  return pool;
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
