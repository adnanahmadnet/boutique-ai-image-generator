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
      subject: "Your PixelCore Engine license & download",
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

export interface ContactReplyProps {
  to: string;
  subject?: string;
  originalMessage: string;
  reply: string;
}

// Notifies the sender that an admin replied. The reply is also stored on the
// contact_messages row itself (visible in their dashboard), so this is a
// courtesy notification, not the only place the reply lives — no-ops
// quietly when unconfigured.
export async function sendContactReplyEmail(props: ContactReplyProps): Promise<SendEmailResult> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL;

  if (!resend || !from) {
    console.warn(`[email] Contact reply email skipped — not configured. To: ${props.to}`);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: props.to,
      subject: `Re: ${props.subject || "Your message"}`,
      text: `${props.reply}\n\n---\nYour original message:\n${props.originalMessage}`,
    });

    if (error) {
      console.error("[email] Resend rejected the contact reply email", error);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send contact reply email", error);
    return { sent: false, reason: "unexpected-error" };
  }
}
