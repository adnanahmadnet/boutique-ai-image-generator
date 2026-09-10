import { query } from "@/lib/db";

// Claims any guest-checkout orders/licenses made with this email before the
// buyer ever created an account (buyer_id was left null at purchase time).
// Called right after a successful signup or login, regardless of which auth
// method was used.
export async function claimGuestOrders(userId: string, email: string) {
  const updatedOrders = await query<{ id: string }>(
    `update public.orders set buyer_id = $1
     where buyer_email = $2 and buyer_id is null
     returning id`,
    [userId, email]
  );

  const orderIds = updatedOrders.map((row) => row.id);

  if (orderIds.length > 0) {
    await query(
      `update public.licenses set buyer_id = $1
       where order_id = any($2::uuid[]) and buyer_id is null`,
      [userId, orderIds]
    );
  }
}
