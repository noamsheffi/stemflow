import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, accessScopeForPath, validAccessSession } from "./lib/access-session";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessScope = accessScopeForPath(pathname);
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!validAccessSession(accessToken, accessScope)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    const response = NextResponse.redirect(login);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: [
  "/workspace/:path*", "/course/:path*", "/courses/:path*", "/lessons/:path*",
  "/formulas/:path*", "/concepts/:path*", "/slide-friction/:path*", "/lecturer/:path*",
  "/survey/:path*", "/admin/:path*", "/api/admin/:path*", "/api/submissions/:path*",
  "/api/learning-events/:path*", "/api/student/:path*", "/api/midterm-practice/:path*",
] };
