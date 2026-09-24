import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./session.module.css";
import { saveLecturerReflection } from "../actions";
import { getLecturerSession, getLecturerSessionReflection, getPreviousLecturerAction } from "../../../../lib/lecturer-session-results";
import { createLecturerReflectionToken } from "../../../../lib/lecturer-reflection-token";
import { getPostClassLearningSummary } from "../../../../lib/post-class-learning-results";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  PASS: "✓ עבר טוב",
  HARD: "! דרש יותר הסבר",
  DEEPEN: "★ צריך להעמיק",
  REVISIT: "↻ לחזור לזה",
};

const fmt = (value: number) => `${Math.floor(value / 60000)}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}`;
const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));

function returnWindowText(status: string, windowEnd: string | null, complete: boolean) {
  if (status === "missing_end_time") return "המפגש לא סומן כסיום, ולכן אין נקודת התחלה לחלון החזרה.";
  if (status === "waiting") return "חלון המדידה יתחיל לאחר סיום המפגש.";
  if (status === "unavailable") return "נתוני טלמטריית הלמידה אינם זמינים כרגע.";
  if (!windowEnd) return "לא ניתן לחשב את חלון המדידה.";
  return complete
    ? `חלון המדידה הושלם: שבעת הימים שאחרי סיום המפגש, עד ${date(windowEnd)}.`
    : `המדידה עדיין פתוחה ותימשך עד ${date(windowEnd)}.`;
}

export default async function LecturerSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ reflection?: string | string[] }>;
}) {
  const { sessionId } = await params;
  const session = await getLecturerSession(sessionId);
  if (!session) notFound();

  const [learning, reflection, previousAction, query] = await Promise.all([
    getPostClassLearningSummary(session).catch(() => ({ status: "unavailable" as const, windowStart: null, windowEnd: null, observedThrough: null, windowComplete: false, deckVersionMatched: false, anonymousBrowsers: 0, repeatBrowsers: 0, sessions: 0, slideViews: 0, slides: [] })),
    getLecturerSessionReflection(session.sessionId).catch(() => null),
    getPreviousLecturerAction(session).catch(() => null),
    searchParams,
  ]);
  const annotationCounts = Object.fromEntries(
    Object.keys(labels).map((type) => [type, session.slides.flatMap((slide) => slide.annotations).filter((annotation) => annotation.type === type).length]),
  ) as Record<string, number>;
  const overPlan = session.slides.filter((slide) => slide.plannedDurationMinutes !== null && slide.actualActiveDurationMs > slide.plannedDurationMinutes * 60000).length;
  const studentSlides = new Map(learning.slides.map((slide) => [slide.slideId, slide]));
  const reflectionState = Array.isArray(query.reflection) ? query.reflection[0] : query.reflection;
  let reflectionToken: string | null = null;
  try {
    reflectionToken = createLecturerReflectionToken(session.sessionId);
  } catch {
    reflectionToken = null;
  }

  return (
    <main className="page-shell" dir="rtl">
      <section className="results-card" aria-labelledby="session-title">
        <p className="eyebrow">Syllo · מפגש הוראה</p>
        <h1 id="session-title">{session.lessonId}</h1>
        <p className="privacy-note">
          התחלה: {date(session.startedAt)} · זמן הוראה פעיל: <bdi dir="ltr">{fmt(session.totalDurationMs)}</bdi>
        </p>
        <p className="privacy-note">זמן ארוך מהמתוכנן הוא אות להתבוננות, לא אבחנה של קושי.</p>

        <div className="lecturer-summary" aria-label="סיכום מפגש">
          <span>✓ {annotationCounts.PASS}</span>
          <span>! {annotationCounts.HARD}</span>
          <span>★ {annotationCounts.DEEPEN}</span>
          <span>↻ {annotationCounts.REVISIT}</span>
          <span>{overPlan} מעל המתוכנן</span>
        </div>

        {previousAction && (
          <p className={styles.previousAction}>
            <strong>השינוי שתוכנן אחרי המפגש הקודם ({date(previousAction.startedAt)}):</strong> {previousAction.whatWillChange}
          </p>
        )}

        {session.slides.some((slide) => slide.idSource === "index-fallback") && (
          <p className="lecturer-warning">זהות חלק מהשקפים נוצרה לפי מיקום; ייתכן שהשתנתה בין גרסאות המצגת.</p>
        )}

        <h2>סיכום הוראה</h2>
        <table>
          <thead><tr><th>שקף</th><th>מתוכנן</th><th>פעיל בפועל</th><th>סימון</th><th>סומן ב־</th></tr></thead>
          <tbody>
            {session.slides.map((slide) => {
              const isOverPlan = slide.plannedDurationMinutes !== null && slide.actualActiveDurationMs > slide.plannedDurationMinutes * 60000;
              return (
                <tr key={slide.slideNumber} className={isOverPlan ? "lecturer-signal" : undefined}>
                  <td>{slide.slideNumber}</td>
                  <td dir="ltr">{slide.plannedDurationMinutes === null ? "לא זמין" : `${slide.plannedDurationMinutes}:00`}</td>
                  <td dir="ltr">{fmt(slide.actualActiveDurationMs)}</td>
                  <td>{slide.annotations.map((annotation) => labels[annotation.type]).join(" · ") || "—"}</td>
                  <td>{slide.annotations.map((annotation) => date(annotation.timestamp)).join("\n") || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <section className={styles.returnSection} aria-labelledby="student-return-title">
          <h2 id="student-return-title">פעילות לומדים אחרי המפגש</h2>
          <p className="privacy-note">{returnWindowText(learning.status, learning.windowEnd, learning.windowComplete)}</p>
          {learning.status === "unavailable" ? <p className="empty-results">נתוני הטלמטריה אינם זמינים כרגע. מידע על מפגש המרצה נשאר זמין.</p> : learning.status === "missing_end_time" || learning.status === "waiting" ? null : (
            <>
              <div className="lecturer-summary" aria-label="מדדי חזרה אנונימיים">
                <span>{learning.anonymousBrowsers} דפדפנים אנונימיים</span>
                <span>{learning.sessions} פתיחות שיעור</span>
                <span>{learning.repeatBrowsers} דפדפנים עם שתי פתיחות ומעלה</span>
                <span>{learning.slideViews} צפיות בשקפים</span>
              </div>
              <p className="privacy-note">
                הספירה מבוססת על מזהה אנונימי בדפדפן, לא על אנשים או על רשימת נוכחות. אין כאן אחוז חזרה מתוך הכיתה; Do Not Track או חסימת שמירה בדפדפן עשויים למנוע מדידה.
              </p>
              {learning.deckVersionMatched ? (
                <>
                  <h3>השוואה לפי שקף</h3>
                  {session.slides.length === 0 ? <p className="empty-results">אין נתוני סימון לשקפים במפגש הזה.</p> : (
                    <table>
                      <thead><tr><th>שקף</th><th>סימון מרצה</th><th>דפדפנים</th><th>צפיות סטודנטים</th><th>זמן פעיל ממוצע</th></tr></thead>
                      <tbody>
                        {session.slides.map((slide) => {
                          const studentSlide = studentSlides.get(slide.slideId);
                          return (
                            <tr key={slide.slideId}>
                              <td>{slide.slideNumber}</td>
                              <td>{slide.annotations.map((annotation) => labels[annotation.type]).join(" · ") || "—"}</td>
                              <td>{studentSlide?.anonymousBrowsers ?? "—"}</td>
                              <td>{studentSlide?.views ?? "—"}</td>
                              <td dir="ltr">{studentSlide ? fmt(studentSlide.averageActiveDurationMs) : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <p className="lecturer-warning">גרסת התוכן אינה זמינה במפגש הזה, לכן מוצגים נתוני חזרה לשיעור בלבד ולא מחברים צפיות לשקפים.</p>
              )}
              {learning.status === "no_activity" && <p className="empty-results">לא נרשמו פתיחות שיעור בחלון המדידה.</p>}
              {learning.status === "collecting" && learning.sessions === 0 && <p className="empty-results">עדיין לא נרשמו פתיחות שיעור בחלון המדידה.</p>}
            </>
          )}
        </section>

        <section className={styles.reflectionSection} aria-labelledby="reflection-title">
          <h2 id="reflection-title">רפלקציה לקראת השיעור הבא</h2>
          <p className="privacy-note">הרפלקציה נשמרת לצד מפגש המרצה ולא נשלחת ל־GA4.</p>
          {reflectionState === "saved" && <p className={styles.notice} role="status">הרפלקציה נשמרה.</p>}
          {reflectionState === "expired" && <p className={styles.error} role="alert">הטופס פג. רעננו את הדף ונסו שוב.</p>}
          {reflectionState === "invalid" && <p className={styles.error} role="alert">יש למלא תשובה בכל שלושת השדות, עד 1,000 תווים לשדה.</p>}
          {reflectionState === "error" && <p className={styles.error} role="alert">לא ניתן לשמור כרגע. נסו שוב בעוד כמה רגעים.</p>}
          {reflectionToken ? (
            <form className={styles.reflectionForm} action={saveLecturerReflection}>
              <input type="hidden" name="sessionId" value={session.sessionId} />
              <input type="hidden" name="token" value={reflectionToken} />
              <label htmlFor="whatWorked">מה עבד?</label>
              <textarea id="whatWorked" name="whatWorked" maxLength={1000} rows={3} required defaultValue={reflection?.whatWorked ?? ""} />
              <label htmlFor="whatWasDifficult">מה היה קשה או לא עבר טוב?</label>
              <textarea id="whatWasDifficult" name="whatWasDifficult" maxLength={1000} rows={3} required defaultValue={reflection?.whatWasDifficult ?? ""} />
              <label htmlFor="whatWillChange">מה אשנה בפעם הבאה?</label>
              <textarea id="whatWillChange" name="whatWillChange" maxLength={1000} rows={3} required defaultValue={reflection?.whatWillChange ?? ""} />
              <button className={styles.submitButton} type="submit">שמירת רפלקציה</button>
            </form>
          ) : <p className={styles.error}>טופס הרפלקציה אינו זמין כרגע.</p>}
        </section>

        <p><Link href="/lecturer/sessions">חזרה למפגשים</Link></p>
      </section>
    </main>
  );
}
