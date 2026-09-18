import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconCircleCheck, IconCircleX, IconClock, IconReceiptRefund } from "@tabler/icons-react";
import { query, queryOne } from "@/lib/db";
import { getDisplayName } from "@/lib/user-display";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import InternalAccountToggle from "@/components/admin/InternalAccountToggle";

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">{label}</span>
      <span className="text-[13.5px] text-text">{value}</span>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await queryOne<{
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    boutique_name: string | null;
    is_internal: boolean;
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
  }>(
    `select u.id, u.email, u.full_name, p.phone, p.boutique_name, u.is_internal,
            u.created_at, u.last_sign_in_at, u.email_confirmed_at
     from public.users u
     left join public.profiles p on p.id = u.id
     where u.id = $1`,
    [id]
  );

  if (!user) {
    notFound();
  }

  const orders = await query<{
    id: string;
    buyer_email: string;
    boutique_name: string | null;
    amount: string;
    currency: string;
    status: Status;
    created_at: string;
  }>(
    `select id, buyer_email, boutique_name, amount, currency, status, created_at
     from public.orders
     where buyer_id = $1 or buyer_email = $2
     order by created_at desc`,
    [user.id, user.email]
  );

  const orderIds = orders.map((order) => order.id);

  const licenses =
    orderIds.length > 0
      ? await query<{ license_key: string; order_id: string; status: string; issued_at: string }>(
          `select license_key, order_id, status, issued_at from public.licenses
           where order_id = any($1::uuid[])`,
          [orderIds]
        )
      : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text"
          >
            <IconArrowLeft size={14} />
            Back to users
          </Link>
          <h1 className="mt-3 font-heading text-xl font-bold text-text">{getDisplayName(user)}</h1>
          <p className="mt-1 text-[13.5px] text-text-muted">All information for this account.</p>
        </div>
        <div className="flex items-center gap-2">
          <InternalAccountToggle userId={user.id} isInternal={user.is_internal} />
          <DeleteUserButton userId={user.id} email={user.email ?? ""} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <InfoRow label="Name" value={user.full_name || "—"} />
        <InfoRow label="Email" value={user.email ?? "—"} />
        <InfoRow label="Phone" value={user.phone || "—"} />
        <InfoRow label="Boutique" value={user.boutique_name || "—"} />
        <InfoRow label="User ID" value={user.id} />
        <InfoRow label="Signed up" value={new Date(user.created_at).toLocaleString()} />
        <InfoRow
          label="Last sign-in"
          value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
        />
        <InfoRow label="Email confirmed" value={user.email_confirmed_at ? "Yes" : "No"} />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-[15px] font-semibold text-text">
          Orders ({orders.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="bg-surface-2 text-text-dim">
              <tr>
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
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-muted">{order.boutique_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-text">
                    {order.currency} {order.amount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                    No orders.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-[15px] font-semibold text-text">
          Licenses ({licenses.length})
        </h2>
        <div className="flex flex-col gap-2">
          {licenses.map((license) => (
            <div
              key={license.license_key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="font-mono text-[13px] text-accent">{license.license_key}</span>
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
                {license.status}
              </span>
            </div>
          ))}
          {licenses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-[13.5px] text-text-muted">
              No licenses.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
