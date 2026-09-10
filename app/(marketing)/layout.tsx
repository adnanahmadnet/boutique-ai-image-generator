import { getCurrentUser } from "@/lib/get-current-user";
import { getDisplayName } from "@/lib/user-display";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The header needs to know the real, current auth state on every page (not
// just the dashboard) so it never shows "Login" for an already-signed-in
// visitor — that requires reading the session per-request, so this route
// group can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // getCurrentUser() only ever resolves a buyer session — an admin session
  // lives on a separate cookie (see lib/get-current-admin.ts) and is never
  // reflected in the buyer-facing header.
  const user = await getCurrentUser();
  const displayName = user ? getDisplayName(user) : null;
  const isLoggedIn = Boolean(user);

  return (
    <>
      <Header displayName={displayName} isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
