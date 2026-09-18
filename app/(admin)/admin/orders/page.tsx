import Link from "next/link";
import { IconCircleCheck, IconCircleX, IconClock, IconReceiptRefund } from "@tabler/icons-react";
import { query } from "@/lib/db";

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

// Query-param-driven filters (no client JS needed): each link just
// re-navigates to this same page with a different combination of `paid`
// and `support` params, preserving whichever one isn't being changed.
function FilterPills({
  paramKey,
  current,
  otherParam,
  options,
}: {
  paramKey: "paid" | "support";
  current: string | undefined;
  otherParam: { key: "paid" | "support"; value: string | undefined };
  options: { value: string | undefined; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === current;
        const params = new URLSearchParams();
        if (option.value) params.set(paramKey, option.value);
        if (otherParam.value) params.set(otherParam.key, otherParam.value);
        const query = params.toString();
        const href = query ? `/admin/orders?${query}` : "/admin/orders";

        return (
          <Link
            key={option.label}
            href={href}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              isActive
                ? "border-accent/30 bg-accent-dim text-accent"
                : "border-border text-text-muted hover:border-border-hover hover:text-text"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; support?: string }>;
}) {
  const { paid, support } = await searchParams;

  const conditions: string[] = [];
  if (paid === "yes") conditions.push(`status = 'completed'`);
  else if (paid === "no") conditions.push(`status != 'completed'`);
  if (support === "yes") conditions.push(`includes_support = true`);
  else if (support === "no") conditions.push(`includes_support = false`);
  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const rows = await query<{
    id: string;
    buyer_email: string;
    boutique_name: string | null;
    amount: string;
    currency: string;
    status: Status;
    includes_support: boolean;
    created_at: string;
  }>(
    `select id, buyer_email, boutique_name, amount, currency, status, includes_support, created_at
     from public.orders
     ${whereClause}
     order by created_at desc`
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Orders</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">{rows.length} total, every buyer.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Paid
          </span>
          <FilterPills
            paramKey="paid"
            current={paid}
            otherParam={{ key: "support", value: support }}
            options={[
              { value: undefined, label: "All" },
              { value: "yes", label: "Paid" },
              { value: "no", label: "Not paid" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Support
          </span>
          <FilterPills
            paramKey="support"
            current={support}
            otherParam={{ key: "paid", value: paid }}
            options={[
              { value: undefined, label: "All" },
              { value: "yes", label: "Wants support" },
              { value: "no", label: "No support" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px] text-left text-[13px]">
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
                Support
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3 text-text">{order.buyer_email}</td>
                <td className="px-4 py-3 text-text-muted">{order.boutique_name || "—"}</td>
                <td className="px-4 py-3 font-mono text-text">
                  {order.currency} {order.amount}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  {order.includes_support ? (
                    <span className="rounded-full border border-accent/30 bg-accent-dim px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-accent">
                      Requested
                    </span>
                  ) : (
                    <span className="text-text-dim">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-muted">
                  No orders match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
