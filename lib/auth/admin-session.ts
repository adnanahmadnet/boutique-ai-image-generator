import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { hashSessionToken } from "@/lib/auth/session";

// A distinct cookie from the buyer session (see lib/auth/session.ts) so an
// admin session and a buyer session can never be confused for one another,
// and so /admin and /dashboard can each be gated on their own cookie.
export const ADMIN_SESSION_COOKIE_NAME = "admin_session_token";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Creates an admin session row and sets the httpOnly cookie. Call from a
// Route Handler only — cookie writes aren't allowed during a Server
// Component render.
export async function createAdminSession(adminId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `insert into public.admin_sessions (admin_id, token_hash, expires_at) values ($1, $2, $3)`,
    [adminId, hashSessionToken(token), expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Deletes the current admin session row (if any) and clears the cookie.
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (token) {
    await query(`delete from public.admin_sessions where token_hash = $1`, [
      hashSessionToken(token),
    ]);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}
