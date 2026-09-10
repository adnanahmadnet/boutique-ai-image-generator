import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactNotificationEmail } from "@/lib/email";
import { getDisplayName } from "@/lib/user-display";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`contact:${getClientIp(request)}`, {
    windowSeconds: 3600,
    maxHits: 5,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Contact form isn't configured yet. Please email us directly." },
      { status: 503 }
    );
  }

  // A signed-in sender's identity is authoritative (and lets the admin see
  // exactly who asked) — otherwise fall back to the freely-typed name/email
  // from the public contact form.
  const user = await getCurrentUser();
  const name = user ? getDisplayName(user) : body.name?.trim();
  const email = user?.email ?? body.email?.trim();

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json(
      { error: "Name, a valid email, and a message are required." },
      { status: 400 }
    );
  }

  try {
    await query(
      `insert into public.contact_messages (buyer_id, name, email, subject, message)
       values ($1, $2, $3, $4, $5)`,
      [user?.id ?? null, name, email, subject || null, message]
    );

    await sendContactNotificationEmail({ name, email, subject, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json({ error: "Unable to send your message." }, { status: 500 });
  }
}
