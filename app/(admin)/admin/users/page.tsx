import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await query<{
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
  }>(
    `select id, email, created_at, last_sign_in_at from public.users
     order by created_at desc`
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Users</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">{users.length} signed up.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead className="bg-surface-2 text-text-dim">
            <tr>
              <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide">
                Email
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
                <td className="px-4 py-3 text-text">{user.email}</td>
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
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
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
