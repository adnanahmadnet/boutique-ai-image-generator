import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import OrderDetail, { type OrderRow } from "@/components/dashboard/OrderDetail";
import { PRICING, SUPPORT_ADDON } from "@/data/pricing";

// This is a one-time-purchase product, so a buyer almost always has exactly
// one order here — the threshold below (base + support add-on) is how we
// tell, from the amount alone, whether that single purchase included
// support. Revisit if pricing ever stops being a flat fee plus one add-on.
const SUPPORT_INCLUDED_THRESHOLD = Number(PRICING.amount) + Number(SUPPORT_ADDON.amount) - 0.01;

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser();

  // Only completed orders — this is a one-time purchase, so a buyer never
  // needs to see their own abandoned/failed checkout attempts here. (Those
  // still exist in the DB for reconciliation; they're just not shown.)
  const orders = user
    ? await query<{
        id: string;
        created_at: string;
        amount: string;
        currency: string;
        status: OrderRow["status"];
      }>(
        `select id, created_at, amount, currency, status from public.orders
         where buyer_id = $1 and status = 'completed'
         order by created_at desc
         limit 1`,
        [user.id]
      )
    : [];

  const rows: OrderRow[] = orders.map((order) => ({
    id: order.id,
    createdAt: order.created_at,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    includesSupport: Number(order.amount) >= SUPPORT_INCLUDED_THRESHOLD,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Your order</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          This is a one-time purchase — here&apos;s what you bought.
        </p>
      </div>
      <OrderDetail orders={rows} />
    </div>
  );
}
