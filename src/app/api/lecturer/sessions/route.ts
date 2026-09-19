import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";
import { hasValidLecturerSyncToken } from "../../../../lib/lecturer-auth";
import { parseLecturerSession } from "../../../../lib/lecturer-session";
import { extensionCorsHeaders } from "../../../../lib/extension-cors";
import { ensureLecturerSessionSchema } from "../../../../lib/learning-schema";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: extensionCorsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = extensionCorsHeaders(request);
  if (!hasValidLecturerSyncToken(request.headers.get("authorization"))) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cors });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: cors }); }
  const session = parseLecturerSession(body);
  if (!session) return NextResponse.json({ error: "invalid_session" }, { status: 400, headers: cors });
  try {
    await ensureLecturerSessionSchema();
    const sql = getSql();
    const existing = await sql`SELECT id FROM lecturer_sessions WHERE session_id = ${session.sessionId}` as unknown as Array<{ id: string }>;
    const rows = await sql`
      INSERT INTO lecturer_sessions (session_id, workspace_id, course_id, lesson_id, deck_version, started_at, ended_at, total_duration_ms)
      VALUES (${session.sessionId}, ${session.workspaceId}, ${session.courseId}, ${session.lessonId}, ${session.deckVersion}, ${session.startedAt}, ${session.endedAt}, ${session.slides.reduce((total, slide) => total + slide.actualActiveDurationMs, 0)})
      ON CONFLICT (session_id) DO UPDATE SET workspace_id = EXCLUDED.workspace_id, course_id = EXCLUDED.course_id, lesson_id = EXCLUDED.lesson_id, deck_version = EXCLUDED.deck_version, started_at = EXCLUDED.started_at, ended_at = EXCLUDED.ended_at, total_duration_ms = EXCLUDED.total_duration_ms, updated_at = NOW()
      RETURNING id
    ` as unknown as Array<{ id: string }>;
    const sessionDbId = rows[0].id;
    await sql`DELETE FROM lecturer_slide_observations WHERE lecturer_session_id = ${sessionDbId}`;
    for (const slide of session.slides) {
      const observations = await sql`
        INSERT INTO lecturer_slide_observations (lecturer_session_id, slide_id, id_source, slide_number, planned_duration_minutes, actual_active_duration_ms)
        VALUES (${sessionDbId}, ${slide.slideId}, ${slide.idSource}, ${slide.slideNumber}, ${slide.plannedDurationMinutes}, ${slide.actualActiveDurationMs})
        RETURNING id
      ` as unknown as Array<{ id: string }>;
      for (const annotation of slide.annotations) await sql`
        INSERT INTO lecturer_annotation_events (lecturer_slide_observation_id, annotation_type, annotation_timestamp)
        VALUES (${observations[0].id}, ${annotation.type}, ${annotation.timestamp})
      `;
    }
    return NextResponse.json({ sessionId: session.sessionId, syncedAt: new Date().toISOString() }, { status: existing.length ? 200 : 201, headers: cors });
  } catch (error) {
    console.error("Unable to store lecturer session", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 500, headers: cors });
  }
}
