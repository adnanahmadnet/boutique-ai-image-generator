import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { hashSessionToken } from "@/lib/auth/session";

// A distinct cookie from the buyer and admin sessions (see
// lib/auth/session.ts and lib/auth/admin-session.ts) so a support-agent
// session can never be confused with either.
export const SUPPORT_SESSION_COOKIE_NAME = "support_session_token";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Creates a support-agent session row and sets the httpOnly cookie. Call
// from a Route Handler only — cookie writes aren't allowed during a Server
// Component render.
export async function createSupportSession(agentId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `insert into public.support_sessions (agent_id, token_hash, expires_at) values ($1, $2, $3)`,
    [agentId, hashSessionToken(token), expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(SUPPORT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Deletes the current support-agent session row (if any) and clears the
// cookie.
export async function destroySupportSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPORT_SESSION_COOKIE_NAME)?.value;

  if (token) {
    await query(`delete from public.support_sessions where token_hash = $1`, [
      hashSessionToken(token),
    ]);
  }

  cookieStore.delete(SUPPORT_SESSION_COOKIE_NAME);
}
