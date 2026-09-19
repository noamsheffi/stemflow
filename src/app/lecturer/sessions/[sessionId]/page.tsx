import Link from "next/link";
import { notFound } from "next/navigation";
import { getLecturerSession } from "../../../../lib/lecturer-session-results";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = { PASS: "✓ עבר טוב", HARD: "! דרש יותר הסבר", DEEPEN: "★ צריך להעמיק", REVISIT: "↻ לחזור לזה" };
const fmt = (value: number) => `${Math.floor(value / 60000)}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}`;
const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));

export default async function LecturerSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params; const session = await getLecturerSession(sessionId); if (!session) notFound();
  const counts = Object.fromEntries(["PASS", "HARD", "DEEPEN", "REVISIT"].map(type => [type, session.slides.flatMap(slide => slide.annotations).filter(annotation => annotation.type === type).length]));
  const over = session.slides.filter(slide => slide.plannedDurationMinutes !== null && slide.actualActiveDurationMs > slide.plannedDurationMinutes * 60000).length;
  return <main className="page-shell" dir="rtl"><section className="results-card" aria-labelledby="session-title"><p className="eyebrow">Syllo · מפגש הוראה</p><h1 id="session-title">{session.lessonId}</h1><p className="privacy-note">התחלה: {date(session.startedAt)} · זמן הוראה פעיל: <bdi dir="ltr">{fmt(session.totalDurationMs)}</bdi></p><p className="privacy-note">הזמן הארוך מהמתוכנן הוא אות להתבוננות, לא אבחנה של קושי.</p><div className="lecturer-summary" aria-label="סיכום מפגש"><span>✓ {counts.PASS}</span><span>! {counts.HARD}</span><span>★ {counts.DEEPEN}</span><span>↻ {counts.REVISIT}</span><span>{over} מעל המתוכנן</span></div>{session.slides.some(slide => slide.idSource === "index-fallback") && <p className="lecturer-warning">זהות חלק מהשקפים נוצרה לפי מיקום; ייתכן שהשתנתה בין גרסאות המצגת.</p>}<table><thead><tr><th>שקף</th><th>מתוכנן</th><th>פעיל בפועל</th><th>סימון</th><th>סומן ב־</th></tr></thead><tbody>{session.slides.map(slide => { const isOver = slide.plannedDurationMinutes !== null && slide.actualActiveDurationMs > slide.plannedDurationMinutes * 60000; return <tr key={slide.slideNumber} className={isOver ? "lecturer-signal" : undefined}><td>{slide.slideNumber}</td><td dir="ltr">{slide.plannedDurationMinutes === null ? "לא זמין" : `${slide.plannedDurationMinutes}:00`}</td><td dir="ltr">{fmt(slide.actualActiveDurationMs)}</td><td>{slide.annotations.map(a => labels[a.type]).join(" · ") || "—"}</td><td>{slide.annotations.map(a => date(a.timestamp)).join("\n") || "—"}</td></tr>; })}</tbody></table><p><Link href="/lecturer/sessions">חזרה למפגשים</Link></p></section></main>;
}
