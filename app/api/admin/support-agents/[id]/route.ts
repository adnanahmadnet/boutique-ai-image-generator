import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/get-current-admin";

// Activates/deactivates a support account. Deactivating (rather than
// deleting) is deliberate: support_requests.assigned_agent_id references
// this row, and a hard delete would either orphan (ON DELETE SET NULL) or
// block (if referenced) that assignment history — see
// db/migrations/0004_support_team.sql.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 403 });
  }

  const { id } = await params;

  let isActive: unknown;
  try {
    const body = await request.json();
    isActive = body.isActive;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  const updated = await queryOne<{ id: string }>(
    `update public.support_agents set is_active = $1 where id = $2 returning id`,
    [isActive, id]
  );

  if (!updated) {
    return NextResponse.json({ error: "Support agent not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
