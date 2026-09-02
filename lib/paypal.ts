import { PRICING } from "@/data/pricing";

// Sandbox by default. Point at https://api-m.paypal.com for production.
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET environment variables. Copy .env.example to .env.local and fill in Sandbox credentials from developer.paypal.com."
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to authenticate with PayPal (${res.status})`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(orderRowId: string): Promise<{ id: string }> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          // Lets the webhook handler look our order row up directly instead
          // of string-matching on amount/description.
          custom_id: orderRowId,
          description: PRICING.planName,
          amount: {
            currency_code: PRICING.currency,
            value: PRICING.amount,
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create PayPal order: ${body}`);
  }

  return res.json();
}

export interface CaptureResult {
  status: string;
  orderId: string;
}

export async function capturePayPalOrder(
  orderId: string
): Promise<CaptureResult> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to capture PayPal order: ${JSON.stringify(data)}`);
  }

  return { status: data.status as string, orderId };
}

export interface WebhookHeaders {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
}

// Verifies a PayPal webhook delivery is genuinely from PayPal and untampered,
// per lib/paypal.ts's role as the single PayPal REST integration point.
// Never trust a webhook payload just because it arrived at the URL.
export async function verifyWebhookSignature(
  headers: WebhookHeaders,
  webhookEvent: unknown
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Fail closed: without a configured webhook id we cannot verify anything,
    // so refuse to trust the payload rather than skip verification.
    console.error("[paypal] PAYPAL_WEBHOOK_ID is not set — refusing to trust webhook.");
    return false;
  }

  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[paypal] verify-webhook-signature request failed", res.status);
    return false;
  }

  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
