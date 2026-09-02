import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

  return (
    <div className="min-h-screen">
      <DashboardNav email={user.email ?? ""} />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
