export const annotationTypes = ["PASS", "HARD", "DEEPEN", "REVISIT"] as const;
export type AnnotationType = (typeof annotationTypes)[number];

export type LecturerSession = {
  sessionId: string; workspaceId: string | null; courseId: string; lessonId: string; deckVersion: string | null;
  startedAt: string; endedAt: string | null;
  slides: Array<{ slideId: string; idSource: "authored" | "index-fallback"; slideNumber: number; plannedDurationMinutes: number | null; actualActiveDurationMs: number; annotations: Array<{ type: AnnotationType; timestamp: string }> }>;
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 200) => typeof value === "string" && value.trim().length > 0 && value.length <= max ? value : null;
const timestamp = (value: unknown) => typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;

export function parseLecturerSession(value: unknown): LecturerSession | null {
  if (!isObject(value)) return null;
  const sessionId = uuid(value.session_id); const courseId = text(value.course_id); const lessonId = text(value.lesson_id);
  const startedAt = timestamp(value.started_at); const endedAt = value.ended_at === null ? null : timestamp(value.ended_at);
  const workspaceId = value.workspace_id === null || value.workspace_id === undefined ? null : text(value.workspace_id);
  const deckVersion = value.deck_version === null || value.deck_version === undefined ? null : text(value.deck_version);
  if (!sessionId || !courseId || !lessonId || !startedAt || (value.ended_at !== null && value.ended_at !== undefined && !endedAt) || (value.workspace_id !== null && value.workspace_id !== undefined && !workspaceId) || (value.deck_version !== null && value.deck_version !== undefined && !deckVersion) || !Array.isArray(value.slides) || value.slides.length > 500) return null;
  const seen = new Set<number>();
  const slides = value.slides.map((slide) => {
    if (!isObject(slide)) return null;
    const slideId = text(slide.slide_id); const slideNumber = slide.slide_number;
    const idSource = slide.id_source === "authored" || slide.id_source === "index-fallback" ? slide.id_source : null;
    const plan = slide.planned_duration_minutes; const actual = slide.actual_active_duration_ms;
    if (!slideId || !idSource || typeof slideNumber !== "number" || !Number.isInteger(slideNumber) || slideNumber < 1 || seen.has(slideNumber) || !(plan === null || (typeof plan === "number" && Number.isFinite(plan) && plan >= 0 && plan <= 1440)) || typeof actual !== "number" || !Number.isInteger(actual) || actual < 0 || actual > 86_400_000 || !Array.isArray(slide.annotations) || slide.annotations.length > 100) return null;
    seen.add(slideNumber);
    const annotations = slide.annotations.map((annotation) => isObject(annotation) && annotationTypes.includes(annotation.type as AnnotationType) && timestamp(annotation.timestamp) ? { type: annotation.type as AnnotationType, timestamp: annotation.timestamp as string } : null);
    return annotations.every(Boolean) ? { slideId, idSource, slideNumber, plannedDurationMinutes: plan, actualActiveDurationMs: actual, annotations: annotations as Array<{ type: AnnotationType; timestamp: string }> } : null;
  });
  return slides.every(Boolean) ? { sessionId, workspaceId, courseId, lessonId, deckVersion, startedAt, endedAt, slides: slides as LecturerSession["slides"] } : null;
}
