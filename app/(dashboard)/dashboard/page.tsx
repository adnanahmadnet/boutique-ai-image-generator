import { redirect } from "next/navigation";

// The standalone Overview page was removed and merged into Resources
// (welcome message + license key now live there). Keep this route as a
// redirect so any existing "/dashboard" link still lands somewhere useful.
export default function DashboardIndexPage() {
  redirect("/dashboard/downloads");
}
