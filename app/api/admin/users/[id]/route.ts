import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin";

// Deletes a user's auth account. orders/licenses.buyer_id reference the user
// with ON DELETE SET NULL, so their purchase history stays intact (now
// unlinked from an account) rather than being deleted along with them.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const admin = createAdminClient();

  const { data: targetResponse, error: lookupError } = await admin.auth.admin.getUserById(id);
  if (lookupError || !targetResponse.user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Guard rail: never let an admin delete an admin account (including their
  // own) from this endpoint — avoids accidentally locking everyone out.
  if (isAdminEmail(targetResponse.user.email)) {
    return NextResponse.json({ error: "Admin accounts can't be deleted here." }, { status: 400 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(id);
  if (deleteError) {
    console.error("[api/admin/users/delete]", deleteError);
    return NextResponse.json({ error: "Unable to delete user." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
