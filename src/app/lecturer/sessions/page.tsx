import Link from "next/link";
import { getLecturerSessions } from "../../../lib/lecturer-session-results";

export const dynamic = "force-dynamic";
const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));
const minutes = (value: number) => `${Math.floor(value / 60000)}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}`;

export default async function LecturerSessionsPage() {
  try {
    const sessions = await getLecturerSessions();
    return <main className="page-shell" dir="rtl"><section className="results-card" aria-labelledby="sessions-title"><p className="eyebrow">Syllo · מרצה</p><h1 id="sessions-title">מפגשי הוראה</h1><p className="privacy-note">נתוני מרצה בלבד. זמן ארוך מהמתוכנן הוא אות להתבוננות, לא אבחנה של קושי.</p><p><Link href="/lecturer/learning">נתוני שימוש אנונימיים במערכים ←</Link></p>{sessions.length === 0 ? <p className="empty-results">עדיין לא סונכרנו מפגשים.</p> : <table><thead><tr><th>תאריך</th><th>שיעור</th><th>משך פעיל</th><th>שקפים</th><th>סימונים</th><th>סונכרן</th></tr></thead><tbody>{sessions.map((session) => <tr key={session.sessionId}><td><Link href={`/lecturer/sessions/${session.sessionId}`}>{date(session.startedAt)}</Link></td><td>{session.lessonId}</td><td dir="ltr">{minutes(session.totalDurationMs)}</td><td>{session.slidesShown}</td><td>{session.annotationsCount}</td><td>{date(session.syncedAt)}</td></tr>)}</tbody></table>}</section></main>;
  } catch { return <main className="page-shell" dir="rtl"><section className="results-card"><h1>המפגשים אינם זמינים כרגע</h1><p>יש לוודא שמסד הנתונים הוגדר ושמיגרציית מפגשי המרצה הורצה.</p></section></main>; }
}
