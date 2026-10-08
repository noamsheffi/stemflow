import Link from "next/link";
import { workspace } from "../lib/course-data";
import styles from "../app/lecturer/sessions/lecturer-home.module.css";

/** Lecturer-only application frame, sharing the lecturer dashboard's visual system. */
export default function LecturerWorkspace({ children, current = "lessons", breadcrumb = "מערכי שיעור" }: { children: React.ReactNode; current?: "lessons" | "sessions"; breadcrumb?: string }) {
  const activeCourses = workspace.courses.filter((course) => course.status === "active");
  const activeCourse = activeCourses[0];
  return <main className={styles.app} dir="rtl">
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/lecturer/sessions"><span>∞</span><b>Syllo</b><small>מרצה</small></Link>
      <div className={styles.courseSwitch}><span className={styles.courseIcon}>מת</span><div><b>{activeCourse?.title ?? "הקורסים שלי"}</b><small>{activeCourses.length} קורסים פעילים</small></div><span className={styles.chevron}>⌄</span></div>
      <p className={styles.navLabel}>סביבת המרצה</p>
      <nav className={styles.nav} aria-label="ניווט סביבת מרצה">
        <Link className={current === "lessons" ? styles.navActive : ""} href="/lecturer/sessions#lessons"><span>▦</span>מערכי שיעור</Link>
        <Link className={current === "sessions" ? styles.navActive : ""} href="/lecturer/sessions#sessions"><span>◷</span>מפגשי הוראה</Link>
        <Link href={`/course/${activeCourse?.courseId ?? "communication-systems"}/formulas`}><span>ƒ</span>נוסחאון</Link>
        <Link href={`/course/${activeCourse?.courseId ?? "communication-systems"}/concepts`}><span>⌘</span>מפת מושגים</Link>
      </nav>
      <div className={styles.sidebarNote}><span className={styles.statusDot} />הנתונים נשמרים ומתעדכנים מסנכרון המרצה</div>
      <div className={styles.profile}><span className={styles.avatar}>{Array.from(activeCourse?.lecturer ?? "מ")[0]}</span><span><b>{activeCourse?.lecturer ?? "סביבת מרצה"}</b><small>נתוני הוראה אישיים</small></span><Link href="/api/auth/logout" aria-label="יציאה">↪</Link></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}><div><Link href="/lecturer/sessions">סביבת המרצה</Link><b>›</b><strong>{breadcrumb}</strong></div><Link className={styles.adminLink} href="/admin">ניהול מערכת ↗</Link></header>
      <div className={styles.content}>{children}</div>
    </section>
  </main>;
}
