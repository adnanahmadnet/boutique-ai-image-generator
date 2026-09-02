import { createClient } from "@/lib/supabase/server";
import OrderTable, { type OrderRow } from "@/components/dashboard/OrderTable";

export default async function DashboardOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, amount, currency, status")
    .order("created_at", { ascending: false });

  const rows: OrderRow[] = (orders ?? []).map((order) => ({
    id: order.id as string,
    createdAt: order.created_at as string,
    amount: order.amount as string,
    currency: order.currency as string,
    status: order.status as OrderRow["status"],
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
