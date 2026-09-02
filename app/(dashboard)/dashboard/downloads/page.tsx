import { createClient } from "@/lib/supabase/server";
import DownloadCard from "@/components/dashboard/DownloadCard";

export default async function DashboardDownloadsPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, currency, amount")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Downloads</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Each link is freshly issued and expires in 30 minutes — get a new one any time.
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <DownloadCard
              key={order.id as string}
              orderId={order.id as string}
              label={`Purchased ${new Date(order.created_at as string).toLocaleDateString()} — ${order.currency} ${order.amount}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-[13.5px] text-text-muted">No completed orders yet.</p>
      )}
    </div>
  );
}
