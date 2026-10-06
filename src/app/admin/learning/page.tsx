import Link from "next/link";
import { getLearningSummaries } from "../../../lib/student-learning-results";
import { getSlideFeedbackResults } from "../../../lib/slide-feedback-results";
import { getMidtermPracticeResults } from "../../../lib/midterm-practice-results";
import { midtermQuestions } from "../../../lib/midterm-practice";

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

export const dynamic = "force-dynamic";

export default async function LecturerLearningPage() {
  try {
    const { lessons, slides } = await getLearningSummaries();
    let feedbackResults: Awaited<ReturnType<typeof getSlideFeedbackResults>> | null = null;
    let feedbackUnavailable = false;
    try { feedbackResults = await getSlideFeedbackResults(); }
    catch { feedbackUnavailable = true; }
    let practiceResults: Awaited<ReturnType<typeof getMidtermPracticeResults>> | null = null;
    let practiceUnavailable = false;
    try { practiceResults = await getMidtermPracticeResults(); }
    catch { practiceUnavailable = true; }
    return <main className="page-shell" dir="rtl"><section className="results-card" aria-labelledby="learning-title">
      <p className="eyebrow">Syllo · למידה אנונימית</p><h1 id="learning-title">שימוש במערכי השיעור</h1>
      <p className="privacy-note">הנתונים מצטברים לפי מזהה דפדפן אקראי. משוב לשקפים עשוי לכלול טקסט חופשי אנונימי.</p>
      {lessons.length === 0 ? <p className="empty-results">עדיין לא נאספו אירועי למידה.</p> : <><h2>לפי שיעור</h2><table><thead><tr><th>שיעור</th><th>לומדים</th><th>מפגשים</th><th>פתיחות</th><th>סיום</th><th>צפיות בשקפים</th></tr></thead><tbody>{lessons.map(item => <tr key={item.lessonId}><td>{item.lessonId}</td><td>{item.learners}</td><td>{item.sessions}</td><td>{item.starts}</td><td>{item.completions}</td><td>{item.slideViews}</td></tr>)}</tbody></table>
      <h2>זמן פעיל ממוצע לפי שקף</h2><table><thead><tr><th>שיעור</th><th>שקף</th><th>צפיות</th><th>זמן פעיל ממוצע</th></tr></thead><tbody>{slides.map(item => <tr key={`${item.lessonId}-${item.slideNumber}`}><td>{item.lessonId}</td><td>{item.slideNumber}</td><td>{item.views}</td><td dir="ltr">{fmt(Number(item.averageActiveDurationMs))}</td></tr>)}</tbody></table></>}
      <section className="results-section" aria-labelledby="student-feedback-title">
        <h2 id="student-feedback-title">משוב סטודנטים על שקפים</h2>
        {feedbackUnavailable ? <p>נתוני המשוב אינם זמינים. יש לוודא שמסד הנתונים מוגדר ושמיגרציה 007 הורצה.</p> : feedbackResults && <>
          <p className="results-total">סה״כ תגובות: <strong>{feedbackResults.totalResponses}</strong></p>
          {feedbackResults.bySlide.length === 0 ? <p className="empty-results">עדיין לא התקבל משוב על שקפים.</p> : <table><thead><tr><th>שקף</th><th>סוג המשוב</th><th>תגובות</th></tr></thead><tbody>{feedbackResults.bySlide.map(item => <tr key={`${item.slideId}-${item.feedbackType}`}><td>{item.slideNumber}</td><td>{feedbackTypeLabel(item.feedbackType)}</td><td>{item.responses}</td></tr>)}</tbody></table>}
          <h3>תגובות פתוחות</h3>
          {feedbackResults.comments.length === 0 ? <p className="empty-results">לא נכתבו תגובות פתוחות.</p> : <div className="response-list">{feedbackResults.comments.map((item, index) => <article className="response-card" key={`${item.submittedAt}-${index}`}><p className="response-time">שקף {item.slideNumber} · {feedbackTypeLabel(item.feedbackType)} · {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(item.submittedAt))}</p><p>{item.comment}</p></article>)}</div>}
        </>}
      </section>
      <section className="results-section" aria-labelledby="midterm-practice-title">
        <h2 id="midterm-practice-title">הכנה לבוחן אמצע · תרגול מדורג</h2>
        <p>הנתונים אנונימיים ומוצגים לפי שאלה. “נדרש חיזוק” הוא מספר משיבי התרגול שסימנו שלא הבינו.</p>
        {practiceUnavailable ? <p>נתוני התרגול אינם זמינים כרגע.</p> : !practiceResults?.questions.length ? <p className="empty-results">עדיין לא נצברו נתונים על התרגול.</p> : <><table><thead><tr><th>שאלה</th><th>התחלות</th><th>השלמות</th><th>צעדים שנפתחו</th><th>ביטחון ממוצע</th><th>עזרת ההסבר</th><th>נדרש חיזוק</th><th>תגובות כתובות</th></tr></thead><tbody>{practiceResults.questions.map(row => { const question = midtermQuestions.find(item => item.id === row.question_id); return <tr key={row.question_id}><td>{question?.title ?? row.question_id}</td><td>{row.starts}</td><td>{row.completions}</td><td>{row.steps_revealed}</td><td>{row.average_confidence ?? "—"}</td><td>{row.average_helpfulness ?? "—"}</td><td>{row.needs_support}</td><td>{row.feedback_count}</td></tr>; })}</tbody></table>
          <h3>תגובות פתוחות אנונימיות</h3>{practiceResults.comments.length === 0 ? <p className="empty-results">עדיין לא נכתבו תגובות פתוחות.</p> : <div className="response-list">{practiceResults.comments.map((item, index) => { const question = midtermQuestions.find(entry => entry.id === item.question_id); return <article className="response-card" key={`${item.question_id}-${index}`}><p className="response-time">{question?.title ?? item.question_id} · {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(item.occurred_at))}</p><p>{item.feedback}</p></article>; })}</div>}</>}
      </section>
      <p><Link href="/admin">מפגשי המרצה</Link></p>
    </section></main>;
  } catch { return <main className="page-shell" dir="rtl"><section className="results-card"><h1>נתוני הלמידה אינם זמינים כרגע</h1><p>יש לוודא שמסד הנתונים הוגדר ושמיגרציה 005 הורצה.</p></section></main>; }
}

function feedbackTypeLabel(value: string) {
  return ({ NOT_UNDERSTOOD: "לא הבנתי", NEED_EXAMPLE: "צריך עוד דוגמה", QUESTION: "יש לי שאלה", POSSIBLE_ERROR: "נראה שיש טעות" } as Record<string, string>)[value] ?? value;
}
