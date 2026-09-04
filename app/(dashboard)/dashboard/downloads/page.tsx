import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/user-display";
import DownloadCard from "@/components/dashboard/DownloadCard";
import LicenseKeyCard from "@/components/dashboard/LicenseKeyCard";
import PipelineDiagram from "@/components/dashboard/PipelineDiagram";
import ResourceList from "@/components/dashboard/ResourceList";

export default async function DashboardDownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = getDisplayName(user);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, currency, amount")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const unlocked = Boolean(orders && orders.length > 0);
  const latestOrder = orders?.[0];

  const { data: license } = latestOrder
    ? await supabase
        .from("licenses")
        .select("license_key")
        .eq("order_id", latestOrder.id)
        .maybeSingle()
    : { data: null };

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
          <LicenseKeyCard licenseKey={license.license_key as string} />
        </div>
      ) : null}

      <PipelineDiagram />

      {unlocked && orders ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <DownloadCard
              key={order.id as string}
              orderId={order.id as string}
              label={`Purchased ${new Date(order.created_at as string).toLocaleDateString()} — ${order.currency} ${order.amount}`}
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
