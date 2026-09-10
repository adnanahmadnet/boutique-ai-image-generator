import { redirect } from "next/navigation";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/get-current-admin";
import AdminNav from "@/components/admin/AdminNav";
import Container from "@/components/Container";

// Every admin page reads across all users' data — never statically prerender.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-[13.5px] text-text-muted">
          Admin isn&apos;t configured yet — the database isn&apos;t reachable.
        </p>
      </div>
    );
  }

  // Checks the admin session (public.admin_sessions), which is a separate
  // table and cookie from a buyer's session — see
  // db/migrations/0003_separate_admin_table.sql. Login is shared, but the
  // session it issues is not: a logged-in buyer holds no admin session and
  // is sent back to /login, same as an anonymous visitor.
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login?redirectTo=/admin");
  }

  const newMessages = await queryOne<{ count: string }>(
    `select count(*) as count from public.contact_messages where status = 'new'`
  );

  return (
    <div className="min-h-screen">
      <AdminNav newMessageCount={Number(newMessages?.count ?? 0)} />
      <Container className="py-10">{children}</Container>
    </div>
  );
}
