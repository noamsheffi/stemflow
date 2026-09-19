import { NextResponse } from "next/server";
import { getSql } from "../../../lib/db";
import { parseStudentLearningEvent } from "../../../lib/student-learning";
import { ensureLearningSchema } from "../../../lib/learning-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const event = parseStudentLearningEvent(body);
  if (!event) return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  try {
    await ensureLearningSchema();
    await getSql()`INSERT INTO student_lesson_events (anonymous_client_id, session_id, course_id, lesson_id, deck_version, event_type, slide_id, slide_number, active_duration_ms, occurred_at)
      VALUES (${event.anonymousClientId}, ${event.sessionId}, ${event.courseId}, ${event.lessonId}, ${event.deckVersion}, ${event.eventType}, ${event.slideId}, ${event.slideNumber}, ${event.activeDurationMs}, ${event.occurredAt})`;
    return NextResponse.json({ accepted: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "storage_unavailable" }, { status: 503 }); }
}
