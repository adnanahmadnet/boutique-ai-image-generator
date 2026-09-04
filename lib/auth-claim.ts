import { createAdminClient } from "@/lib/supabase/admin";

// Claims any guest-checkout orders/licenses made with this email before the
// buyer ever created an account (buyer_id was left null at purchase time).
// Called right after a successful signup or login, regardless of which auth
// method was used.
export async function claimGuestOrders(userId: string, email: string) {
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
