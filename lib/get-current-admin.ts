import { cache } from "react";
import { cookies } from "next/headers";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";
import { hashSessionToken } from "@/lib/auth/session";

export interface SessionAdmin {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

// Deliberately separate from getCurrentUser() — reads a different cookie
// against a different table, so a buyer session can never resolve to an
// admin (or vice versa). Memoized per-request like getCurrentUser().
export const getCurrentAdmin = cache(async (): Promise<SessionAdmin | null> => {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne<SessionAdmin>(
    `select a.id, a.email, a.full_name, a.created_at, a.last_sign_in_at
     from public.admin_sessions s
     join public.admins a on a.id = s.admin_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashSessionToken(token)]
  );
});
