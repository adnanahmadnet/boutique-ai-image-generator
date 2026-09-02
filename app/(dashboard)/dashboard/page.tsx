import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LicenseKeyCard from "@/components/dashboard/LicenseKeyCard";
import DownloadCard from "@/components/dashboard/DownloadCard";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS-scoped — only ever returns this user's own rows.
  const { data: latestOrder } = await supabase
    .from("orders")
    .select("id, created_at, amount, currency, status")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: license } = latestOrder
    ? await supabase.from("licenses").select("license_key").eq("order_id", latestOrder.id).maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Your license, latest download, and order history live here.
        </p>
      </div>

      {latestOrder && license ? (
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
          <LicenseKeyCard licenseKey={license.license_key as string} />
          <DownloadCard orderId={latestOrder.id as string} label="Toolkit download" />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-[13.5px] text-text-muted">
            No completed orders yet.{" "}
            <Link href="/pricing" className="text-accent hover:opacity-80">
              Get access
            </Link>{" "}
            to see your license and downloads here.
          </p>
        </div>
      )}
    </div>
  );
}
