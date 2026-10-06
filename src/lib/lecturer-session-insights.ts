import type { SessionDetail } from "./lecturer-session-results";
import type { PostClassLearningSummary } from "./post-class-learning-results";

export type LecturerSessionInsight = {
  kind: "action" | "strength" | "check";
  title: string;
  evidence: string;
  recommendation: string;
  slideNumbers?: number[];
};

const slideList = (slides: SessionDetail["slides"]) => slides.map((slide) => slide.slideNumber).sort((a, b) => a - b);
const listText = (numbers: number[]) => numbers.map((number) => `שקף ${number}`).join(", ");
const percent = (value: number) => `${Math.round(value)}%`;
const minutes = (value: number) => `${Math.floor(value / 60_000)} דק׳`;

export function buildLecturerSessionInsights(session: SessionDetail, learning: PostClassLearningSummary, ignoredSlideNumbers: ReadonlySet<number> = new Set()): LecturerSessionInsight[] {
  const insights: LecturerSessionInsight[] = [];
  const instructionalSlides = session.slides.filter((slide) => !ignoredSlideNumbers.has(slide.slideNumber));
  const slidesWith = (type: string) => instructionalSlides.filter((slide) => slide.annotations.some((annotation) => annotation.type === type));
  const hard = slidesWith("HARD");
  const revisit = slidesWith("REVISIT");
  const deepen = slidesWith("DEEPEN");
  const passed = slidesWith("PASS");
  const markedCount = instructionalSlides.filter((slide) => slide.annotations.length > 0).length;
  const unmarkedCount = Math.max(0, instructionalSlides.length - markedCount);

  if (hard.length) {
    const numbers = slideList(hard);
    insights.push({
      kind: "action",
      title: "חזקו את ההסבר בנקודות שסומנו כקשות",
      evidence: `סומנו ${hard.length} שקפים כ״דרש יותר הסבר״: ${listText(numbers)}.`,
      recommendation: "בכל אחד מהם, פתחו את השיעור הבא בדוגמה פתורה אחת ובשאלת בדיקה קצרה לפני המעבר הלאה.",
      slideNumbers: numbers,
    });
  }

  if (revisit.length) {
    const numbers = slideList(revisit);
    insights.push({
      kind: "action",
      title: "תכננו חזרה ממוקדת",
      evidence: `סומנו ${revisit.length} שקפים לחזרה: ${listText(numbers)}.`,
      recommendation: "הוסיפו בתחילת המפגש הבא תרגיל של 2–3 דקות שמקשר את הרעיון המוקדם לנושא החדש.",
      slideNumbers: numbers,
    });
  }

  if (deepen.length) {
    const numbers = slideList(deepen);
    insights.push({
      kind: "action",
      title: "הכינו שכבת העמקה למי שמוכן",
      evidence: `סומנו ${deepen.length} שקפים להעמקה: ${listText(numbers)}.`,
      recommendation: "הכינו שאלת אתגר או יישום נוסף שאפשר להציע אחרי בדיקת הבנה, בלי לעכב את יתר הכיתה.",
      slideNumbers: numbers,
    });
  }

  if (passed.length) {
    const numbers = slideList(passed);
    insights.push({
      kind: "strength",
      title: "שמרו על מה שעבד",
      evidence: `${passed.length} שקפים סומנו כ״עבר טוב״: ${listText(numbers)}.`,
      recommendation: "שמרו על המבנה או סוג הדוגמה בשקפים האלה, ובדקו אם אפשר להשתמש באותו דפוס גם בנושאים סמוכים.",
      slideNumbers: numbers,
    });
  }

  if (unmarkedCount > 0) {
    const unmarkedPercent = instructionalSlides.length ? Math.round(unmarkedCount / instructionalSlides.length * 100) : 0;
    insights.push({
      kind: "check",
      title: "כיסוי הסימונים במפגש",
      evidence: `${unmarkedCount} מתוך ${instructionalSlides.length} שקפי תוכן נשארו ללא סימון (${unmarkedPercent}%).`,
      recommendation: "היעדר סימון לא מעיד שהשקף לא נלמד. אם חשוב לעקוב אחר הכיסוי, סמן לפחות נקודת מפתח בכל מקטע; אפשר להשאיר שקפי מעבר ללא סימון.",
    });
  }

  const plannedSlides = instructionalSlides.filter((slide) => slide.plannedDurationMinutes !== null);
  if (plannedSlides.length >= 2) {
    const plannedMs = plannedSlides.reduce((total, slide) => total + (slide.plannedDurationMinutes ?? 0) * 60_000, 0);
    const actualMs = plannedSlides.reduce((total, slide) => total + slide.actualActiveDurationMs, 0);
    const differenceMs = actualMs - plannedMs;
    const differencePercent = plannedMs > 0 ? Math.abs(differenceMs) / plannedMs * 100 : 0;
    const outliers = plannedSlides
      .filter((slide) => {
        const delta = slide.actualActiveDurationMs - (slide.plannedDurationMinutes ?? 0) * 60_000;
        return delta >= 60_000 && delta / Math.max((slide.plannedDurationMinutes ?? 0) * 60_000, 60_000) >= 0.3;
      })
      .sort((a, b) => b.actualActiveDurationMs - (b.plannedDurationMinutes ?? 0) * 60_000 - (a.actualActiveDurationMs - (a.plannedDurationMinutes ?? 0) * 60_000));

    if (plannedMs > 0 && Math.abs(differenceMs) >= 120_000 && differencePercent >= 25) {
      const above = differenceMs > 0;
      const outlierNumbers = slideList(outliers.slice(0, 3));
      insights.push({
        kind: "check",
        title: above ? "בדקו את חלוקת הזמן" : "בדקו את פער המדידה מול התכנון",
        evidence: `בשקפים עם זמן מתוכנן נמדדו ${minutes(actualMs)} לעומת ${minutes(plannedMs)} בתכנון (${above ? "+" : "−"}${percent(differencePercent)}).${outlierNumbers.length ? ` החריגות הבולטות: ${listText(outlierNumbers)}.` : ""}`,
        recommendation: above
          ? "בדקו אם נדרשו יותר דוגמאות או שאלות מהצפוי, ועדכנו את הקצאת הזמן או קצצו שלב פחות מרכזי."
          : "לפני שינוי התכנון, ודאו שכל החלקים המתוכננים נלמדו ושמדידת הזמן תפסה את כל זמן ההוראה; אם כן, התאימו את ההקצאה למפגש בפועל.",
        slideNumbers: outlierNumbers,
      });
    }
  } else if (instructionalSlides.length > 0) {
    insights.push({
      kind: "check",
      title: "הוסיפו זמני תכנון כדי לנתח קצב",
      evidence: "אין מספיק שקפים במפגש עם זמן מתוכנן להשוואה אמינה.",
      recommendation: "הגדירו זמן יעד לשקפים המרכזיים במצגת; כך הסיכום יוכל לזהות פערי קצב בלי לנחש.",
    });
  }

  if (learning.deckVersionMatched && learning.anonymousBrowsers >= 3 && learning.slides.length) {
    const returnSlides = learning.slides
      .filter((slide) => slide.anonymousBrowsers >= 2)
      .sort((a, b) => b.anonymousBrowsers - a.anonymousBrowsers)
      .slice(0, 3);
    if (returnSlides.length) {
      const numbers = returnSlides.map((slide) => slide.slideNumber);
      insights.push({
        kind: "check",
        title: "בדקו אילו שקפים משכו חזרה אחרי השיעור",
        evidence: `בחלון שאחרי השיעור נרשמו צפיות חוזרות של דפדפנים אנונימיים ב־${listText(numbers)}.`,
        recommendation: "ודאו שבשקפים האלה יש סיכום קצר או קישור לתרגול המשך. צפייה חוזרת אינה מעידה כשלעצמה על קושי או על הבנה.",
        slideNumbers: numbers,
      });
    }
  }

  if (!insights.length) {
    insights.push({
      kind: "check",
      title: "אין עדיין מספיק אותות להמלצה ממוקדת",
      evidence: "לא נרשמו סימוני רפלקציה או פערי תכנון משמעותיים במפגש הזה.",
      recommendation: "במפגש הבא סמנו בזמן אמת שקפים שעבדו טוב, דרשו הסבר נוסף או שכדאי לחזור אליהם.",
    });
  }

  return insights;
}
