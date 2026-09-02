import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// This route is a UX fast-path only: it reports whether PayPal accepted the
// capture so the client can show "confirming your order…" immediately. It
// does NOT create the order/license/download grant or send email — the
// verified webhook (app/api/webhooks/paypal/route.ts) is the sole source of
// truth for granting access, since a client-side response can be spoofed,
// dropped, or arrive from a browser that closes before it's processed.
export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`capture-order:${getClientIp(request)}`, {
    windowSeconds: 600,
    maxHits: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let paypalOrderId: string | undefined;

  try {
    const body = await request.json();
    paypalOrderId = body.orderId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!paypalOrderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  try {
    const result = await capturePayPalOrder(paypalOrderId);
    return NextResponse.json({ status: result.status });
  } catch (error) {
    console.error("[paypal/capture-order]", error);
    return NextResponse.json({ error: "Unable to capture payment." }, { status: 500 });
  }
}
