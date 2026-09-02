import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { PRICING } from "@/data/pricing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const rateLimit = await checkRateLimit(`create-order:${getClientIp(request)}`, {
    windowSeconds: 600,
    maxHits: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: { email?: string; boutiqueName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  const boutiqueName = body.boutiqueName?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const { data: orderRow, error: insertError } = await admin
      .from("orders")
      .insert({
        buyer_email: email,
        boutique_name: boutiqueName || null,
        amount: PRICING.amount,
        currency: PRICING.currency,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !orderRow) {
      throw new Error(insertError?.message ?? "Failed to create order row.");
    }

    const paypalOrder = await createPayPalOrder(orderRow.id as string);

    const { error: updateError } = await admin
      .from("orders")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", orderRow.id);

    if (updateError) {
      console.error("[paypal/create-order] failed to link paypal order id", updateError);
    }

    return NextResponse.json({ id: paypalOrder.id, orderId: orderRow.id });
  } catch (error) {
    console.error("[paypal/create-order]", error);
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }
}
