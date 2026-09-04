import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin";
import { sendContactReplyEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller || !isAdminEmail(caller.email)) {
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
  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("contact_messages")
    .select("email, subject, message")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("contact_messages")
    .update({ reply, replied_at: new Date().toISOString(), status: "replied" })
    .eq("id", id);

  if (updateError) {
    console.error("[api/admin/contact/reply]", updateError);
    return NextResponse.json({ error: "Unable to save reply." }, { status: 500 });
  }

  const emailResult = await sendContactReplyEmail({
    to: existing.email as string,
    subject: existing.subject as string | undefined,
    originalMessage: existing.message as string,
    reply,
  });

  return NextResponse.json({ ok: true, emailSent: emailResult.sent });
}
