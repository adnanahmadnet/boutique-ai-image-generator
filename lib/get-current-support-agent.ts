import { cache } from "react";
import { cookies } from "next/headers";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { SUPPORT_SESSION_COOKIE_NAME } from "@/lib/auth/support-session";
import { hashSessionToken } from "@/lib/auth/session";

export interface SessionSupportAgent {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
}

// Deliberately separate from getCurrentUser()/getCurrentAdmin() — reads its
// own cookie against its own table, so this identity can never resolve as
// either of the other two. Also requires is_active = true, so an admin
// deactivating an agent revokes access immediately even against an
// already-issued session. Memoized per-request like the other two.
export const getCurrentSupportAgent = cache(async (): Promise<SessionSupportAgent | null> => {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPORT_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne<SessionSupportAgent>(
    `select a.id, a.email, a.full_name, a.created_at, a.last_sign_in_at
     from public.support_sessions s
     join public.support_agents a on a.id = s.agent_id
     where s.token_hash = $1 and s.expires_at > now() and a.is_active = true`,
    [hashSessionToken(token)]
  );
});
