import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export const SESSION_COOKIE_NAME = "session_token";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Creates a session row and sets the httpOnly cookie. Call from a Route
// Handler or Server Action only — cookie writes aren't allowed during a
// Server Component render.
export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `insert into public.sessions (user_id, token_hash, expires_at) values ($1, $2, $3)`,
    [userId, hashSessionToken(token), expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Deletes the current session row (if any) and clears the cookie.
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await query(`delete from public.sessions where token_hash = $1`, [hashSessionToken(token)]);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
