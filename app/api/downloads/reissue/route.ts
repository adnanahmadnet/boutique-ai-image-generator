import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDownloadGrant } from "@/lib/download-token";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/site-url";

// Authenticated. Backs the "Get a new download link" button on
// /dashboard/downloads once the original 30-minute link has expired.
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // RLS-scoped (orders_select_own) — this can only ever resolve to a row the
  // caller owns, so no separate ownership check is needed here.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "completed") {
    return NextResponse.json(
      { error: "This order isn't eligible for download." },
      { status: 403 }
    );
  }

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (licenseError || !license) {
    return NextResponse.json({ error: "License not found for this order." }, { status: 404 });
  }

  try {
    const grant = await createDownloadGrant(order.id as string, license.id as string);
    return NextResponse.json({
      downloadUrl: `${getSiteUrl()}/api/download?token=${grant.token}`,
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
