export const SLIDE_FEEDBACK_TYPES = ["NOT_UNDERSTOOD", "NEED_EXAMPLE", "QUESTION", "POSSIBLE_ERROR"] as const;
export type SlideFeedbackType = (typeof SLIDE_FEEDBACK_TYPES)[number];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SlideFeedbackSubmission = {
  anonymousClientId: string;
  courseId: string;
  lessonId: string;
  slideId: string;
  slideNumber: number;
  deckVersion: string;
  feedbackType: SlideFeedbackType;
  optionalComment: string;
  submittedAt: string;
  pageUrl: string;
  idempotencyKey: string;
};

export function parseSlideFeedback(value: unknown): SlideFeedbackSubmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const text = (key: string, max: number) => typeof input[key] === "string" && input[key].trim().length > 0 && input[key].length <= max;
  if (!text("anonymousClientId", 50) || !uuidPattern.test(input.anonymousClientId as string) || !text("courseId", 120) || !text("lessonId", 120) || !text("slideId", 120) || !text("deckVersion", 120) || !text("pageUrl", 2048) || !text("idempotencyKey", 120)) return null;
  if (!SLIDE_FEEDBACK_TYPES.includes(input.feedbackType as SlideFeedbackType)) return null;
  if (typeof input.slideNumber !== "number" || !Number.isInteger(input.slideNumber) || input.slideNumber < 1 || input.slideNumber > 500) return null;
  if (typeof input.submittedAt !== "string" || Number.isNaN(Date.parse(input.submittedAt))) return null;
  const optionalComment = typeof input.optionalComment === "string" ? input.optionalComment.trim() : "";
  if (optionalComment.length > 800) return null;
  if ((input.feedbackType === "NOT_UNDERSTOOD" || input.feedbackType === "NEED_EXAMPLE") && optionalComment) return null;
  return { anonymousClientId: input.anonymousClientId as string, courseId: input.courseId as string, lessonId: input.lessonId as string, slideId: input.slideId as string, slideNumber: input.slideNumber, deckVersion: input.deckVersion as string, feedbackType: input.feedbackType as SlideFeedbackType, optionalComment, submittedAt: input.submittedAt, pageUrl: input.pageUrl as string, idempotencyKey: input.idempotencyKey as string };
}
