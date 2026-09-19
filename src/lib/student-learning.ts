export const learningEventTypes = ["lesson_started", "slide_viewed", "lesson_ended"] as const;
export type LearningEventType = (typeof learningEventTypes)[number];

export type StudentLearningEvent = {
  anonymousClientId: string; sessionId: string; courseId: string; lessonId: string; deckVersion: string | null;
  eventType: LearningEventType; slideId: string | null; slideNumber: number | null; activeDurationMs: number | null; occurredAt: string;
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
const text = (value: unknown, max = 200) => typeof value === "string" && value.trim().length > 0 && value.length <= max ? value : null;
const optionalText = (value: unknown, max = 200) => value === null || value === undefined ? null : text(value, max);
const timestamp = (value: unknown) => typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;

export function parseStudentLearningEvent(value: unknown): StudentLearningEvent | null {
  if (!isObject(value)) return null;
  const anonymousClientId = uuid(value.anonymous_client_id), sessionId = uuid(value.session_id), courseId = text(value.course_id), lessonId = text(value.lesson_id), deckVersion = optionalText(value.deck_version, 100);
  const eventType = learningEventTypes.includes(value.event_type as LearningEventType) ? value.event_type as LearningEventType : null;
  const slideId = optionalText(value.slide_id), slideNumber = value.slide_number === null || value.slide_number === undefined ? null : value.slide_number, activeDurationMs = value.active_duration_ms === null || value.active_duration_ms === undefined ? null : value.active_duration_ms, occurredAt = timestamp(value.occurred_at);
  if (!anonymousClientId || !sessionId || !courseId || !lessonId || !eventType || !occurredAt || !(slideNumber === null || (typeof slideNumber === "number" && Number.isInteger(slideNumber) && slideNumber > 0 && slideNumber <= 500)) || !(activeDurationMs === null || (typeof activeDurationMs === "number" && Number.isInteger(activeDurationMs) && activeDurationMs >= 0 && activeDurationMs <= 3_600_000))) return null;
  if (eventType === "slide_viewed" && (!slideId || slideNumber === null || activeDurationMs === null)) return null;
  return { anonymousClientId, sessionId, courseId, lessonId, deckVersion, eventType, slideId, slideNumber, activeDurationMs, occurredAt };
}
