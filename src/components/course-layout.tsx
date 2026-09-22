"use client";

import Link from "next/link";
import LogoutButton from "./logout-button";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { course, courseAppPath, getLesson } from "../lib/course-data";
import LectureExtension from "./lecture-extension";

const sidebarStorageKey = "syllo:course-sidebar-collapsed";

function getStoredSidebarState() {
  try {
    return window.localStorage.getItem(sidebarStorageKey) === "true";
  } catch {
    return false;
  }
}

function breadcrumbLabel(pathname: string) {
  if (pathname.includes("/lessons/")) {
    const lessonId = pathname.split("/").at(-1) ?? "";
    const lesson = getLesson(`lesson-${lessonId}`) ?? getLesson(lessonId);
    return `שיעור ${lesson?.number.toString().padStart(2, "0") ?? lessonId}`;
  }
  if (pathname.endsWith("/lessons") || pathname === "/lessons") return "מערכי שיעור";
  if (pathname.includes("/surveys/")) return "שאלון 02 · אחרי השיעור";
  if (pathname.includes("/formulas")) return "נוסחאון";
  if (pathname.includes("/concepts")) return "מפת מושגים";
  return null;
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useLayoutEffect(() => {
    setSidebarCollapsed(getStoredSidebarState());
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const nextState = !collapsed;
      try {
        window.localStorage.setItem(sidebarStorageKey, String(nextState));
      } catch {
        // The sidebar still works when browser storage is unavailable.
      }
      return nextState;
    });
  };
  const context = breadcrumbLabel(pathname);
  const isConceptMap = pathname.endsWith("/concepts") || pathname === "/concepts";
  const isCourseCollection = pathname.endsWith("/lessons") || pathname.endsWith("/formulas");
  const navigationClass = (section = "") => {
    const href = courseAppPath(section);
    return pathname === href || (section && pathname.startsWith(`${href}/`)) ? "active" : undefined;
  };
  const productNavigation = <nav className="product-nav" aria-label="ניווט Syllo"><Link href="/"><span aria-hidden="true">⌂</span><span className="nav-label">בית</span></Link><Link href="/workspace"><span aria-hidden="true">▦</span><span className="nav-label">הקורסים שלי</span></Link><LogoutButton /></nav>;
  const courseNavigation = <nav className="course-nav" aria-label={`ניווט ${course.title}`}><Link className={navigationClass()} href={courseAppPath()} aria-current={navigationClass() ? "page" : undefined}><span aria-hidden="true">⌂</span><span className="nav-label">בית הקורס</span></Link><Link className={navigationClass("lessons")} href={courseAppPath("lessons")} aria-current={navigationClass("lessons") ? "page" : undefined}><span aria-hidden="true">▤</span><span className="nav-label">מערכי שיעור</span></Link><Link className={navigationClass("formulas")} href={courseAppPath("formulas")} aria-current={navigationClass("formulas") ? "page" : undefined}><span aria-hidden="true">ƒ</span><span className="nav-label">נוסחאון</span></Link><Link className={navigationClass("concepts")} href={courseAppPath("concepts")} aria-current={navigationClass("concepts") ? "page" : undefined}><span aria-hidden="true">⌘</span><span className="nav-label">מפת מושגים</span></Link></nav>;

  return <div className={`course-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
    <LectureExtension />
    <button
      className="course-sidebar-toggle"
      type="button"
      onClick={toggleSidebar}
      aria-expanded={!sidebarCollapsed}
      aria-label={sidebarCollapsed ? "פתיחת סרגל הניווט" : "קיפול סרגל הניווט"}
      title={sidebarCollapsed ? "פתיחת ניווט" : "קיפול ניווט"}
    >
      <span aria-hidden="true" dir="ltr">{sidebarCollapsed ? "←" : "→"}</span>
    </button>
    <aside className="course-sidebar" aria-label="ניווט סביבת הלמידה">
      <Link className="course-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="132" height="56" /></Link>
      <Link className="course-rail-brand" href="/" aria-label="Syllo — דף הבית"><span aria-hidden="true" /></Link>
      {productNavigation}
      <div className="course-divider" />
      <p className="course-nav-label">קורס</p>
      <Link className="course-context" href={courseAppPath()}><strong>{course.title}</strong><span dir="ltr">{course.courseNumber}</span></Link>
      {courseNavigation}
    </aside>
    <section className="course-workspace">
      <header className="course-mobile-header">
        <div className="mobile-product-row"><Link className="course-mobile-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="112" height="48" /></Link>{productNavigation}</div>
        <p className="mobile-course-context">{course.title}</p>{courseNavigation}
      </header>
      <main className={`course-main${isConceptMap ? " course-main-concept-map" : ""}${isCourseCollection ? " course-main-wide" : ""}`}>
        <nav className="breadcrumbs" aria-label="פירורי לחם"><Link href="/">Syllo</Link><span aria-hidden="true">/</span><Link href={courseAppPath()}>{course.title}</Link>{context && <><span aria-hidden="true">/</span><span>{context}</span></>}</nav>
        {children}
      </main>
    </section>
  </div>;
}
