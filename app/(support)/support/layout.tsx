import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/lib/db";
import { getCurrentSupportAgent } from "@/lib/get-current-support-agent";
import SupportNav from "@/components/support/SupportNav";
import Container from "@/components/Container";

// Reads across every buyer's support request — never statically prerender.
export const dynamic = "force-dynamic";

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-[13.5px] text-text-muted">
          Support isn&apos;t configured yet — the database isn&apos;t reachable.
        </p>
      </div>
    );
  }

  // Checks the support-agent session (public.support_sessions), a separate
  // table and cookie from both the admin and buyer sessions — see
  // db/migrations/0004_support_team.sql. Login is shared, but the session it
  // issues is not, and getCurrentSupportAgent() also requires is_active =
  // true, so a deactivated agent is bounced back to /login exactly like an
  // anonymous visitor.
  const agent = await getCurrentSupportAgent();

  if (!agent) {
    redirect("/login?redirectTo=/support");
  }

  return (
    <div className="min-h-screen">
      <SupportNav agentName={agent.full_name} />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
