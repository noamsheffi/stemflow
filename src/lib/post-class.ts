export const EXPERIMENT_ID = "002-post-class-behavior";
export const surveyPath = "/course/communication-systems/surveys/002-post-class-behavior";
export const questions = [
  { key: "returned_to_material", prompt: "אחרי השיעור האחרון, האם פתחת את מערך השיעור ששלחתי?", options: [["yes", "כן"], ["no", "לא"], ["unsure", "אני לא זוכר/ת"]] },
  { key: "material_actions", prompt: "כשפתחת את מערך השיעור, מה עשית בו?", options: [["specific_slide", "חזרתי לשקף מסוים מהשיעור"], ["multiple_slides", "עברתי שוב על כמה שקפים"], ["formula", "חיפשתי נוסחה"], ["concept", "חיפשתי הסבר למושג"], ["simulation", "השתמשתי בסימולציה / רכיב אינטראקטיבי"], ["exercise", "הסתכלתי על תרגיל או פתרון"], ["brief_open", "רק פתחתי והסתכלתי בקצרה"], ["other", "אחר"]] },
  { key: "return_trigger", prompt: "מה גרם לך לפתוח את החומר?", options: [["confusion", "רציתי לחזור על משהו שלא היה לי ברור בשיעור"], ["homework", "רציתי לפתור תרגיל / שיעורי בית"], ["formula", "רציתי למצוא נוסחה או נתון"], ["next_class", "רציתי להתכונן לשיעור הבא"], ["review", "רציתי לסכם או לחזור על מה שלמדנו"], ["exam", "התכוננתי למבחן / בוחן"], ["casual", "סתם רציתי לראות שוב את החומר"], ["other", "אחר"]] },
  { key: "non_return_reason", prompt: "מה הסיבה העיקרית שלא פתחת את מערך השיעור אחרי השיעור?", options: [["not_needed", "לא הייתי צריך/ה אותו עדיין"], ["no_time", "לא היה לי זמן ללמוד מאז השיעור"], ["only_before_task", "אני בדרך כלל חוזר/ת לחומר רק לפני תרגיל או מבחן"], ["alternative", "השתמשתי במשהו אחר במקום"], ["forgot", "לא זכרתי שהקובץ נשלח"], ["unclear", "לא היה לי ברור מה כדאי לחפש בו"], ["other", "אחר"]] },
  { key: "formula_context_needs", prompt: "כשאתה רואה נוסחה מהקורס, מה הכי חשוב לך לדעת בנוסף לנוסחה עצמה?", options: [["variables", "מה המשמעות של כל משתנה"], ["units", "באילו יחידות משתמשים"], ["when", "מתי משתמשים בנוסחה"], ["which", "איך יודעים שזו הנוסחה המתאימה לתרגיל"], ["example", "דוגמה קצרה עם הצבה"], ["lesson", "באיזה שיעור / נושא למדנו אותה"], ["none", "לא חסר לי מידע נוסף בדרך כלל"], ["other", "אחר"]] },
  { key: "concept_connection_value", prompt: "כשאתה לומד מושג חדש, עד כמה עוזר לך לראות איך הוא מתחבר לדברים שכבר למדנו?", options: [["1", "1 — בכלל לא עוזר"], ["2", "2 — מעט"], ["3", "3 — במידה מסוימת"], ["4", "4 — עוזר"], ["5", "5 — עוזר מאוד"]] },
] as const;
export type QuestionKey = (typeof questions)[number]["key"];
export type Answers = {
  returned_to_material: "" | "yes" | "no" | "unsure";
  material_actions: string[];
  return_trigger: string | null;
  non_return_reason: string | null;
  formula_context_needs: string[];
  concept_connection_value: number | null;
  concept_connection_example: string;
  other_text: Partial<Record<QuestionKey, string>>;
};
export const emptyAnswers: Answers = { returned_to_material: "", material_actions: [], return_trigger: null, non_return_reason: null, formula_context_needs: [], concept_connection_value: null, concept_connection_example: "", other_text: {} };
export function flow(returned: Answers["returned_to_material"]): number[] {
  return returned === "yes" ? [0, 1, 2, 4, 5] : returned === "no" ? [0, 3, 4, 5] : [0, 4, 5];
}
export function validAnswer(index: number, value: unknown): boolean {
  const options: readonly (readonly string[])[] = questions[index].options;
  const allowed = (v: unknown) => typeof v === "string" && options.some(([key]) => key === v);
  if (index === 1 || index === 4) return Array.isArray(value) && value.length > 0 && value.length <= (index === 4 ? 2 : options.length) && new Set(value).size === value.length && value.every(allowed) && !(index === 4 && value.includes("none") && value.length > 1);
  return index === 5 ? typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 : allowed(value);
}
export function parseSubmission(value: unknown): { anonymousClientId: string; answers: Answers } | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.anonymousClientId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.anonymousClientId) || !input.answers || typeof input.answers !== "object" || Array.isArray(input.answers)) return null;
  const raw = input.answers as Record<string, unknown>;
  if (!validAnswer(0, raw.returned_to_material)) return null;
  const returned = raw.returned_to_material as Answers["returned_to_material"];
  if (!flow(returned).every(index => validAnswer(index, raw[questions[index].key]))) return null;
  const text = (v: unknown) => v == null ? "" : typeof v === "string" && v.length <= 800 ? v.trim() : null;
  const example = text(raw.concept_connection_example);
  if (example === null) return null;
  if (raw.other_text != null && (typeof raw.other_text !== "object" || Array.isArray(raw.other_text))) return null;
  const otherInput = (raw.other_text ?? {}) as Record<string, unknown>;
  const other_text: Answers["other_text"] = {};
  for (const index of flow(returned)) {
    const key = questions[index].key;
    const selected = raw[key];
    if (selected === "other" || (Array.isArray(selected) && selected.includes("other"))) {
      const cleaned = text(otherInput[key]);
      if (cleaned === null) return null;
      if (cleaned) other_text[key] = cleaned;
    }
  }
  return { anonymousClientId: input.anonymousClientId, answers: {
    returned_to_material: returned,
    material_actions: returned === "yes" ? raw.material_actions as string[] : [],
    return_trigger: returned === "yes" ? raw.return_trigger as string : null,
    non_return_reason: returned === "no" ? raw.non_return_reason as string : null,
    formula_context_needs: raw.formula_context_needs as string[],
    concept_connection_value: raw.concept_connection_value as number,
    concept_connection_example: example, other_text,
  } };
}
