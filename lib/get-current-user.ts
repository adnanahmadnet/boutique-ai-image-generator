import { cache } from "react";
import { cookies } from "next/headers";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { SESSION_COOKIE_NAME, hashSessionToken } from "@/lib/auth/session";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

// Memoized per-request (React's cache()) so a layout and its page can both
// call this without triggering two round trips to the database for the
// same request.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne<SessionUser>(
    `select u.id, u.email, u.full_name, u.created_at, u.last_sign_in_at, u.email_confirmed_at
     from public.sessions s
     join public.users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashSessionToken(token)]
  );
});
