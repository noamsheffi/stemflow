import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, SESSION_SECONDS, accessScopeForPath, createAccessSession, safeReturnPath, validAccessCode } from "../../../../lib/access-session";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  let form: FormData;
  try { form = await request.formData(); } catch { return new NextResponse(null, { status: 400 }); }
  const next = safeReturnPath(form.get("next"));
  const scope = accessScopeForPath(next);
  const code = form.get("code");
  const login = new URL("/login", request.url);
  login.searchParams.set("next", next);
  if (typeof code !== "string" || code.length > 128 || !validAccessCode(code, scope)) {
    login.searchParams.set("error", "invalid");
    return NextResponse.redirect(login, 303);
  }
  let token: string;
  try { token = createAccessSession(scope); } catch {
    login.searchParams.set("error", "unavailable");
    return NextResponse.redirect(login, 303);
  }
  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(ACCESS_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
