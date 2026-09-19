export const SLIDE_FRICTION_EXPERIMENT_ID = "002-slide-friction";

export const lessonSlides = Array.from({ length: 16 }, (_, index) => ({
  id: `slide-${index + 1}`,
  number: index + 1,
}));

export const difficultyReasonOptions = [
  "לא הבנתי את המושג",
  "לא הבנתי את הנוסחה",
  "הבנתי את הנוסחה אבל לא את המשמעות שלה",
  "ההסבר התקדם מהר מדי",
  "היה יותר מדי מידע בשקף",
  "היה קשה לקרוא / לראות",
  "לא היה לי ברור מה חשוב לזכור",
  "חסרה לי דוגמה",
  "חסר לי ידע קודם",
  "אחר",
] as const;

export const recoveryBehaviorOptions = [
  "שאלתי את המרצה",
  "שאלתי חבר",
  "ניסיתי להבין לבד",
  "חיכיתי שההסבר הבא יעזור",
  "רשמתי לעצמי לבדוק אחר כך",
  "פתחתי חומר קודם",
  "השתמשתי ב-AI",
  "לא עשיתי כלום והמשכתי",
  "אחר",
] as const;

export const lecturerAwarenessOptions = [
  "כן, כי שאלתי / אמרתי",
  "כנראה שכן",
  "כנראה שלא",
  "לא",
  "לא יודע",
] as const;

export const notSignalingReasonOptions = [
  "לא רציתי לעצור את השיעור",
  "לא הייתי בטוח אם רק אני לא מבין",
  "חשבתי שאבין בהמשך",
  "לא נעים לי לשאול מול כולם",
  "לא הספקתי לנסח שאלה",
  "כבר המשכנו לנושא הבא",
  "אחר",
] as const;

export const preferredInterventionOptions = [
  "הסבר נוסף",
  "דוגמה נוספת",
  "המחשה / סימולציה",
  "פתרון שלב-אחר-שלב",
  "הסבר פשוט יותר של הנוסחה",
  "דקה לעצור ולעכל",
  "לדעת מה בדיוק צריך לזכור",
  "לא הייתי צריך עזרה נוספת",
] as const;

export const recoverySuccessOptions = ["כן", "לא"] as const;

export const recoveryTriggerOptions = [
  "המרצה הסביר בדרך אחרת",
  "דוגמה",
  "סימולציה",
  "תרגיל",
  "שאלה של סטודנט אחר",
  "חבר",
  "AI",
  "הסתכלתי שוב בחומר",
  "אחר",
] as const;

export type SlideFrictionAnswers = {
  difficultSlideIds: string[];
  noSignificantDifficulty: boolean;
  mostDifficultSlideId: string;
  difficultyReasons: string[];
  recoveryBehaviors: string[];
  lecturerAwareness: string;
  notSignalingReasons: string[];
  preferredIntervention: string;
  liveFeedbackLikelihood: number | null;
  liveFeedbackConcern: string;
  recoverySuccess: string;
  recoveryTrigger: string;
};

export type SlideFrictionSubmission = {
  anonymousClientId: string;
  answers: SlideFrictionAnswers;
};

export const emptySlideFrictionAnswers: SlideFrictionAnswers = {
  difficultSlideIds: [],
  noSignificantDifficulty: false,
  mostDifficultSlideId: "",
  difficultyReasons: [],
  recoveryBehaviors: [],
  lecturerAwareness: "",
  notSignalingReasons: [],
  preferredIntervention: "",
  liveFeedbackLikelihood: null,
  liveFeedbackConcern: "",
  recoverySuccess: "",
  recoveryTrigger: "",
};

const slideIds = lessonSlides.map((slide) => slide.id);

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

function isSelectionOf(value: unknown, options: readonly string[], maximum?: number): value is string[] {
  return Array.isArray(value)
    && value.every((item) => typeof item === "string" && options.includes(item))
    && new Set(value).size === value.length
    && (!maximum || value.length <= maximum);
}

function cleanOptionalText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length <= maximum ? cleaned : null;
}

export function parseSlideFrictionSubmission(value: unknown): SlideFrictionSubmission | null {
  if (!value || typeof value !== "object") return null;

  const input = value as { anonymousClientId?: unknown; answers?: Record<string, unknown> };
  const answers = input.answers;
  if (!answers || typeof input.anonymousClientId !== "string") return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.anonymousClientId)) return null;

  const noSignificantDifficulty = answers.noSignificantDifficulty === true;
  const difficultSlideIds = isSelectionOf(answers.difficultSlideIds, slideIds, 3) ? answers.difficultSlideIds : null;
  const mostDifficultSlideId = typeof answers.mostDifficultSlideId === "string" ? answers.mostDifficultSlideId : null;
  const difficultyReasons = isSelectionOf(answers.difficultyReasons, difficultyReasonOptions, 2) ? answers.difficultyReasons : null;
  const recoveryBehaviors = isSelectionOf(answers.recoveryBehaviors, recoveryBehaviorOptions) ? answers.recoveryBehaviors : null;
  const lecturerAwareness = typeof answers.lecturerAwareness === "string" ? answers.lecturerAwareness : null;
  const notSignalingReasons = isSelectionOf(answers.notSignalingReasons, notSignalingReasonOptions) ? answers.notSignalingReasons : null;
  const preferredIntervention = typeof answers.preferredIntervention === "string" ? answers.preferredIntervention : null;
  const liveFeedbackLikelihood = typeof answers.liveFeedbackLikelihood === "number" ? answers.liveFeedbackLikelihood : null;
  const liveFeedbackConcern = cleanOptionalText(answers.liveFeedbackConcern, 800);
  const recoverySuccess = typeof answers.recoverySuccess === "string" ? answers.recoverySuccess : null;
  const recoveryTrigger = typeof answers.recoveryTrigger === "string" ? answers.recoveryTrigger : null;

  if (!difficultSlideIds || !difficultyReasons || !recoveryBehaviors || !notSignalingReasons || liveFeedbackConcern === null) return null;
  if (typeof liveFeedbackLikelihood !== "number" || !Number.isInteger(liveFeedbackLikelihood) || liveFeedbackLikelihood < 1 || liveFeedbackLikelihood > 5) return null;
  if (!isOneOf(recoverySuccess ?? "", recoverySuccessOptions)) return null;
  if (recoverySuccess === "כן" && !isOneOf(recoveryTrigger ?? "", recoveryTriggerOptions)) return null;

  const validLiveFeedbackLikelihood = liveFeedbackLikelihood as number;
  const validRecoverySuccess = recoverySuccess as string;

  if (noSignificantDifficulty) {
    if (difficultSlideIds.length || mostDifficultSlideId || difficultyReasons.length || recoveryBehaviors.length || lecturerAwareness || notSignalingReasons.length || preferredIntervention) return null;
  } else {
    if (!difficultSlideIds.length || !mostDifficultSlideId || !difficultSlideIds.includes(mostDifficultSlideId)) return null;
    if (!difficultyReasons.length || !recoveryBehaviors.length || !isOneOf(lecturerAwareness ?? "", lecturerAwarenessOptions) || !preferredIntervention || !isOneOf(preferredIntervention, preferredInterventionOptions)) return null;
    const needsNotSignalingReason = lecturerAwareness === "כנראה שלא" || lecturerAwareness === "לא";
    if (needsNotSignalingReason !== (notSignalingReasons.length > 0)) return null;
  }

  return {
    anonymousClientId: input.anonymousClientId,
    answers: {
      difficultSlideIds,
      noSignificantDifficulty,
      mostDifficultSlideId: mostDifficultSlideId ?? "",
      difficultyReasons,
      recoveryBehaviors,
      lecturerAwareness: lecturerAwareness ?? "",
      notSignalingReasons,
      preferredIntervention: preferredIntervention ?? "",
      liveFeedbackLikelihood: validLiveFeedbackLikelihood,
      liveFeedbackConcern,
      recoverySuccess: validRecoverySuccess,
      recoveryTrigger: recoveryTrigger ?? "",
    },
  };
}
