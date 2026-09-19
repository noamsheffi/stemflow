import "server-only";
import { getSql } from "./db";

export type SessionListItem = { sessionId: string; courseId: string; lessonId: string; deckVersion: string | null; startedAt: string; endedAt: string | null; totalDurationMs: number; slidesShown: number; annotationsCount: number; syncedAt: string };
export type SessionDetail = SessionListItem & { workspaceId: string | null; slides: Array<{ slideId: string; idSource: string; slideNumber: number; plannedDurationMinutes: number | null; actualActiveDurationMs: number; annotations: Array<{ type: string; timestamp: string }> }> };

export async function getLecturerSessions(): Promise<SessionListItem[]> {
  const rows = await getSql()`
    SELECT s.session_id AS "sessionId", s.course_id AS "courseId", s.lesson_id AS "lessonId", s.deck_version AS "deckVersion", s.started_at AS "startedAt", s.ended_at AS "endedAt", s.total_duration_ms AS "totalDurationMs", s.updated_at AS "syncedAt", COUNT(DISTINCT o.id)::int AS "slidesShown", COUNT(a.id)::int AS "annotationsCount"
    FROM lecturer_sessions s LEFT JOIN lecturer_slide_observations o ON o.lecturer_session_id = s.id LEFT JOIN lecturer_annotation_events a ON a.lecturer_slide_observation_id = o.id
    GROUP BY s.id ORDER BY s.started_at DESC
  ` as unknown as SessionListItem[];
  return rows;
}

export async function getLecturerSession(sessionId: string): Promise<SessionDetail | null> {
  const sessions = await getSql()`SELECT session_id AS "sessionId", workspace_id AS "workspaceId", course_id AS "courseId", lesson_id AS "lessonId", deck_version AS "deckVersion", started_at AS "startedAt", ended_at AS "endedAt", total_duration_ms AS "totalDurationMs", updated_at AS "syncedAt" FROM lecturer_sessions WHERE session_id = ${sessionId}` as unknown as Array<Omit<SessionDetail, "slides" | "slidesShown" | "annotationsCount">>;
  if (!sessions[0]) return null;
  const rows = await getSql()`SELECT o.id, o.slide_id AS "slideId", o.id_source AS "idSource", o.slide_number AS "slideNumber", o.planned_duration_minutes AS "plannedDurationMinutes", o.actual_active_duration_ms AS "actualActiveDurationMs", a.annotation_type AS type, a.annotation_timestamp AS timestamp FROM lecturer_slide_observations o LEFT JOIN lecturer_annotation_events a ON a.lecturer_slide_observation_id = o.id WHERE o.lecturer_session_id = (SELECT id FROM lecturer_sessions WHERE session_id = ${sessionId}) ORDER BY o.slide_number, a.annotation_timestamp` as unknown as Array<{ id: string; slideId: string; idSource: string; slideNumber: number; plannedDurationMinutes: number | null; actualActiveDurationMs: number; type: string | null; timestamp: string | null }>;
  const grouped = new Map<string, SessionDetail["slides"][number]>();
  for (const row of rows) { if (!grouped.has(row.id)) grouped.set(row.id, { slideId: row.slideId, idSource: row.idSource, slideNumber: row.slideNumber, plannedDurationMinutes: row.plannedDurationMinutes, actualActiveDurationMs: row.actualActiveDurationMs, annotations: [] }); if (row.type && row.timestamp) grouped.get(row.id)!.annotations.push({ type: row.type, timestamp: row.timestamp }); }
  const slides = [...grouped.values()];
  return { ...sessions[0], slides, slidesShown: slides.length, annotationsCount: slides.reduce((total, slide) => total + slide.annotations.length, 0) };
}
