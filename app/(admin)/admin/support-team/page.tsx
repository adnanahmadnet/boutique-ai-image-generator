import { query } from "@/lib/db";
import CreateSupportAgentForm from "@/components/admin/CreateSupportAgentForm";
import SupportAgentActiveToggle from "@/components/admin/SupportAgentActiveToggle";

export const dynamic = "force-dynamic";

type RequestStatus = "unclaimed" | "scheduled" | "done";

const STATUS_LABEL: Record<RequestStatus, string> = {
  unclaimed: "Unclaimed",
  scheduled: "Scheduled",
  done: "Support done",
};

export default async function AdminSupportTeamPage() {
  const [agents, requests] = await Promise.all([
    query<{
      id: string;
      email: string;
      full_name: string;
      is_active: boolean;
      created_at: string;
      last_sign_in_at: string | null;
    }>(
      `select id, email, full_name, is_active, created_at, last_sign_in_at
       from public.support_agents
       order by created_at desc`
    ),
    query<{
      id: string;
      buyer_email: string;
      buyer_phone: string | null;
      status: RequestStatus;
      scheduled_at: string | null;
      completed_at: string | null;
      agent_name: string | null;
      created_at: string;
    }>(
      `select
         sr.id,
         sr.buyer_email,
         p.phone as buyer_phone,
         sr.status,
         sr.scheduled_at,
         sr.completed_at,
         sa.full_name as agent_name,
         sr.created_at
       from public.support_requests sr
       left join public.profiles p on p.id = sr.buyer_id
       left join public.support_agents sa on sa.id = sr.assigned_agent_id
       order by
         case sr.status when 'unclaimed' then 0 when 'scheduled' then 1 else 2 end,
         sr.created_at desc`
    ),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Support team</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Create support accounts and see every support request across the team.
        </p>
      </div>

      <CreateSupportAgentForm />

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-[14px] font-semibold text-text">
          Team accounts ({agents.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="bg-surface-2 text-text-dim">
              <tr>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Last sign-in
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide" />
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text">{agent.full_name}</td>
                  <td className="px-4 py-3 text-text-muted">{agent.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide ${
                        agent.is_active
                          ? "border-success/30 bg-success-dim text-success"
                          : "border-border bg-surface-2 text-text-muted"
                      }`}
                    >
                      {agent.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {agent.last_sign_in_at
                      ? new Date(agent.last_sign_in_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SupportAgentActiveToggle agentId={agent.id} isActive={agent.is_active} />
                  </td>
                </tr>
              ))}
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                    No support accounts yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-[14px] font-semibold text-text">
          All support requests ({requests.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-surface-2 text-text-dim">
              <tr>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Buyer
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Phone
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Assigned to
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Scheduled
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text">{req.buyer_email}</td>
                  <td className="px-4 py-3 text-text-muted">{req.buyer_phone || "—"}</td>
                  <td className="px-4 py-3 text-text-muted">{STATUS_LABEL[req.status]}</td>
                  <td className="px-4 py-3 text-text-muted">{req.agent_name || "—"}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {req.scheduled_at ? new Date(req.scheduled_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {req.completed_at ? new Date(req.completed_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-muted">
                    No support requests yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
