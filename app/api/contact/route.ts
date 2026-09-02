import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactNotificationEmail } from "@/lib/email";

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

  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json(
      { error: "Name, a valid email, and a message are required." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Contact form isn't configured yet. Please email us directly." },
      { status: 503 }
    );
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });

    if (error) {
      throw new Error(error.message);
    }

    await sendContactNotificationEmail({ name, email, subject, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json({ error: "Unable to send your message." }, { status: 500 });
  }
}
