import { SITE } from "@/data/site";

// PLACEHOLDER legal details — confirm real values before launch (plan §14:
// support email, refund window, and entity/product naming are still open).
export const LEGAL = {
  entityName: SITE.builtBy,
  supportEmail: "support@example.com", // TODO: confirm real support email
  refundWindowDays: 14, // TODO: confirm real refund window
  lastUpdated: "September 2026",
} as const;
