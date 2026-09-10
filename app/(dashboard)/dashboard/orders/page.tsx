import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import OrderTable, { type OrderRow } from "@/components/dashboard/OrderTable";

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser();

  const orders = user
    ? await query<{
        id: string;
        created_at: string;
        amount: string;
        currency: string;
        status: OrderRow["status"];
      }>(
        `select id, created_at, amount, currency, status from public.orders
         where buyer_id = $1
         order by created_at desc`,
        [user.id]
      )
    : [];

  const rows: OrderRow[] = orders.map((order) => ({
    id: order.id,
    createdAt: order.created_at,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Order history</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">Every purchase attempt tied to your account.</p>
      </div>
      <OrderTable orders={rows} />
    </div>
  );
}
