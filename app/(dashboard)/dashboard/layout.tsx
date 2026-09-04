import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin";
import { getDisplayName } from "@/lib/user-display";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Container from "@/components/Container";

// Every dashboard page reads the auth session and per-user data — never
// statically prerender this route group, both because it's inherently
// per-request and because build environments (like this one) may not have
// Supabase configured at all.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-[13.5px] text-text-muted">
          The buyer dashboard isn&apos;t configured yet — Supabase credentials are missing.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth alongside middleware.ts, which already redirects
  // unauthenticated requests to /dashboard/* before this layout renders.
  if (!user) {
    redirect("/login");
  }

  // Admins belong in /admin, not the buyer dashboard — send them there
  // even if they land on /dashboard directly (bookmark, stale link, etc.).
  if (isAdminEmail(user.email)) {
    redirect("/admin");
  }

  // RLS-scoped (contact_messages_select_own) — only ever counts this
  // user's own replied-but-unseen messages.
  const { count: unseenReplyCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .not("reply", "is", null)
    .is("reply_seen_at", null);

  return (
    <div className="min-h-screen">
      <DashboardNav displayName={getDisplayName(user)} unseenReplyCount={unseenReplyCount ?? 0} />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
