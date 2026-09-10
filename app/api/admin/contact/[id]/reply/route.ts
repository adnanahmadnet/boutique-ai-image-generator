import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/get-current-admin";
import { sendContactReplyEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const caller = await getCurrentAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let reply: string | undefined;
  try {
    const body = await request.json();
    reply = body.reply?.trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!reply) {
    return NextResponse.json({ error: "A reply message is required." }, { status: 400 });
  }

  const { id } = await params;

  const existing = await queryOne<{ email: string; subject: string | null; message: string }>(
    `select email, subject, message from public.contact_messages where id = $1`,
    [id]
  );

  if (!existing) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  try {
    await query(
      `update public.contact_messages set reply = $1, replied_at = now(), status = 'replied'
       where id = $2`,
      [reply, id]
    );
  } catch (error) {
    console.error("[api/admin/contact/reply]", error);
    return NextResponse.json({ error: "Unable to save reply." }, { status: 500 });
  }

  const emailResult = await sendContactReplyEmail({
    to: existing.email,
    subject: existing.subject ?? undefined,
    originalMessage: existing.message,
    reply,
  });

  return NextResponse.json({ ok: true, emailSent: emailResult.sent });
}
