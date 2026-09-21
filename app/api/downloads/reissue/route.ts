import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { createDownloadGrant } from "@/lib/download-token";
import { checkRateLimit } from "@/lib/rate-limit";

// Authenticated. Backs the "Get a new download link" button on
// /dashboard/downloads once the original 30-minute link has expired.
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  let orderId: string | undefined;
  try {
    const body = await request.json();
    orderId = body.orderId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`reissue:${user.id}`, {
    windowSeconds: 3600,
    maxHits: 10,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Ownership check done explicitly here — there's no RLS layer to rely on
  // once queries run through the app's own trusted DB connection.
  const order = await queryOne<{ id: string; status: string }>(
    `select id, status from public.orders where id = $1 and buyer_id = $2`,
    [orderId, user.id]
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "completed") {
    return NextResponse.json(
      { error: "This order isn't eligible for download." },
      { status: 403 }
    );
  }

  const license = await queryOne<{ id: string }>(
    `select id from public.licenses where order_id = $1`,
    [order.id]
  );

  if (!license) {
    return NextResponse.json({ error: "License not found for this order." }, { status: 404 });
  }

  try {
    const grant = await createDownloadGrant(order.id, license.id);
    return NextResponse.json({
      // Relative on purpose: the dashboard button is clicked in the buyer's
      // own browser, so a same-origin link works on any domain (localhost,
      // preview deploys, production) regardless of NEXT_PUBLIC_SITE_URL.
      downloadUrl: `/api/download?token=${grant.token}`,
      expiresAt: grant.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[downloads/reissue]", error);
    return NextResponse.json(
      { error: "Unable to create a new download link." },
      { status: 500 }
    );
  }
}
