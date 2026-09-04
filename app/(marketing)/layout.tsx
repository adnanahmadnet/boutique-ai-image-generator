import { getCurrentUser } from "@/lib/get-current-user";
import { getDisplayName } from "@/lib/user-display";
import { isAdminEmail } from "@/lib/admin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The header needs to know the real, current auth state on every page (not
// just the dashboard) so it never shows "Login" for an already-signed-in
// visitor — that requires reading the session per-request, so this route
// group can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Admins never show identifying text in the site-wide header — the header
  // just gives them a Dashboard/Logout affordance, same as everywhere else.
  const displayName = user && !isAdminEmail(user.email) ? getDisplayName(user) : null;
  const isLoggedIn = Boolean(user);

  return (
    <>
      <Header displayName={displayName} isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
