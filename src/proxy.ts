import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, accessScopeForPath, validAccessSession } from "./lib/access-session";

function unauthorized() {
  return new NextResponse("גישה למרצה בלבד", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Syllo Lecturer", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessScope = accessScopeForPath(pathname);
  if (!validAccessSession(request.cookies.get(ACCESS_COOKIE)?.value, accessScope)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    const response = NextResponse.redirect(login);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const requiresLecturerAuth = pathname.startsWith("/lecturer");
  if (!requiresLecturerAuth) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  const username = process.env.LECTURER_USERNAME;
  const password = process.env.LECTURER_PASSWORD;

  if (!username || !password) {
    return new NextResponse("הגישה טרם הוגדרה", { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "lecturer_authentication_required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    return unauthorized();
  }

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();

    const suppliedUsername = decoded.slice(0, separator);
    const suppliedPassword = decoded.slice(separator + 1);
    if (suppliedUsername !== username || suppliedPassword !== password) return unauthorized();
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = { matcher: [
  "/workspace/:path*", "/course/:path*", "/courses/:path*", "/lessons/:path*",
  "/formulas/:path*", "/concepts/:path*", "/slide-friction/:path*", "/lecturer/:path*",
  "/survey/:path*", "/admin/:path*", "/api/admin/:path*", "/api/submissions/:path*",
  "/api/learning-events/:path*", "/api/student/:path*",
] };
