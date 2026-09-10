import { NextResponse, type NextRequest } from "next/server";

// Buyers and admins are two entirely separate identities with their own
// session cookies (see lib/auth/session.ts and lib/auth/admin-session.ts) —
// each protected area is gated on its own cookie, never the other's.
const SESSION_COOKIE_NAME = "session_token";
const ADMIN_SESSION_COOKIE_NAME = "admin_session_token";

// Cheap, DB-free early redirect for UX (this runs on the Edge runtime, which
// can't reach Postgres directly). It only checks whether the relevant
// session cookie is present — the actual session is validated against the
// database in dashboard/layout.tsx and admin/(protected)/layout.tsx, which
// is the real authentication boundary (defense in depth, not the only check).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin and buyer share one login form, but not one session: /admin is
  // gated on the admin cookie specifically, so a signed-in buyer visiting
  // /admin is bounced back to /login exactly like a signed-out visitor.
  if (pathname.startsWith("/admin")) {
    if (!request.cookies.get(ADMIN_SESSION_COOKIE_NAME)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !request.cookies.get(SESSION_COOKIE_NAME)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
