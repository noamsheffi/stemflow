import Link from "next/link";
import { lessons, workspace } from "../../../lib/course-data";
import { getLecturerSessions } from "../../../lib/lecturer-session-results";
import { getLearningSummaries } from "../../../lib/student-learning-results";
import styles from "./lecturer-home.module.css";

export const dynamic = "force-dynamic";

const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));
const duration = (value: number) => `${Math.floor(value / 60_000)}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}`;

export default async function LecturerHomePage() {
  const [sessionsResult, learningResult] = await Promise.allSettled([getLecturerSessions(), getLearningSummaries()]);
  const sessionsAvailable = sessionsResult.status === "fulfilled";
  const sessions = sessionsAvailable ? sessionsResult.value : [];
  const learning = learningResult.status === "fulfilled" ? learningResult.value.lessons : [];
  const analyticsAvailable = learningResult.status === "fulfilled";
  const lessonStats = new Map(learning.map((item) => [`${item.courseId}:${item.lessonId}`, item]));
  const latestSession = new Map<string, (typeof sessions)[number]>();
  for (const session of sessions) if (!latestSession.has(`${session.courseId}:${session.lessonId}`)) latestSession.set(`${session.courseId}:${session.lessonId}`, session);
  const opens = learning.reduce((sum, item) => sum + Number(item.starts), 0);
  const completions = learning.reduce((sum, item) => sum + Number(item.completions), 0);
  const views = learning.reduce((sum, item) => sum + Number(item.slideViews), 0);
  const gaConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID);
  const activeCourses = workspace.courses.filter((course) => course.status === "active");

  return <main className={styles.app} dir="rtl">
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/lecturer/sessions"><span>∞</span><b>Syllo</b><small>מרצה</small></Link>
      <div className={styles.courseSwitch}><span className={styles.courseIcon}>מת</span><div><b>{activeCourses.length === 1 ? activeCourses[0].title : "הקורסים שלי"}</b><small>{activeCourses.length} קורסים פעילים</small></div><span className={styles.chevron}>⌄</span></div>
      <p className={styles.navLabel}>סביבת המרצה</p>
      <nav className={styles.nav} aria-label="ניווט סביבת מרצה">
        <a className={styles.navActive} href="#lessons"><span>▦</span>מערכי שיעור</a>
        <a href="#sessions"><span>◷</span>מפגשי הוראה</a>
        <a href="#sessions"><span>◷</span>מפגשי הוראה</a>
        <Link href={`/course/${activeCourses[0]?.courseId ?? "communication-systems"}/formulas`}><span>ƒ</span>נוסחאון</Link>
        <Link href={`/course/${activeCourses[0]?.courseId ?? "communication-systems"}/concepts`}><span>⌘</span>מפת מושגים</Link>
      </nav>
      <div className={styles.sidebarNote}><span className={styles.statusDot} />הנתונים נשמרים ומתעדכנים מסנכרון המרצה</div>
      <div className={styles.profile}><span className={styles.avatar}>{Array.from(activeCourses[0]?.lecturer ?? "מ")[0]}</span><span><b>{activeCourses[0]?.lecturer ?? "סביבת מרצה"}</b><small>נתוני הוראה אישיים</small></span><Link href="/api/auth/logout" aria-label="יציאה">↪</Link></div>
    </aside>

    <section className={styles.main}>
      <header className={styles.topbar}><div><span>סביבת המרצה</span><b>›</b><strong>בית</strong></div><Link className={styles.adminLink} href="/admin">ניהול מערכת ↗</Link></header>
      <div className={styles.content}>
        <header className={styles.heading}><div><p className={styles.eyebrow}>שלום {activeCourses[0]?.lecturer ?? "מרצה"}</p><h1>מרחב ההוראה שלך</h1><p>בחר שיעור כדי לפתוח את המערך, לעבור על סיכומי ההוראה ולראות נתוני למידה.</p></div><span className={styles.today}>{date(new Date().toISOString()).split(",")[0]}</span></header>

        <section className={styles.metrics} aria-label="נתוני שימוש מצטברים">
          <article><small>מערכי שיעור</small><b>{lessons.length}</b><span>זמינים בקורס</span><i>▦</i></article>
          <article><small>מפגשי הוראה</small><b>{sessionsAvailable ? sessions.length : "—"}</b><span>סונכרנו מהתוסף</span><i>◷</i></article>
          <article><small>פתיחות שיעור</small><b>{analyticsAvailable ? opens : "—"}</b><span>אירועי פתיחה שנמדדו</span><i>↗</i></article>
          <article><small>השלמות שיעור</small><b>{analyticsAvailable ? completions : "—"}</b><span>אירועי סיום שנמדדו</span><i>✓</i></article>
          <article><small>צפיות בשקפים</small><b>{analyticsAvailable ? views : "—"}</b><span>בכל המערכים</span><i>▤</i></article>
        </section>

        <section className={styles.analytics} aria-label="Google Analytics">
          <div className={styles.analyticsIcon}>G</div><div className={styles.analyticsCopy}><b>Google Analytics 4</b><span>{gaConfigured ? "תג המדידה של האתר מוגדר" : "תג מדידה לא מוגדר בסביבת הפרודקשן"}</span></div>
          <span className={`${styles.gaStatus} ${gaConfigured ? styles.gaOn : styles.gaOff}`}><i />{gaConfigured ? "מחובר" : "לא מחובר"}</span>
          {gaConfigured && <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noreferrer">פתיחת דוחות GA4 ↗</a>}
          <small>המדדים בעמוד זה מגיעים מאירועי שימוש אנונימיים שנשמרו ב־Syllo. נתוני GA4 המלאים נפתחים בחשבון Google Analytics; הצגתם בתוך Syllo דורשת חיבור Data API והרשאת קריאה.</small>
        </section>

        <div className={styles.sectionTitle} id="lessons"><div><p className={styles.eyebrow}>בחירת תוכן</p><h2>מערכי השיעור</h2><span>בחר שיעור כדי להתחיל ללמד או לחזור לנתוני מפגש קודם.</span></div><label>קורס<select aria-label="בחירת קורס" defaultValue={activeCourses[0]?.courseId ?? ""}>{activeCourses.map((course) => <option value={course.courseId} key={course.courseId}>{course.title} · {course.courseNumber}</option>)}</select></label></div>

        <div className={styles.lessonGrid}>
          {lessons.map((lesson) => {
            const course = activeCourses.find((item) => item.lessonIds.includes(lesson.lessonId));
            if (!course) return null;
            const stats = lessonStats.get(`${course.courseId}:${lesson.lessonId}`);
            const recent = latestSession.get(`${course.courseId}:${lesson.lessonId}`);
            return <article className={styles.lessonCard} key={lesson.lessonId}>
              <header><span className={styles.lessonNo}>{String(lesson.number).padStart(2, "0")}</span><span className={styles.lessonTag}>{recent ? "נלמד" : "מוכן להוראה"}</span></header>
              <p className={styles.lessonCourse}>{course.title} · {course.courseNumber}</p>
              <h3>{lesson.title}</h3><p className={styles.topics}>{lesson.topics.join(" · ")}</p>
              <div className={styles.lessonStats}>
                <span><b>{analyticsAvailable ? stats?.learners ?? 0 : "—"}</b><small>דפדפנים אנונימיים</small></span>
                <span><b>{analyticsAvailable ? stats?.sessions ?? 0 : "—"}</b><small>מפגשי למידה</small></span>
                <span><b>{analyticsAvailable ? stats?.slideViews ?? 0 : "—"}</b><small>צפיות בשקפים</small></span>
              </div>
              {lesson.hidden && <span className={styles.lessonTag}>מוסתר מסטודנטים</span>}
              {recent ? <div className={styles.recent}><span>מפגש הוראה אחרון</span><b>{date(recent.startedAt)}</b><small>{duration(recent.totalDurationMs)} זמן פעיל · {recent.slidesShown} שקפים · {recent.annotationsCount} סימונים</small></div> : <div className={styles.recent}><span>מפגש הוראה</span><b>עדיין אין מפגש מסונכרן</b><small>פתח מערך שיעור והפעל את תוסף המרצה במהלך ההוראה.</small></div>}
              <div className={styles.cardActions}><Link className={styles.primaryAction} href={`/lecturer/lessons/${lesson.lessonId}/slides`}>{lesson.hidden ? "תצוגת מרצה" : "פתיחת מערך השיעור"} <span>←</span></Link>{recent && <Link className={styles.secondaryAction} href={`/lecturer/sessions/${recent.sessionId}`}>סיכום וסטטיסטיקות</Link>}</div>
            </article>;
          })}
        </div>

        <section className={styles.bottomGrid} id="sessions">
          <div className={styles.panel}><div className={styles.panelHeading}><div><p className={styles.eyebrow}>מהכיתה</p><h2>מפגשי הוראה אחרונים</h2></div><span>{sessions.length} מפגשים</span></div>
            {sessions.length === 0 ? <p className={styles.empty}>עדיין לא סונכרנו מפגשים. המפגשים יופיעו כאן לאחר סיום שיעור וסנכרון התוסף.</p> : <div className={styles.sessionList}>{sessions.slice(0, 6).map((session) => <Link className={styles.sessionRow} href={`/lecturer/sessions/${session.sessionId}`} key={session.sessionId}><span className={styles.sessionDot}>◷</span><span><b>{lessons.find((lesson) => lesson.lessonId === session.lessonId)?.title ?? session.lessonId}</b><small>{date(session.startedAt)} · {duration(session.totalDurationMs)} · {session.slidesShown} שקפים</small></span><span className={styles.sessionMarks}>{session.annotationsCount} סימונים</span><b className={styles.rowArrow}>←</b></Link>)}</div>}
          </div>
          <div className={styles.panel}><div className={styles.panelHeading}><div><p className={styles.eyebrow}>נתוני למידה</p><h2>מדדי שימוש אנונימיים</h2></div><span className={analyticsAvailable ? styles.liveTag : styles.missingTag}><i />{analyticsAvailable ? "מתעדכן" : "לא זמין"}</span></div><p className={styles.panelText}>פתיחות, השלמות וצפיות במערכי השיעור. המדדים מבוססים על מזהי דפדפן אקראיים ואינם מזהים סטודנטים.</p><Link className={styles.panelLink} href="#lessons">בחירת מערך שיעור <span>←</span></Link><a className={styles.gaLink} href="https://analytics.google.com/analytics/web/" target="_blank" rel="noreferrer">מעבר לדוחות Google Analytics 4 ↗</a></div>
        </section>
        <footer className={styles.footer}>מידע על למידה מוצג באופן מצטבר ואנונימי · זמן וסימוני מרצה נשמרים לצד המפגש</footer>
      </div>
    </section>
  </main>;
}
