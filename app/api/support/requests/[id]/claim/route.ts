import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentSupportAgent } from "@/lib/get-current-support-agent";

// Claims an unclaimed support request and sets a scheduled contact time.
// The `and status = 'unclaimed'` guard on the UPDATE is what prevents two
// agents claiming the same request in a race — whichever request wins the
// row lock gets it, the other gets rowCount 0 back.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const agent = await getCurrentSupportAgent();
  if (!agent) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  let scheduledAt: string | undefined;
  try {
    const body = await request.json();
    scheduledAt = body.scheduledAt;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!scheduledAt || Number.isNaN(new Date(scheduledAt).getTime())) {
    return NextResponse.json({ error: "A valid scheduled time is required." }, { status: 400 });
  }

  const updated = await queryOne<{ id: string }>(
    `update public.support_requests
     set status = 'scheduled', assigned_agent_id = $1, scheduled_at = $2, updated_at = now()
     where id = $3 and status = 'unclaimed'
     returning id`,
    [agent.id, new Date(scheduledAt).toISOString(), id]
  );

  if (!updated) {
    return NextResponse.json(
      { error: "This request has already been claimed by someone else." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
