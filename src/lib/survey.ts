export const EXPERIMENT_ID = "001-problem-discovery";

export const findHelpEaseOptions = [
  "קל מאוד",
  "די קל",
  "לא קל ולא קשה",
  "די קשה",
  "קשה מאוד",
] as const;

export const problemTypeOptions = [
  "תוכן",
  "מציאת חומר",
  "הבנה",
  "תרגול",
  "כלי הלמידה",
] as const;

export type Answers = {
  firstPlace: string;
  stuckResponse: string;
  friction: string;
  findHelpEase: (typeof findHelpEaseOptions)[number] | "";
  wish: string;
  problemType: (typeof problemTypeOptions)[number] | "";
};

export type AnswerKey = keyof Answers;

export type Question = {
  key: AnswerKey;
  prompt: string;
  type: "text" | "choice";
  hint?: string;
  options?: readonly string[];
  maxLength?: number;
};

export const questions: readonly Question[] = [
  {
    key: "firstPlace",
    prompt: "כשאתה רוצה לחזור על חומר מהקורס, לאן אתה הולך קודם?",
    type: "text",
    hint: "אפשר לכתוב למשל אתר הקורס, מחברת, סרטון או משהו אחר.",
    maxLength: 800,
  },
  {
    key: "stuckResponse",
    prompt: "תחשוב על הפעם האחרונה שנתקעת בחומר. מה עשית?",
    type: "text",
    hint: "אפשר לתאר את השלבים לפי הסדר.",
    maxLength: 2000,
  },
  {
    key: "friction",
    prompt: "מה הכי מקשה עליך היום בעבודה עם חומרי הקורס?",
    type: "text",
    maxLength: 800,
  },
  {
    key: "findHelpEase",
    prompt: "כשאתה נתקע בבית, כמה קל לך למצוא משהו שיעזור לך להמשיך?",
    type: "choice",
    options: findHelpEaseOptions,
  },
  {
    key: "wish",
    prompt: 'השלם: "הייתי רוצה שיהיה לי קל יותר ______ כשאני לומד מערכות תקשורת."',
    type: "text",
    maxLength: 800,
  },
  {
    key: "problemType",
    prompt: "לדעתך, מה סוג הבעיה המרכזית שתיארת?",
    type: "choice",
    options: problemTypeOptions,
  },
] as const;

export const emptyAnswers: Answers = {
  firstPlace: "",
  stuckResponse: "",
  friction: "",
  findHelpEase: "",
  wish: "",
  problemType: "",
};

export type SubmissionPayload = {
  anonymousClientId: string;
  answers: Answers;
};

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 && cleaned.length <= maxLength ? cleaned : null;
}

export function parseSubmissionPayload(value: unknown): SubmissionPayload | null {
  if (!value || typeof value !== "object") return null;
  const input = value as { anonymousClientId?: unknown; answers?: Record<string, unknown> };
  const answers = input.answers;

  if (!answers || typeof input.anonymousClientId !== "string") return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.anonymousClientId)) return null;

  const firstPlace = cleanText(answers.firstPlace, 800);
  const stuckResponse = cleanText(answers.stuckResponse, 2000);
  const friction = cleanText(answers.friction, 800);
  const wish = cleanText(answers.wish, 800);
  const findHelpEase = typeof answers.findHelpEase === "string" && isOneOf(answers.findHelpEase, findHelpEaseOptions)
    ? answers.findHelpEase
    : null;
  const problemType = typeof answers.problemType === "string" && isOneOf(answers.problemType, problemTypeOptions)
    ? answers.problemType
    : null;

  if (!firstPlace || !stuckResponse || !friction || !wish || !findHelpEase || !problemType) return null;

  return {
    anonymousClientId: input.anonymousClientId,
    answers: { firstPlace, stuckResponse, friction, findHelpEase, wish, problemType },
  };
}
