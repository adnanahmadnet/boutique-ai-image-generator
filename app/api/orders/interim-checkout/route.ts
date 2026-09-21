import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateLicenseKey } from "@/lib/license";
import { sendContactNotificationEmail } from "@/lib/email";
import { PRICING, SUPPORT_ADDON } from "@/data/pricing";

// Stand-in for real payment while live PayPal isn't wired up (see
// PAYMENTS_ENABLED in components/PayPalCheckout.tsx): grants dashboard
// access immediately instead of waiting on a capture, and emails the team so
// payment (and support, if requested) gets arranged manually. Requires a
// logged-in buyer — the order is always attached to their account, and the
// email used is the account's, never one typed into the form. Delete this
// route once PAYMENTS_ENABLED is back on.
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Checkout isn't configured yet." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to continue.", loginRequired: true },
      { status: 401 }
    );
  }

  const rateLimit = await checkRateLimit(`interim-checkout:${getClientIp(request)}`, {
    windowSeconds: 600,
    maxHits: 10,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: { addSupport?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = user.email;
  const addSupport = Boolean(body.addSupport);

  const amount = (
    Number(PRICING.amount) + (addSupport ? Number(SUPPORT_ADDON.amount) : 0)
  ).toFixed(2);

  try {
    const order = await queryOne<{ id: string }>(
      `insert into public.orders
         (buyer_id, buyer_email, amount, currency, status, completed_at, includes_support)
       values ($1, $2, $3, $4, 'completed', now(), $5)
       returning id`,
      [user.id, email, amount, PRICING.currency, addSupport]
    );

    if (!order) {
      throw new Error("Failed to create order row.");
    }

    const licenseKey = generateLicenseKey();
    await query(
      `insert into public.licenses (order_id, buyer_id, license_key)
       values ($1, $2, $3)`,
      [order.id, user.id, licenseKey]
    );

    // Feeds the support-team dashboard (/support): one request per order
    // that included the add-on, starting unclaimed until an agent picks it
    // up. See db/migrations/0004_support_team.sql.
    if (addSupport) {
      await query(
        `insert into public.support_requests (order_id, buyer_id, buyer_email)
         values ($1, $2, $3)`,
        [order.id, user.id, email]
      );
    }

    const notifyMessage = addSupport
      ? `Wants the ${PRICING.planName} ($${PRICING.amount}) plus the ${SUPPORT_ADDON.label} add-on ($${SUPPORT_ADDON.amount}) — total $${amount} ${PRICING.currency}. Access has been granted automatically (no live payment yet) — please follow up to collect payment and scope the support work.`
      : `Wants the ${PRICING.planName} ($${PRICING.amount} ${PRICING.currency}). Access has been granted automatically (no live payment yet) — please follow up to collect payment.`;

    const emailResult = await sendContactNotificationEmail({
      name: email,
      email,
      subject: addSupport ? "New sign-up — pipeline + support requested" : "New sign-up — pipeline",
      message: notifyMessage,
    });

    if (!emailResult.sent) {
      console.warn("[orders/interim-checkout] team notification not sent:", emailResult.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[orders/interim-checkout]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
