import { cache } from "react";
import { getCurrentUser } from "@/lib/get-current-user";
import { getCurrentAdmin } from "@/lib/get-current-admin";
import { getCurrentSupportAgent } from "@/lib/get-current-support-agent";
import { getDisplayName } from "@/lib/user-display";

export interface CurrentViewer {
  isLoggedIn: boolean;
  displayName: string | null;
  dashboardHref: string;
  dashboardLabel: string;
}

// Resolves whichever of the three sessions (admin, support agent, buyer) is
// actually active for this request, checked in that order (most-privileged
// first). Public marketing pages should use this instead of getCurrentUser()
// alone — otherwise a signed-in admin or support agent (e.g. clicking the
// logo/Home link from their own dashboard) appears logged out here just
// because they aren't a buyer, even though their real session is untouched.
// Memoized per-request, so calling this from both the layout and a page
// costs one round of lookups, not two.
export const getCurrentViewer = cache(async (): Promise<CurrentViewer> => {
  const [admin, agent, user] = await Promise.all([
    getCurrentAdmin(),
    getCurrentSupportAgent(),
    getCurrentUser(),
  ]);

  if (admin) {
    return {
      isLoggedIn: true,
      displayName: admin.full_name || admin.email,
      dashboardHref: "/admin",
      dashboardLabel: "Admin",
    };
  }

  if (agent) {
    return {
      isLoggedIn: true,
      displayName: agent.full_name,
      dashboardHref: "/support",
      dashboardLabel: "Support",
    };
  }

  if (user) {
    return {
      isLoggedIn: true,
      displayName: getDisplayName(user),
      dashboardHref: "/dashboard/downloads",
      dashboardLabel: "Dashboard",
    };
  }

  return {
    isLoggedIn: false,
    displayName: null,
    dashboardHref: "/dashboard/downloads",
    dashboardLabel: "Dashboard",
  };
});
