import "server-only";
import { getSql } from "./db";
import { ensureLearningSchema } from "./learning-schema";

export type LessonLearningSummary = {
  courseId: string; lessonId: string; learners: number; sessions: number; starts: number; completions: number; slideViews: number;
};
export type SlideLearningSummary = { lessonId: string; slideId: string; slideNumber: number; views: number; averageActiveDurationMs: number };

export async function getLearningSummaries(): Promise<{ lessons: LessonLearningSummary[]; slides: SlideLearningSummary[] }> {
  await ensureLearningSchema();
  const sql = getSql();
  const lessons = await sql`
    SELECT course_id AS "courseId", lesson_id AS "lessonId", COUNT(DISTINCT anonymous_client_id)::int AS learners,
      COUNT(DISTINCT session_id)::int AS sessions, COUNT(*) FILTER (WHERE event_type = 'lesson_started')::int AS starts,
      COUNT(*) FILTER (WHERE event_type = 'lesson_ended')::int AS completions,
      COUNT(*) FILTER (WHERE event_type = 'slide_viewed')::int AS "slideViews"
    FROM student_lesson_events GROUP BY course_id, lesson_id ORDER BY lesson_id
  ` as unknown as LessonLearningSummary[];
  const slides = await sql`
    SELECT lesson_id AS "lessonId", slide_id AS "slideId", slide_number AS "slideNumber", COUNT(*)::int AS views,
      ROUND(AVG(active_duration_ms))::bigint AS "averageActiveDurationMs"
    FROM student_lesson_events WHERE event_type = 'slide_viewed'
    GROUP BY lesson_id, slide_id, slide_number ORDER BY lesson_id, slide_number
  ` as unknown as SlideLearningSummary[];
  return { lessons, slides };
}
