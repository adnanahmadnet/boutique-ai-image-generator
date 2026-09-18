import { getCurrentViewer } from "@/lib/get-current-viewer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The header needs to know the real, current auth state on every page (not
// just the dashboard) so it never shows "Login" for an already-signed-in
// visitor — that requires reading the session per-request, so this route
// group can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getCurrentViewer();

  return (
    <>
      <Header
        displayName={viewer.displayName}
        isLoggedIn={viewer.isLoggedIn}
        dashboardHref={viewer.dashboardHref}
        dashboardLabel={viewer.dashboardLabel}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
