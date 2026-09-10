import crypto from "node:crypto";
import { query, queryOne } from "@/lib/db";

// Concrete pick within the doc's 15–60 minute range (see plan §14).
const TOKEN_TTL_MS = 30 * 60 * 1000;
const TOKEN_BYTES = 32;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface CreateGrantResult {
  token: string;
  expiresAt: Date;
}

// Mints a fresh, DB-backed download grant tied to a real order + license.
// The returned token is an opaque bearer credential — only its SHA-256 hash
// is stored, never the raw value. Called by the webhook handler (first
// grant) and the authenticated reissue endpoint (subsequent grants).
export async function createDownloadGrant(
  orderId: string,
  licenseId: string
): Promise<CreateGrantResult> {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await query(
    `insert into public.download_grants (order_id, license_id, token_hash, expires_at)
     values ($1, $2, $3, $4)`,
    [orderId, licenseId, hashToken(token), expiresAt.toISOString()]
  );

  return { token, expiresAt };
}

export type TokenValidation =
  | { valid: true; grantId: string; orderId: string }
  | { valid: false; reason: "not-found" | "expired" | "order-not-completed" };

export async function verifyDownloadToken(token: string): Promise<TokenValidation> {
  const grant = await queryOne<{
    id: string;
    order_id: string;
    expires_at: string;
    status: string;
  }>(
    `select g.id, g.order_id, g.expires_at, o.status
     from public.download_grants g
     join public.orders o on o.id = g.order_id
     where g.token_hash = $1`,
    [hashToken(token)]
  );

  if (!grant) {
    return { valid: false, reason: "not-found" };
  }

  if (new Date(grant.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  if (grant.status !== "completed") {
    // Covers refunds: revoking access is just flipping orders.status away
    // from "completed" — no need to touch the grant row itself.
    return { valid: false, reason: "order-not-completed" };
  }

  return { valid: true, grantId: grant.id, orderId: grant.order_id };
}

export async function markGrantConsumed(grantId: string): Promise<void> {
  await query(`update public.download_grants set consumed_at = now() where id = $1`, [grantId]);
}
