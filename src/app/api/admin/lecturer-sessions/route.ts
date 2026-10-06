import { NextResponse } from "next/server";
import { getLecturerSessions } from "../../../../lib/lecturer-session-results";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await getLecturerSessions();
    return NextResponse.json({ sessions }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to load lecturer sessions for admin", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
