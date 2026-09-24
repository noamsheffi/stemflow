import "server-only";
import { getSql } from "./db";
import { ensureLearningSchema } from "./learning-schema";

const RETURN_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type SessionForReturn = {
  courseId: string;
  lessonId: string;
  deckVersion: string | null;
  endedAt: string | null;
};

export type PostClassSlideSummary = {
  slideId: string;
  slideNumber: number;
  views: number;
  anonymousBrowsers: number;
  averageActiveDurationMs: number;
};

export type PostClassLearningSummary = {
  status: "missing_end_time" | "waiting" | "unavailable" | "no_activity" | "collecting" | "complete";
  windowStart: string | null;
  windowEnd: string | null;
  observedThrough: string | null;
  windowComplete: boolean;
  deckVersionMatched: boolean;
  anonymousBrowsers: number;
  repeatBrowsers: number;
  sessions: number;
  slideViews: number;
  slides: PostClassSlideSummary[];
};

export async function getPostClassLearningSummary(session: SessionForReturn): Promise<PostClassLearningSummary> {
  if (!session.endedAt) {
    return { status: "missing_end_time", windowStart: null, windowEnd: null, observedThrough: null, windowComplete: false, deckVersionMatched: false, anonymousBrowsers: 0, repeatBrowsers: 0, sessions: 0, slideViews: 0, slides: [] };
  }

  const windowStart = new Date(session.endedAt);
  if (Number.isNaN(windowStart.getTime())) {
    return { status: "missing_end_time", windowStart: null, windowEnd: null, observedThrough: null, windowComplete: false, deckVersionMatched: false, anonymousBrowsers: 0, repeatBrowsers: 0, sessions: 0, slideViews: 0, slides: [] };
  }

  const windowEnd = new Date(windowStart.getTime() + RETURN_WINDOW_DAYS * DAY_MS);
  const now = new Date();
  if (windowStart > now) {
    return { status: "waiting", windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), observedThrough: null, windowComplete: false, deckVersionMatched: Boolean(session.deckVersion), anonymousBrowsers: 0, repeatBrowsers: 0, sessions: 0, slideViews: 0, slides: [] };
  }

  const observedThrough = now < windowEnd ? now : windowEnd;
  await ensureLearningSchema();
  const sql = getSql();
  const totals = await sql`
    WITH post_class_sessions AS (
      SELECT anonymous_client_id, session_id
      FROM student_lesson_events
      WHERE course_id = ${session.courseId}
        AND lesson_id = ${session.lessonId}
        AND event_type = 'lesson_started'
        AND occurred_at > ${windowStart}
        AND occurred_at <= ${observedThrough}
      GROUP BY anonymous_client_id, session_id
    ), browser_sessions AS (
      SELECT anonymous_client_id, COUNT(*)::int AS session_count
      FROM post_class_sessions
      GROUP BY anonymous_client_id
    )
    SELECT COUNT(*)::int AS sessions,
      COUNT(DISTINCT post_class_sessions.anonymous_client_id)::int AS "anonymousBrowsers",
      COUNT(DISTINCT post_class_sessions.anonymous_client_id) FILTER (WHERE browser_sessions.session_count > 1)::int AS "repeatBrowsers",
      (SELECT COUNT(*)::int
        FROM student_lesson_events e
        INNER JOIN post_class_sessions p USING (anonymous_client_id, session_id)
        WHERE e.course_id = ${session.courseId}
          AND e.lesson_id = ${session.lessonId}
          AND e.event_type = 'slide_viewed'
          AND e.occurred_at <= ${observedThrough}) AS "slideViews"
    FROM post_class_sessions
    LEFT JOIN browser_sessions USING (anonymous_client_id)
  ` as unknown as Array<{ sessions: number; anonymousBrowsers: number; repeatBrowsers: number; slideViews: number }>;

  const sessionCounts = totals[0] ?? { sessions: 0, anonymousBrowsers: 0, repeatBrowsers: 0, slideViews: 0 };
  let slides: PostClassSlideSummary[] = [];

  if (session.deckVersion && sessionCounts.sessions > 0) {
    const slideRows = await sql`
      WITH post_class_sessions AS (
        SELECT anonymous_client_id, session_id
        FROM student_lesson_events
        WHERE course_id = ${session.courseId}
          AND lesson_id = ${session.lessonId}
          AND event_type = 'lesson_started'
          AND occurred_at > ${windowStart}
          AND occurred_at <= ${observedThrough}
          AND deck_version = ${session.deckVersion}
        GROUP BY anonymous_client_id, session_id
      )
      SELECT e.slide_id AS "slideId", e.slide_number AS "slideNumber",
        COUNT(*)::int AS views,
        COUNT(DISTINCT e.anonymous_client_id)::int AS "anonymousBrowsers",
        ROUND(AVG(e.active_duration_ms))::int AS "averageActiveDurationMs"
      FROM student_lesson_events e
      INNER JOIN post_class_sessions p USING (anonymous_client_id, session_id)
      WHERE e.course_id = ${session.courseId}
        AND e.lesson_id = ${session.lessonId}
        AND e.deck_version = ${session.deckVersion}
        AND e.event_type = 'slide_viewed'
        AND e.occurred_at <= ${observedThrough}
      GROUP BY e.slide_id, e.slide_number
      ORDER BY e.slide_number
    ` as unknown as PostClassSlideSummary[];
    slides = slideRows.map((row) => ({ ...row, views: Number(row.views), anonymousBrowsers: Number(row.anonymousBrowsers), averageActiveDurationMs: Number(row.averageActiveDurationMs) }));
  }

  const windowComplete = now >= windowEnd;
  return {
    status: sessionCounts.sessions === 0 ? (windowComplete ? "no_activity" : "collecting") : (windowComplete ? "complete" : "collecting"),
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    observedThrough: observedThrough.toISOString(),
    windowComplete,
    deckVersionMatched: Boolean(session.deckVersion),
    anonymousBrowsers: Number(sessionCounts.anonymousBrowsers),
    repeatBrowsers: Number(sessionCounts.repeatBrowsers),
    sessions: Number(sessionCounts.sessions),
    slideViews: Number(sessionCounts.slideViews),
    slides,
  };
}
