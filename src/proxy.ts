import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("גישה למרצה בלבד", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Syllo Lecturer", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  const username = process.env.LECTURER_USERNAME;
  const password = process.env.LECTURER_PASSWORD;

  if (!username || !password) {
    return new NextResponse("הגישה טרם הוגדרה", { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

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

export const config = { matcher: "/lecturer/:path*" };
