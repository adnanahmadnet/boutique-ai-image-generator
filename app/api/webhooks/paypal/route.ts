import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, buyer_id, buyer_email, boutique_name, amount, currency, status")
    .eq("id", orderRowId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("[webhooks/paypal] order row not found for custom_id", orderRowId, orderError);
    return;
  }

  if (order.status === "completed") {
    // Already processed by an earlier delivery of a different event id for
    // the same capture — defensive no-op alongside the webhook_events guard.
    return;
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      status: "completed",
      paypal_capture_id: captureId,
      completed_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("[webhooks/paypal] failed to mark order completed", updateError);
    return;
  }

  const licenseKey = generateLicenseKey();
  const { data: license, error: licenseError } = await admin
    .from("licenses")
    .insert({
      order_id: order.id,
      buyer_id: order.buyer_id,
      license_key: licenseKey,
    })
    .select("id")
    .single();

  if (licenseError || !license) {
    console.error("[webhooks/paypal] failed to create license", licenseError);
    return;
  }

  let downloadUrl = `${getSiteUrl()}/dashboard/downloads`;
  try {
    const grant = await createDownloadGrant(order.id as string, license.id as string);
    downloadUrl = `${getSiteUrl()}/api/download?token=${grant.token}`;
  } catch (grantError) {
    console.error("[webhooks/paypal] failed to create download grant", grantError);
  }

  const emailResult = await sendOrderConfirmationEmail(order.buyer_email as string, {
    boutiqueName: (order.boutique_name as string | null) ?? undefined,
    licenseKey,
    amount: order.amount as string,
    currency: order.currency as string,
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

  const admin = createAdminClient();
  await admin.from("orders").update({ status: "failed" }).eq("id", orderRowId);
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

  const admin = createAdminClient();
  await admin.from("orders").update({ status: "refunded" }).eq("id", orderRowId);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
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

  const admin = createAdminClient();
  const { error: idempotencyError } = await admin
    .from("webhook_events")
    .insert({ id: event.id, event_type: event.event_type });

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
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
