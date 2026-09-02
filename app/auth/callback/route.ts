import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Claims any guest-checkout orders/licenses made with this email before the
// buyer ever created an account (buyer_id was left null at purchase time).
async function claimGuestOrders(userId: string, email: string) {
  const admin = createAdminClient();

  await admin
    .from("orders")
    .update({ buyer_id: userId })
    .eq("buyer_email", email)
    .is("buyer_id", null);

  const { data: ownedOrders } = await admin.from("orders").select("id").eq("buyer_id", userId);
  const orderIds = (ownedOrders ?? []).map((row) => row.id as string);

  if (orderIds.length > 0) {
    await admin
      .from("licenses")
      .update({ buyer_id: userId })
      .in("order_id", orderIds)
      .is("buyer_id", null);
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  const { user } = data.session;

  if (user.email) {
    try {
      await claimGuestOrders(user.id, user.email);
    } catch (claimError) {
      console.error("[auth/callback] failed to claim guest orders", claimError);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
