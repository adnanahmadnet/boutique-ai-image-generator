import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ internal?: string }>;
}) {
  const { internal } = await searchParams;
  const showInternal = internal === "show";

  // Hidden by default — these are the admin's own (or a teammate's) test
  // accounts, marked via the "Mark as internal" toggle on a user's detail
  // page, not real customers. Still fully there in the DB, just not mixed
  // in with the customer list unless explicitly shown.
  const users = await query<{
    id: string;
    email: string;
    phone: string | null;
    is_internal: boolean;
    created_at: string;
    last_sign_in_at: string | null;
  }>(
    `select u.id, u.email, p.phone, u.is_internal, u.created_at, u.last_sign_in_at
     from public.users u
     left join public.profiles p on p.id = u.id
     ${showInternal ? "" : "where u.is_internal = false"}
     order by u.created_at desc`
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-text">Users</h1>
          <p className="mt-1 text-[13.5px] text-text-muted">{users.length} signed up.</p>
        </div>
        <Link
          href={showInternal ? "/admin/users" : "/admin/users?internal=show"}
          className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
            showInternal
              ? "border-accent/30 bg-accent-dim text-accent"
              : "border-border text-text-muted hover:border-border-hover hover:text-text"
          }`}
        >
          {showInternal ? "Showing internal accounts" : "Show internal accounts"}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead className="bg-surface-2 text-text-dim">
            <tr>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Phone
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Signed up
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Last sign-in
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3 text-text">
                  {user.email}
                  {user.is_internal ? (
                    <span className="ml-2 rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-dim">
                      Internal
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-text-muted">{user.phone || "—"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-1 rounded-default border border-border px-2.5 py-1.5 text-[12px] text-text-muted transition-colors hover:border-border-hover hover:text-text"
                  >
                    Details
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  No users yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
