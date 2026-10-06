import { notFound } from "next/navigation";
import styles from "./session.module.css";
import reviewStyles from "./review-workspace.module.css";
import LecturerReviewWorkspace from "./review-workspace";
import { saveLecturerReflection } from "../actions";
import { getLecturerSession, getLecturerSessionReflection, getPreviousLecturerAction } from "../../../../lib/lecturer-session-results";
import { createLecturerReflectionToken } from "../../../../lib/lecturer-reflection-token";
import { getPostClassLearningSummary } from "../../../../lib/post-class-learning-results";
import { buildLecturerSessionInsights } from "../../../../lib/lecturer-session-insights";
import { lesson04Chapters, lesson04Slides } from "../../../../components/lesson-04-data";

export const dynamic = "force-dynamic";

type LecturerMark = "PASS" | "HARD" | "DEEPEN" | "REVISIT";

const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));
const emptyLearning = { status: "unavailable" as const, windowStart: null, windowEnd: null, observedThrough: null, windowComplete: false, deckVersionMatched: false, anonymousBrowsers: 0, repeatBrowsers: 0, sessions: 0, slideViews: 0, slides: [] };

export default async function LecturerSessionPage({ params, searchParams }: { params: Promise<{ sessionId: string }>; searchParams: Promise<{ reflection?: string | string[] }> }) {
  const { sessionId } = await params;
  const session = await getLecturerSession(sessionId);
  if (!session) notFound();

  const [learning, reflection, previousAction, query] = await Promise.all([
    getPostClassLearningSummary(session).catch(() => emptyLearning),
    getLecturerSessionReflection(session.sessionId).catch(() => null),
    getPreviousLecturerAction(session).catch(() => null),
    searchParams,
  ]);
  const isLesson04 = session.courseId === "communication-systems" && session.lessonId === "lesson-04";
  const staticSlides = isLesson04 ? lesson04Slides : [];
  const staticByNumber = new Map(staticSlides.map((slide) => [slide.n, slide]));
  const chapterById = new Map(lesson04Chapters.map((chapter) => [chapter.id, chapter.title]));
  const returnsBySlide = new Map(learning.slides.map((slide) => [slide.slideId, slide]));
  const slides = session.slides.map((slide) => {
    const metadata = staticByNumber.get(slide.slideNumber);
    const chapterId = metadata?.ch ?? null;
    const latestMark = slide.annotations.at(-1)?.type;
    const mark: LecturerMark | null = latestMark === "PASS" || latestMark === "HARD" || latestMark === "DEEPEN" || latestMark === "REVISIT" ? latestMark : null;
    const returnData = learning.deckVersionMatched ? returnsBySlide.get(slide.slideId) : undefined;
    return {
      slideId: slide.slideId,
      slideNumber: slide.slideNumber,
      idSource: slide.idSource,
      title: metadata?.h ?? `שקף ${String(slide.slideNumber).padStart(2, "0")}`,
      eyebrow: metadata?.eb ?? "",
      chapter: chapterById.get(chapterId ?? -1) ?? "שקפים",
      chapterId,
      section: metadata?.sec ?? false,
      plannedDurationMs: slide.plannedDurationMinutes === null ? (metadata && metadata.min > 0 ? metadata.min * 60_000 : null) : slide.plannedDurationMinutes * 60_000,
      actualActiveDurationMs: slide.actualActiveDurationMs,
      mark,
      anonymousReturned: returnData?.anonymousBrowsers ?? 0,
      returnViews: returnData?.views ?? 0,
    };
  });
  const ignoredSlideNumbers = new Set(staticSlides.filter((slide) => slide.sec).map((slide) => slide.n));
  const insights = buildLecturerSessionInsights(session, learning, ignoredSlideNumbers);
  const suggestedNextChange = insights.find((insight) => insight.kind === "action")?.recommendation
    ?? insights.find((insight) => insight.kind === "check")?.recommendation ?? "";
  const reflectionState = Array.isArray(query.reflection) ? query.reflection[0] : query.reflection;
  let token: string | null = null;
  try { token = createLecturerReflectionToken(session.sessionId); } catch { token = null; }

  const reflectionContent = <section className={reviewStyles.reflectionCard} aria-labelledby="reflection-title">
    <p className={reviewStyles.eyebrow}>רפלקציה אישית</p><h2 id="reflection-title">מה לקחת למפגש הבא?</h2>
    <p className={reviewStyles.muted}>הרפלקציה נשמרת לצד מפגש ההוראה ואינה נשלחת ל־GA4.</p>
    {previousAction && <p className={styles.previousAction}><strong>מה תכננת לשנות במפגש הקודם ({date(previousAction.startedAt)}):</strong> {previousAction.whatWillChange}</p>}
    {reflectionState === "saved" && <p className={styles.notice} role="status">הרפלקציה נשמרה.</p>}
    {reflectionState === "expired" && <p className={styles.error} role="alert">הטופס פג. רעננו את הדף ונסו שוב.</p>}
    {reflectionState === "invalid" && <p className={styles.error} role="alert">יש למלא תשובה בכל שלושת השדות, עד 1,000 תווים לשדה.</p>}
    {reflectionState === "error" && <p className={styles.error} role="alert">לא ניתן לשמור כרגע. נסו שוב בעוד כמה רגעים.</p>}
    {token ? <form className={styles.reflectionForm} action={saveLecturerReflection}>
      <input type="hidden" name="sessionId" value={session.sessionId} /><input type="hidden" name="token" value={token} />
      <label htmlFor="whatWorked">מה עבד טוב?</label><textarea id="whatWorked" name="whatWorked" maxLength={1000} rows={4} required defaultValue={reflection?.whatWorked ?? ""} />
      <label htmlFor="whatWasDifficult">מה היה קשה או לא עבר טוב?</label><textarea id="whatWasDifficult" name="whatWasDifficult" maxLength={1000} rows={4} required defaultValue={reflection?.whatWasDifficult ?? ""} />
      <label htmlFor="whatWillChange">מה אשנה בפעם הבאה?</label><textarea id="whatWillChange" name="whatWillChange" maxLength={1000} rows={4} required defaultValue={reflection?.whatWillChange ?? suggestedNextChange} />
      <button className={styles.submitButton} type="submit">שמירת רפלקציה</button>
    </form> : <p className={styles.error}>טופס הרפלקציה אינו זמין כרגע.</p>}
  </section>;

  return <LecturerReviewWorkspace
    session={{ sessionId: session.sessionId, courseId: session.courseId, lessonId: session.lessonId, startedAt: session.startedAt, endedAt: session.endedAt }}
    slides={slides}
    insights={insights}
    totalDurationMs={session.totalDurationMs}
    syncedAt={session.syncedAt}
    anonymousBrowsers={learning.anonymousBrowsers}
    deckVersionMatched={learning.deckVersionMatched}
    reflectionContent={reflectionContent}
  />;
}
