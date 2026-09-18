import Link from "next/link";
import {
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconReceiptRefund,
  IconArrowRight,
} from "@tabler/icons-react";

export interface OrderRow {
  id: string;
  createdAt: string;
  amount: string;
  currency: string;
  status: "pending" | "completed" | "refunded" | "failed";
  includesSupport: boolean;
}

const STATUS_STYLES: Record<
  OrderRow["status"],
  { label: string; className: string; icon: typeof IconClock }
> = {
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

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  const config = STATUS_STYLES[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// One card per order, showing what was actually bought rather than a table
// of columns — this is a one-time-purchase product, so almost every buyer
// only ever has a single row here. Still renders correctly if more than one
// exists (e.g. a failed attempt before a successful one).
function OrderCard({ order }: { order: OrderRow }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-[15px] font-semibold text-text">
            PixelCore Engine — Full Package
          </h3>
          <p className="mt-1 text-[12.5px] text-text-dim">
            Purchased {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-text-muted">Amount paid</span>
          <span className="font-mono text-text">
            {order.currency} {order.amount}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-text-muted">Setup & customization support</span>
          <span className="text-text">{order.includesSupport ? "Included" : "Not included"}</span>
        </div>
      </div>

      {order.status === "completed" ? (
        <Link
          href="/dashboard/downloads"
          className="inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-accent hover:opacity-80"
        >
          Go to your downloads
          <IconArrowRight size={14} />
        </Link>
      ) : null}
    </div>
  );
}

export default function OrderDetail({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-[13.5px] text-text-muted">
          You haven&apos;t purchased yet —{" "}
          <Link href="/pricing" className="text-accent hover:opacity-80">
            get access here
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
