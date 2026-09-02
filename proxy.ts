import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, so the Supabase session
     * cookie stays fresh across navigations without re-running on every image.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
