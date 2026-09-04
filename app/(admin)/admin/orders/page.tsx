import { IconCircleCheck, IconCircleX, IconClock, IconReceiptRefund } from "@tabler/icons-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Status = "pending" | "completed" | "refunded" | "failed";

const STATUS_STYLES: Record<Status, { label: string; className: string; icon: typeof IconClock }> = {
  pending: { label: "Pending", className: "text-accent bg-accent-dim border-accent/30", icon: IconClock },
  completed: {
    label: "Completed",
    className: "text-success bg-success-dim border-success/30",
    icon: IconCircleCheck,
  },
  failed: { label: "Failed", className: "text-danger bg-danger-dim border-danger/30", icon: IconCircleX },
  refunded: {
    label: "Refunded",
    className: "text-text-muted bg-surface-2 border-border",
    icon: IconReceiptRefund,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_STYLES[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, buyer_email, boutique_name, amount, currency, status, created_at")
    .order("created_at", { ascending: false });

  const rows = orders ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Orders</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">{rows.length} total, every buyer.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[700px] text-left text-[13px]">
          <thead className="bg-surface-2 text-text-dim">
            <tr>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Buyer
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Boutique
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id as string} className="border-t border-border">
                <td className="px-4 py-3 text-text">{order.buyer_email as string}</td>
                <td className="px-4 py-3 text-text-muted">
                  {(order.boutique_name as string | null) || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-text">
                  {order.currency as string} {order.amount as string}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status as Status} />
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(order.created_at as string).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
