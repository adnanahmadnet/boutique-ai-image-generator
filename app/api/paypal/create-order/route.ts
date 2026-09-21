import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { PRICING } from "@/data/pricing";

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  // Payment requires a logged-in buyer (same rule as the interim checkout).
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to continue.", loginRequired: true },
      { status: 401 }
    );
  }

  const rateLimit = await checkRateLimit(`create-order:${getClientIp(request)}`, {
    windowSeconds: 600,
    maxHits: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: { boutiqueName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const boutiqueName = body.boutiqueName?.trim();

  // The buyer's own account email is authoritative; buyer_id is always set.
  const email = user.email;

  try {
    const orderRow = await queryOne<{ id: string }>(
      `insert into public.orders (buyer_id, buyer_email, boutique_name, amount, currency, status)
       values ($1, $2, $3, $4, $5, 'pending')
       returning id`,
      [user.id, email, boutiqueName || null, PRICING.amount, PRICING.currency]
    );

    if (!orderRow) {
      throw new Error("Failed to create order row.");
    }

    const paypalOrder = await createPayPalOrder(orderRow.id);

    try {
      await query(`update public.orders set paypal_order_id = $1 where id = $2`, [
        paypalOrder.id,
        orderRow.id,
      ]);
    } catch (updateError) {
      console.error("[paypal/create-order] failed to link paypal order id", updateError);
    }

    return NextResponse.json({ id: paypalOrder.id, orderId: orderRow.id });
  } catch (error) {
    console.error("[paypal/create-order]", error);
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }
}
