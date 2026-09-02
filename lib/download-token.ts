import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();
  const { error } = await admin.from("download_grants").insert({
    order_id: orderId,
    license_id: licenseId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(`Failed to create download grant: ${error.message}`);
  }

  return { token, expiresAt };
}

export type TokenValidation =
  | { valid: true; grantId: string; orderId: string }
  | { valid: false; reason: "not-found" | "expired" | "order-not-completed" };

export async function verifyDownloadToken(token: string): Promise<TokenValidation> {
  const admin = createAdminClient();

  const { data: grant, error } = await admin
    .from("download_grants")
    .select("id, order_id, expires_at, orders!inner(status)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (error || !grant) {
    return { valid: false, reason: "not-found" };
  }

  if (new Date(grant.expires_at as string).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  const order = grant.orders as unknown as { status: string } | null;
  if (order?.status !== "completed") {
    // Covers refunds: revoking access is just flipping orders.status away
    // from "completed" — no need to touch the grant row itself.
    return { valid: false, reason: "order-not-completed" };
  }

  return { valid: true, grantId: grant.id as string, orderId: grant.order_id as string };
}

export async function markGrantConsumed(grantId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("download_grants")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", grantId);
}
