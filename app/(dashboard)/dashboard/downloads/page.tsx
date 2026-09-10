import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { getDisplayName } from "@/lib/user-display";
import DownloadCard from "@/components/dashboard/DownloadCard";
import LicenseKeyCard from "@/components/dashboard/LicenseKeyCard";
import PipelineDiagram from "@/components/dashboard/PipelineDiagram";
import ResourceList from "@/components/dashboard/ResourceList";

export default async function DashboardDownloadsPage() {
  const user = await getCurrentUser();
  const displayName = getDisplayName(user);

  const orders = user
    ? await query<{ id: string; created_at: string; currency: string; amount: string }>(
        `select id, created_at, currency, amount from public.orders
         where buyer_id = $1 and status = 'completed'
         order by created_at desc`,
        [user.id]
      )
    : [];

  const unlocked = orders.length > 0;
  const latestOrder = orders[0];

  const license = latestOrder
    ? await queryOne<{ license_key: string }>(
        `select license_key from public.licenses where order_id = $1`,
        [latestOrder.id]
      )
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          {unlocked
            ? "Your license, resources, and setup steps live here."
            : "Here's exactly what you get and how to set it up. Files unlock once your order is complete."}
        </p>
      </div>

      {!unlocked ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-accent/30 bg-accent-dim px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13.5px] text-text">
            You haven&apos;t completed a purchase yet — resources below are locked.
          </p>
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Get Access
            <IconArrowRight size={15} />
          </Link>
        </div>
      ) : null}

      {license ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <LicenseKeyCard licenseKey={license.license_key} />
        </div>
      ) : null}

      <PipelineDiagram />

      {unlocked && orders ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <DownloadCard
              key={order.id}
              orderId={order.id}
              label={`Purchased ${new Date(order.created_at).toLocaleDateString()} — ${order.currency} ${order.amount}`}
            />
          ))}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 font-heading text-[15px] font-semibold text-text">
          What&apos;s in the package
        </h2>
        <ResourceList unlocked={unlocked} />
      </div>
    </div>
  );
}
