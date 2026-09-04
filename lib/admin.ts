// Admin access is granted by email allow-list, not a DB flag — simplest thing
// that works for a small team and can't be tampered with from the client.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}
