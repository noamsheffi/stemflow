import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "../../../../lib/access-session";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
