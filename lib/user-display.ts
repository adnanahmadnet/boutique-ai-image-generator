import type { SessionUser } from "@/lib/get-current-user";

export function getDisplayName(user: Pick<SessionUser, "email" | "full_name"> | null | undefined): string {
  if (!user) return "";
  if (user.full_name && user.full_name.trim()) {
    return user.full_name.trim();
  }
  return user.email ?? "";
}
