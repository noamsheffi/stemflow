import { NextResponse } from "next/server";
import { createLecturerSyncToken, isLecturerBasicAuth } from "../../../../lib/lecturer-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLecturerBasicAuth(request.headers.get("authorization"))) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Syllo Lecturer", charset="UTF-8"' } });
  try { return NextResponse.json({ token: createLecturerSyncToken(), expiresInSeconds: 28_800 }); }
  catch { return NextResponse.json({ error: "sync_unavailable" }, { status: 503 }); }
}
