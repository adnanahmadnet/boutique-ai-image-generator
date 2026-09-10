import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/get-current-admin";

// Deletes a user's account. orders/licenses.buyer_id reference the user
// with ON DELETE SET NULL, so their purchase history stays intact (now
// unlinked from an account) rather than being deleted along with them.
// public.users never contains an admin (see
// db/migrations/0003_separate_admin_table.sql), so there's no risk of this
// endpoint deleting the admin account — it can only ever target a buyer.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const caller = await getCurrentAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;

  const target = await queryOne<{ id: string; email: string }>(
    `select id, email from public.users where id = $1`,
    [id]
  );

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  try {
    await query(`delete from public.users where id = $1`, [id]);
  } catch (error) {
    console.error("[api/admin/users/delete]", error);
    return NextResponse.json({ error: "Unable to delete user." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
