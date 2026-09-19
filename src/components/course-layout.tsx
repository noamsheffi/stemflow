import Link from "next/link";

import { course } from "../lib/course-data";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="course-shell">
      <aside className="course-sidebar" aria-label="ניווט הקורס">
        <Link className="course-brand" href="/course/communication-systems">
          <span className="course-mark" aria-hidden="true">S</span>
          <span><strong>Syllo</strong><small>{course.title}</small></span>
        </Link>
        <p className="course-nav-label">הקורס שלי</p>
        <nav className="course-nav">
          <Link href="/course/communication-systems"><span aria-hidden="true">⌂</span>בית הקורס</Link>
          <Link href="/lessons"><span aria-hidden="true">▤</span>מערכי שיעור</Link>
        </nav>
        <p className="course-nav-label">ידע וחזרה</p>
        <nav className="course-nav">
          <Link href="/formulas"><span aria-hidden="true">ƒ</span>נוסחאון</Link>
          <Link href="/concepts"><span aria-hidden="true">⌘</span>מפת מושגים</Link>
        </nav>
        <div className="course-sidebar-footer"><strong>{course.title}</strong><span dir="ltr">{course.titleEnglish}</span></div>
      </aside>
      <section className="course-workspace">
        <header className="course-mobile-header">
          <Link className="course-mobile-brand" href="/course/communication-systems"><span className="course-mark" aria-hidden="true">S</span><strong>Syllo</strong></Link>
          <nav className="course-mobile-nav" aria-label="ניווט הקורס">
            <Link href="/course/communication-systems">בית</Link><Link href="/lessons">שיעורים</Link><Link href="/formulas">נוסחאון</Link><Link href="/concepts">מושגים</Link>
          </nav>
        </header>
        <main className="course-main">{children}</main>
      </section>
    </div>
  );
}
