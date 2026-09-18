import Link from "next/link";
import {
  IconUsers,
  IconReceipt2,
  IconCoin,
  IconMailbox,
  IconClock,
  IconHourglassHigh,
  IconCircleCheck,
} from "@tabler/icons-react";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [usersResult, orders, messagesResult, supportCounts] = await Promise.all([
    queryOne<{ count: string }>(`select count(*) as count from public.users`),
    query<{ status: string; amount: string; currency: string }>(
      `select status, amount, currency from public.orders`
    ),
    queryOne<{ count: string }>(
      `select count(*) as count from public.contact_messages where status = 'new'`
    ),
    query<{ status: string; count: string }>(
      `select status, count(*) as count from public.support_requests group by status`
    ),
  ]);

  const totalUsers = Number(usersResult?.count ?? 0);
  const completedOrders = orders.filter((order) => order.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.amount), 0);
  const currency = completedOrders[0]?.currency ?? "USD";

  const stats = [
    { label: "Total signups", value: String(totalUsers), icon: IconUsers },
    { label: "Completed orders", value: String(completedOrders.length), icon: IconReceipt2 },
    { label: "Total revenue", value: `${currency} ${totalRevenue.toFixed(2)}`, icon: IconCoin },
    { label: "New messages", value: String(messagesResult?.count ?? 0), icon: IconMailbox },
  ];

  const countFor = (status: string) =>
    Number(supportCounts.find((row) => row.status === status)?.count ?? 0);

  const supportStats = [
    { label: "Unclaimed", value: String(countFor("unclaimed")), icon: IconClock },
    { label: "Scheduled", value: String(countFor("scheduled")), icon: IconHourglassHigh },
    { label: "Support done", value: String(countFor("done")), icon: IconCircleCheck },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Overview</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Everyone who&apos;s signed up, bought, or gotten in touch.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-default bg-accent-dim text-accent">
                <Icon size={17} />
              </div>
              <div>
                <div className="font-mono text-xl text-text">{stat.value}</div>
                <div className="text-[12.5px] text-text-muted">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[14px] font-semibold text-text">Support requests</h2>
          <Link
            href="/admin/support-team"
            className="text-[12.5px] text-accent hover:opacity-80"
          >
            Manage support team →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {supportStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-default bg-accent-dim text-accent">
                  <Icon size={17} />
                </div>
                <div>
                  <div className="font-mono text-xl text-text">{stat.value}</div>
                  <div className="text-[12.5px] text-text-muted">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
