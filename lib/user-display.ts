import type { User } from "@supabase/supabase-js";

// The display name set at signup (stored in Supabase's own user_metadata,
// no separate profiles-table round trip needed). Falls back to email for
// accounts created before the name field existed.
export function getDisplayName(user: Pick<User, "email" | "user_metadata"> | null | undefined): string {
  if (!user) return "";
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }
  return user.email ?? "";
}
