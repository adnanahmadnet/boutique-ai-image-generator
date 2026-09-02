import { Resend } from "resend";
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from "@/emails/OrderConfirmation";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export interface SendEmailResult {
  sent: boolean;
  reason?: string;
}

// Order/license creation must never fail because email isn't configured or
// the provider hiccups — this always resolves, logging instead of throwing.
export async function sendOrderConfirmationEmail(
  to: string,
  props: OrderConfirmationEmailProps
): Promise<SendEmailResult> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL;

  if (!resend || !from) {
    console.warn(
      `[email] RESEND_API_KEY / RESEND_FROM_EMAIL not set — skipped order confirmation email to ${to}.`
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: "Your AI Image Generation Pipeline license & download",
      react: <OrderConfirmationEmail {...props} />,
    });

    if (error) {
      console.error("[email] Resend rejected the order confirmation email", error);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send order confirmation email", error);
    return { sent: false, reason: "unexpected-error" };
  }
}

export interface ContactNotificationProps {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Alerts the support inbox that a new contact_messages row was written. The
// message itself is stored in the DB (source of truth); this is a courtesy
// notification, so it also no-ops quietly when unconfigured.
export async function sendContactNotificationEmail(
  props: ContactNotificationProps
): Promise<SendEmailResult> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL;
  const inbox = process.env.CONTACT_INBOX_EMAIL;

  if (!resend || !from || !inbox) {
    console.warn("[email] Contact notification skipped — email or inbox not configured.");
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: inbox,
      replyTo: props.email,
      subject: `New contact form message${props.subject ? `: ${props.subject}` : ""}`,
      text: `From: ${props.name} <${props.email}>\n\n${props.message}`,
    });

    if (error) {
      console.error("[email] Resend rejected the contact notification", error);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send contact notification", error);
    return { sent: false, reason: "unexpected-error" };
  }
}
