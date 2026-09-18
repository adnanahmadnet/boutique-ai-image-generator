import Link from "next/link";
import { IconCircleCheck, IconClock, IconHourglassHigh, IconPhone } from "@tabler/icons-react";
import { query } from "@/lib/db";
import { getCurrentSupportAgent } from "@/lib/get-current-support-agent";
import ClaimForm from "@/components/support/ClaimForm";
import CompleteRequestControls from "@/components/support/CompleteRequestControls";

type Status = "unclaimed" | "scheduled" | "done";

interface RequestRow {
  id: string;
  status: Status;
  buyer_email: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_boutique: string | null;
  amount: string;
  currency: string;
  order_created_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  agent_id: string | null;
  agent_name: string | null;
}

const STATUS_STYLES: Record<Status, { label: string; className: string; icon: typeof IconClock }> = {
  unclaimed: {
    label: "Unclaimed",
    className: "text-accent bg-accent-dim border-accent/30",
    icon: IconClock,
  },
  scheduled: {
    label: "Scheduled",
    className: "text-accent bg-accent-dim border-accent/30",
    icon: IconHourglassHigh,
  },
  done: {
    label: "Support done",
    className: "text-success bg-success-dim border-success/30",
    icon: IconCircleCheck,
  },
};

function StatusBadge({ status }: { status: Status }) {
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

const FILTERS: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "scheduled", label: "Scheduled" },
  { value: "done", label: "Done" },
];

export default async function SupportRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const agent = await getCurrentSupportAgent();
  const { status } = await searchParams;

  const activeStatus = status && ["unclaimed", "scheduled", "done"].includes(status)
    ? (status as Status)
    : undefined;

  const rows = await query<RequestRow>(
    `select
       sr.id,
       sr.status,
       sr.buyer_email,
       u.full_name as buyer_name,
       p.phone as buyer_phone,
       p.boutique_name as buyer_boutique,
       o.amount,
       o.currency,
       o.created_at as order_created_at,
       sr.scheduled_at,
       sr.completed_at,
       sr.notes,
       sa.id as agent_id,
       sa.full_name as agent_name
     from public.support_requests sr
     join public.orders o on o.id = sr.order_id
     left join public.users u on u.id = sr.buyer_id
     left join public.profiles p on p.id = sr.buyer_id
     left join public.support_agents sa on sa.id = sr.assigned_agent_id
     ${activeStatus ? "where sr.status = $1" : ""}
     order by
       case sr.status when 'unclaimed' then 0 when 'scheduled' then 1 else 2 end,
       sr.created_at desc`,
    activeStatus ? [activeStatus] : []
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Support requests</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Everyone who bought the support add-on, across the whole team.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === activeStatus || (!filter.value && !activeStatus);
          const href = filter.value ? `/support?status=${filter.value}` : "/support";
          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                isActive
                  ? "border-accent/30 bg-accent-dim text-accent"
                  : "border-border text-text-muted hover:border-border-hover hover:text-text"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const isMine = row.agent_id === agent?.id;

          return (
            <div
              key={row.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-[15px] font-semibold text-text">
                    {row.buyer_name || row.buyer_email}
                    {row.buyer_boutique ? (
                      <span className="ml-2 font-mono text-[11px] font-normal text-text-dim">
                        {row.buyer_boutique}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-text-dim">
                    {row.buyer_email} · Purchased{" "}
                    {new Date(row.order_created_at).toLocaleDateString()} · {row.currency}{" "}
                    {row.amount}
                  </p>
                  {row.buyer_phone ? (
                    <a
                      href={`tel:${row.buyer_phone}`}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:opacity-80"
                    >
                      <IconPhone size={14} />
                      {row.buyer_phone}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-[12px] text-text-dim">No phone on file</p>
                  )}
                </div>
                <StatusBadge status={row.status} />
              </div>

              {row.status === "unclaimed" ? <ClaimForm requestId={row.id} /> : null}

              {row.status === "scheduled" ? (
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <p className="text-[13px] text-text-muted">
                    Scheduled for{" "}
                    <span className="text-text">
                      {row.scheduled_at
                        ? new Date(row.scheduled_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </span>{" "}
                    by <span className="text-text">{isMine ? "you" : row.agent_name}</span>
                  </p>
                  {isMine ? (
                    <CompleteRequestControls requestId={row.id} />
                  ) : (
                    <p className="text-[12.5px] text-text-dim">
                      Assigned to {row.agent_name} — not yours to close.
                    </p>
                  )}
                </div>
              ) : null}

              {row.status === "done" ? (
                <div className="flex flex-col gap-1 border-t border-border pt-4 text-[13px]">
                  <p className="text-text-muted">
                    Closed by <span className="text-text">{row.agent_name}</span> on{" "}
                    <span className="text-text">
                      {row.completed_at ? new Date(row.completed_at).toLocaleDateString() : "—"}
                    </span>
                  </p>
                  {row.notes ? <p className="text-text-dim">&quot;{row.notes}&quot;</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-[13.5px] text-text-muted">Nothing here.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
