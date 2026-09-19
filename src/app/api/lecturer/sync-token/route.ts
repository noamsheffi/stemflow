import { NextResponse } from "next/server";
import { createLecturerSyncToken, isLecturerBasicAuth } from "../../../../lib/lecturer-auth";
import { extensionCorsHeaders } from "../../../../lib/extension-cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: extensionCorsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = extensionCorsHeaders(request);
  if (!isLecturerBasicAuth(request.headers.get("authorization"))) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { ...cors, "WWW-Authenticate": 'Basic realm="Syllo Lecturer", charset="UTF-8"' } });
  try { return NextResponse.json({ token: createLecturerSyncToken(), expiresInSeconds: 28_800 }, { headers: cors }); }
  catch { return NextResponse.json({ error: "sync_unavailable" }, { status: 503, headers: cors }); }
}
