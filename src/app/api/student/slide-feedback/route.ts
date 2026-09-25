import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";
import { parseSlideFeedback } from "../../../../lib/slide-feedback";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const submission = parseSlideFeedback(body);
  if (!submission) return NextResponse.json({ error: "invalid_submission" }, { status: 400 });
  try {
    const rows = await getSql()`INSERT INTO student_slide_feedback (anonymous_client_id, course_id, lesson_id, slide_id, slide_number, deck_version, feedback_type, optional_comment, submitted_at, page_url, idempotency_key)
      VALUES (${submission.anonymousClientId}, ${submission.courseId}, ${submission.lessonId}, ${submission.slideId}, ${submission.slideNumber}, ${submission.deckVersion}, ${submission.feedbackType}, ${submission.optionalComment}, ${submission.submittedAt}, ${submission.pageUrl}, ${submission.idempotencyKey})
      ON CONFLICT (anonymous_client_id, idempotency_key) DO UPDATE SET
        feedback_type = EXCLUDED.feedback_type,
        optional_comment = EXCLUDED.optional_comment,
        submitted_at = EXCLUDED.submitted_at,
        page_url = EXCLUDED.page_url
      RETURNING feedback_id, submitted_at` as unknown as Array<{ feedback_id: string; submitted_at: string }>;
    return NextResponse.json({ feedbackId: rows[0].feedback_id, submittedAt: rows[0].submitted_at }, { status: 201 });
  } catch (error) { console.error("Unable to store student slide feedback", error); return NextResponse.json({ error: "storage_unavailable" }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const input = body as Record<string, unknown>;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof input.anonymousClientId !== "string" || !uuidPattern.test(input.anonymousClientId) || input.courseId !== "communication-systems" || input.lessonId !== "lesson-04" || typeof input.slideId !== "string" || !/^lesson-04-am-\d{2}$/.test(input.slideId)) return NextResponse.json({ error: "invalid_submission" }, { status: 400 });
  try {
    await getSql()`DELETE FROM student_slide_feedback WHERE anonymous_client_id = ${input.anonymousClientId} AND course_id = ${input.courseId} AND lesson_id = ${input.lessonId} AND slide_id = ${input.slideId}`;
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) { console.error("Unable to delete student slide feedback", error); return NextResponse.json({ error: "storage_unavailable" }, { status: 503 }); }
}
