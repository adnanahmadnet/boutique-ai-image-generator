import { redirect } from "next/navigation";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import { getDisplayName } from "@/lib/user-display";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Container from "@/components/Container";

// Every dashboard page reads the auth session and per-user data — never
// statically prerender this route group, both because it's inherently
// per-request and because build environments (like this one) may not have
// the database configured at all.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-[13.5px] text-text-muted">
          The buyer dashboard isn&apos;t configured yet — the database isn&apos;t reachable.
        </p>
      </div>
    );
  }

  const user = await getCurrentUser();

  // Defense in depth alongside proxy.ts, which already redirects
  // unauthenticated requests to /dashboard/* before this layout renders.
  // Admins are a completely separate identity (public.admins, its own
  // session cookie) and can never resolve here — no admin branch needed.
  if (!user) {
    redirect("/login");
  }

  const unseenReply = await queryOne<{ count: string }>(
    `select count(*) as count from public.contact_messages
     where buyer_id = $1 and reply is not null and reply_seen_at is null`,
    [user.id]
  );

  return (
    <div className="min-h-screen">
      <DashboardNav
        displayName={getDisplayName(user)}
        unseenReplyCount={Number(unseenReply?.count ?? 0)}
      />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
