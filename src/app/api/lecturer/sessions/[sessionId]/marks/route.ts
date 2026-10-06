import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, validAccessSession } from "../../../../../../lib/access-session";
import { getSql } from "../../../../../../lib/db";
import { ensureLecturerSessionSchema } from "../../../../../../lib/learning-schema";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const marks = ["PASS", "HARD", "DEEPEN", "REVISIT"] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!validAccessSession(access, "lecturer")) return NextResponse.json({ error: "authentication_required" }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const { sessionId } = await params;
  if (!uuid.test(sessionId)) return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (typeof input.slideNumber !== "number" || !Number.isInteger(input.slideNumber) || input.slideNumber < 1 || input.slideNumber > 500) return NextResponse.json({ error: "invalid_slide" }, { status: 400 });
  const mark = input.mark === null ? null : marks.includes(input.mark as (typeof marks)[number]) ? input.mark as (typeof marks)[number] : undefined;
  if (mark === undefined) return NextResponse.json({ error: "invalid_mark" }, { status: 400 });

  try {
    await ensureLecturerSessionSchema();
    const rows = await getSql()`
      WITH target AS MATERIALIZED (
        SELECT o.id
        FROM lecturer_slide_observations o
        INNER JOIN lecturer_sessions s ON s.id = o.lecturer_session_id
        WHERE s.session_id = ${sessionId} AND o.slide_number = ${input.slideNumber}
      ), removed AS (
        DELETE FROM lecturer_annotation_events
        WHERE lecturer_slide_observation_id IN (SELECT id FROM target)
      ), saved AS (
        INSERT INTO lecturer_annotation_events (lecturer_slide_observation_id, annotation_type, annotation_timestamp)
        SELECT id, ${mark}, NOW() FROM target WHERE ${mark} IS NOT NULL
        RETURNING annotation_type
      )
      SELECT EXISTS (SELECT 1 FROM target) AS found, (SELECT annotation_type FROM saved LIMIT 1) AS mark
    ` as unknown as Array<{ found: boolean; mark: string | null }>;
    if (!rows[0]?.found) return NextResponse.json({ error: "slide_not_found" }, { status: 404 });
    return NextResponse.json({ slideNumber: input.slideNumber, mark: rows[0].mark }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to update lecturer slide mark", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
