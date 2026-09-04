import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";
import Container from "@/components/Container";

// Every admin page reads across all users' data — never statically prerender.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-[13.5px] text-text-muted">
          Admin isn&apos;t configured yet — Supabase credentials are missing.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  // Not an admin: quietly send them to their own dashboard rather than
  // revealing that an /admin area exists via an explicit "forbidden" page.
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard/downloads");
  }

  const admin = createAdminClient();
  const { count: newMessageCount } = await admin
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="min-h-screen">
      <AdminNav newMessageCount={newMessageCount ?? 0} />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
