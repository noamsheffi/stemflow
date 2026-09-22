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
      ON CONFLICT (anonymous_client_id, idempotency_key) DO NOTHING RETURNING feedback_id, submitted_at` as unknown as Array<{ feedback_id: string; submitted_at: string }>;
    if (rows.length === 0) return NextResponse.json({ duplicate: true }, { status: 200 });
    return NextResponse.json({ feedbackId: rows[0].feedback_id, submittedAt: rows[0].submitted_at }, { status: 201 });
  } catch (error) { console.error("Unable to store student slide feedback", error); return NextResponse.json({ error: "storage_unavailable" }, { status: 503 }); }
}
