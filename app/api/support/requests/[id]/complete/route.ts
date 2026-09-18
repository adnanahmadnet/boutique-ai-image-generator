import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentSupportAgent } from "@/lib/get-current-support-agent";

// Closes out a support request. The `and assigned_agent_id = $agent.id`
// guard is the ownership check — only the agent who claimed a request can
// mark it done, the same pattern used by /api/downloads/reissue for order
// ownership.
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

  let notes: string | undefined;
  try {
    const body = await request.json();
    notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updated = await queryOne<{ id: string }>(
    `update public.support_requests
     set status = 'done', notes = coalesce($1, notes), completed_at = now(), updated_at = now()
     where id = $2 and assigned_agent_id = $3 and status = 'scheduled'
     returning id`,
    [notes || null, id, agent.id]
  );

  if (!updated) {
    return NextResponse.json(
      { error: "This request isn't assigned to you, or is already closed." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
