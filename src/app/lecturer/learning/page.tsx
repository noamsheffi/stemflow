import Link from "next/link";
import { getLearningSummaries } from "../../../lib/student-learning-results";

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

export const dynamic = "force-dynamic";

export default async function LecturerLearningPage() {
  try {
    const { lessons, slides } = await getLearningSummaries();
    return <main className="page-shell" dir="rtl"><section className="results-card" aria-labelledby="learning-title">
      <p className="eyebrow">Syllo · למידה אנונימית</p><h1 id="learning-title">שימוש במערכי השיעור</h1>
      <p className="privacy-note">הנתונים מצטברים לפי דפדפן אקראי בלבד. אין שמות, חשבונות, תשובות או טקסט חופשי.</p>
      {lessons.length === 0 ? <p className="empty-results">עדיין לא נאספו אירועי למידה.</p> : <><h2>לפי שיעור</h2><table><thead><tr><th>שיעור</th><th>לומדים</th><th>מפגשים</th><th>פתיחות</th><th>סיום</th><th>צפיות בשקפים</th></tr></thead><tbody>{lessons.map(item => <tr key={item.lessonId}><td>{item.lessonId}</td><td>{item.learners}</td><td>{item.sessions}</td><td>{item.starts}</td><td>{item.completions}</td><td>{item.slideViews}</td></tr>)}</tbody></table>
      <h2>זמן פעיל ממוצע לפי שקף</h2><table><thead><tr><th>שיעור</th><th>שקף</th><th>צפיות</th><th>זמן פעיל ממוצע</th></tr></thead><tbody>{slides.map(item => <tr key={`${item.lessonId}-${item.slideNumber}`}><td>{item.lessonId}</td><td>{item.slideNumber}</td><td>{item.views}</td><td dir="ltr">{fmt(Number(item.averageActiveDurationMs))}</td></tr>)}</tbody></table></>}
      <p><Link href="/lecturer/sessions">מפגשי המרצה</Link></p>
    </section></main>;
  } catch { return <main className="page-shell" dir="rtl"><section className="results-card"><h1>נתוני הלמידה אינם זמינים כרגע</h1><p>יש לוודא שמסד הנתונים הוגדר ושמיגרציה 005 הורצה.</p></section></main>; }
}
