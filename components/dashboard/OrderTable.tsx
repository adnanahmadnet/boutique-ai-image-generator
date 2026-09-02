import { IconCircleCheck, IconCircleX, IconClock, IconReceiptRefund } from "@tabler/icons-react";

export interface OrderRow {
  id: string;
  createdAt: string;
  amount: string;
  currency: string;
  status: "pending" | "completed" | "refunded" | "failed";
}

const STATUS_STYLES: Record<OrderRow["status"], { label: string; className: string; icon: typeof IconClock }> = {
  pending: { label: "Pending", className: "text-accent bg-accent-dim border-accent/30", icon: IconClock },
  completed: { label: "Completed", className: "text-success bg-success-dim border-success/30", icon: IconCircleCheck },
  failed: { label: "Failed", className: "text-danger bg-danger-dim border-danger/30", icon: IconCircleX },
  refunded: { label: "Refunded", className: "text-text-muted bg-surface-2 border-border", icon: IconReceiptRefund },
};

function StatusBadge({ status }: { status: OrderRow["status"] }) {
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

export default function OrderTable({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return <p className="text-[13.5px] text-text-muted">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[420px] text-left text-[13px]">
        <thead className="bg-surface-2 text-text-dim">
          <tr>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
              Date
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
              Amount
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-border">
              <td className="px-4 py-3 text-text-muted">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-mono text-text">
                {order.currency} {order.amount}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
