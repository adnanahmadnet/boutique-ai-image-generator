import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { destroyAdminSession } from "@/lib/auth/admin-session";

// Shared by the buyer dashboard nav and the admin nav (see
// components/dashboard/LogoutButton.tsx). Each destroy function only acts
// on its own cookie and is a no-op if that cookie isn't set, so calling
// both here is safe regardless of which one the caller actually had.
export async function POST() {
  await Promise.all([destroySession(), destroyAdminSession()]);
  return NextResponse.json({ ok: true });
}
