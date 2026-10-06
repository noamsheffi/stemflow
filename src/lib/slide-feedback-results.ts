import "server-only";
import { getSql } from "./db";

export type SlideFeedbackSummary = {
  slideId: string;
  slideNumber: number;
  feedbackType: string;
  responses: number;
};

export type SlideFeedbackComment = {
  slideNumber: number;
  feedbackType: string;
  comment: string;
  submittedAt: string;
};

export async function getSlideFeedbackForSession(session: { courseId: string; lessonId: string; startedAt: string; endedAt: string | null }) {
  if (!session.endedAt) return { totalResponses: 0, bySlide: [] as SlideFeedbackSummary[], comments: [] as SlideFeedbackComment[] };
  const sql = getSql();
  const [summaries, comments] = await Promise.all([
    sql`
      SELECT slide_id AS "slideId", slide_number AS "slideNumber", feedback_type AS "feedbackType", COUNT(*)::int AS responses
      FROM student_slide_feedback
      WHERE course_id = ${session.courseId} AND lesson_id = ${session.lessonId}
        AND submitted_at >= ${session.startedAt} AND submitted_at <= ${session.endedAt}
      GROUP BY slide_id, slide_number, feedback_type
      ORDER BY slide_number, feedback_type
    ` as unknown as Promise<SlideFeedbackSummary[]>,
    sql`
      SELECT slide_number AS "slideNumber", feedback_type AS "feedbackType", optional_comment AS comment, submitted_at AS "submittedAt"
      FROM student_slide_feedback
      WHERE course_id = ${session.courseId} AND lesson_id = ${session.lessonId}
        AND submitted_at >= ${session.startedAt} AND submitted_at <= ${session.endedAt}
        AND optional_comment <> ''
      ORDER BY submitted_at DESC
      LIMIT 100
    ` as unknown as Promise<SlideFeedbackComment[]>,
  ]);
  return { totalResponses: summaries.reduce((total, item) => total + Number(item.responses), 0), bySlide: summaries, comments };
}

export async function getSlideFeedbackResults(): Promise<{
  totalResponses: number;
  bySlide: SlideFeedbackSummary[];
  comments: SlideFeedbackComment[];
}> {
  const sql = getSql();
  const summaries = await sql`
    SELECT slide_id AS "slideId", slide_number AS "slideNumber", feedback_type AS "feedbackType",
      COUNT(*)::int AS responses
    FROM student_slide_feedback
    WHERE course_id = 'communication-systems' AND lesson_id = 'lesson-04'
    GROUP BY slide_id, slide_number, feedback_type
    ORDER BY slide_number, feedback_type
  ` as unknown as SlideFeedbackSummary[];
  const comments = await sql`
    SELECT slide_number AS "slideNumber", feedback_type AS "feedbackType",
      optional_comment AS comment, submitted_at AS "submittedAt"
    FROM student_slide_feedback
    WHERE course_id = 'communication-systems' AND lesson_id = 'lesson-04'
      AND optional_comment <> ''
    ORDER BY submitted_at DESC
    LIMIT 100
  ` as unknown as SlideFeedbackComment[];

  return {
    totalResponses: summaries.reduce((total, item) => total + item.responses, 0),
    bySlide: summaries,
    comments,
  };
}
