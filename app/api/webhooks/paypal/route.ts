import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { isDatabaseConfigured, isUniqueViolation, query, queryOne } from "@/lib/db";
import { generateLicenseKey } from "@/lib/license";
import { createDownloadGrant } from "@/lib/download-token";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

interface PayPalCaptureResource {
  id: string;
  status: string;
  custom_id?: string;
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: PayPalCaptureResource;
}

async function handleCaptureCompleted(event: PayPalWebhookEvent) {
  const orderRowId = event.resource.custom_id;
  const captureId = event.resource.id;

  if (!orderRowId) {
    console.error("[webhooks/paypal] capture completed with no custom_id, cannot process", captureId);
    return;
  }

  const order = await queryOne<{
    id: string;
    buyer_id: string | null;
    buyer_email: string;
    boutique_name: string | null;
    amount: string;
    currency: string;
    status: string;
  }>(
    `select id, buyer_id, buyer_email, boutique_name, amount, currency, status
     from public.orders where id = $1`,
    [orderRowId]
  );

  if (!order) {
    console.error("[webhooks/paypal] order row not found for custom_id", orderRowId);
    return;
  }

  if (order.status === "completed") {
    // Already processed by an earlier delivery of a different event id for
    // the same capture — defensive no-op alongside the webhook_events guard.
    return;
  }

  await query(
    `update public.orders set status = 'completed', paypal_capture_id = $1, completed_at = now()
     where id = $2`,
    [captureId, order.id]
  );

  const licenseKey = generateLicenseKey();
  const license = await queryOne<{ id: string }>(
    `insert into public.licenses (order_id, buyer_id, license_key)
     values ($1, $2, $3)
     returning id`,
    [order.id, order.buyer_id, licenseKey]
  );

  if (!license) {
    console.error("[webhooks/paypal] failed to create license for order", order.id);
    return;
  }

  let downloadUrl = `${getSiteUrl()}/dashboard/downloads`;
  try {
    const grant = await createDownloadGrant(order.id, license.id);
    downloadUrl = `${getSiteUrl()}/api/download?token=${grant.token}`;
  } catch (grantError) {
    console.error("[webhooks/paypal] failed to create download grant", grantError);
  }

  const emailResult = await sendOrderConfirmationEmail(order.buyer_email, {
    boutiqueName: order.boutique_name ?? undefined,
    licenseKey,
    amount: order.amount,
    currency: order.currency,
    dashboardUrl: `${getSiteUrl()}/login`,
    downloadUrl,
  });

  if (!emailResult.sent) {
    console.warn("[webhooks/paypal] order confirmation email not sent:", emailResult.reason);
  }
}

async function handleCaptureDenied(event: PayPalWebhookEvent) {
  const orderRowId = event.resource.custom_id;
  if (!orderRowId) return;

  await query(`update public.orders set status = 'failed' where id = $1`, [orderRowId]);
}

async function handleCaptureRefunded(event: PayPalWebhookEvent) {
  // Refund resources typically inherit custom_id from the original capture,
  // but this isn't guaranteed by PayPal for every integration. If it's
  // missing, we log for manual reconciliation rather than guess — silently
  // failing to revoke access would be worse than a loud no-op here.
  const orderRowId = event.resource.custom_id;
  if (!orderRowId) {
    console.warn(
      "[webhooks/paypal] refund event with no custom_id — manual reconciliation needed",
      event.resource.id
    );
    return;
  }

  await query(`update public.orders set status = 'refunded' where id = $1`, [orderRowId]);
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    // Fail closed: without a DB there's nothing safe to do with a payment
    // webhook. Return 500 so PayPal retries once the app is configured.
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  let event: PayPalWebhookEvent;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionSig = request.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: "Missing PayPal signature headers." }, { status: 400 });
  }

  const verified = await verifyWebhookSignature(
    { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig },
    event
  );

  if (!verified) {
    console.error("[webhooks/paypal] signature verification failed for event", event.id);
    return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
  }

  try {
    await query(`insert into public.webhook_events (id, event_type) values ($1, $2)`, [
      event.id,
      event.event_type,
    ]);
  } catch (idempotencyError) {
    if (isUniqueViolation(idempotencyError)) {
      // Duplicate delivery of an event we've already processed — ack without
      // reprocessing (PayPal retries deliveries that don't get a fast 200).
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[webhooks/paypal] idempotency insert failed", idempotencyError);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      await handleCaptureCompleted(event);
      break;
    case "PAYMENT.CAPTURE.DENIED":
      await handleCaptureDenied(event);
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
      await handleCaptureRefunded(event);
      break;
    default:
      // Unhandled event types are acknowledged, not errors.
      break;
  }

  return NextResponse.json({ received: true });
}
