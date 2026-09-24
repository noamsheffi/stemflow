"use client";

import Link from "next/link";
import LogoutButton from "./logout-button";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { course, courseAppPath, getLesson, workspace } from "../lib/course-data";
import CourseTree from "./course-tree";

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
  if (pathname.includes("/materials")) return "חומרי עזר";
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
  const isConceptMap = pathname.endsWith("/concepts") || pathname === "/concepts";
  const isCourseCollection = pathname.endsWith("/lessons") || pathname.endsWith("/formulas") || pathname.endsWith("/materials");
  const navigationClass = (section = "") => {
    const href = courseAppPath(section);
    return pathname === href || (section && pathname.startsWith(`${href}/`)) ? "active" : undefined;
  };
  const productNavigation = <nav className="product-nav" aria-label="ניווט Syllo"><Link href="/"><span aria-hidden="true">⌂</span><span className="nav-label">בית</span></Link></nav>;
  const courseNavigation = <nav className="course-nav" aria-label={`ניווט ${course.title}`}>
    <Link className={navigationClass()} href={courseAppPath()} aria-current={navigationClass() ? "page" : undefined}><span aria-hidden="true">⌂</span><span>בית הקורס</span></Link>
    <Link className={navigationClass("lessons")} href={courseAppPath("lessons")} aria-current={navigationClass("lessons") ? "page" : undefined}><span aria-hidden="true">▤</span><span>מערכי שיעור</span></Link>
    <Link className={navigationClass("materials")} href={courseAppPath("materials")} aria-current={navigationClass("materials") ? "page" : undefined}><span aria-hidden="true">▰</span><span>חומרי עזר</span></Link>
    <Link className={navigationClass("formulas")} href={courseAppPath("formulas")} aria-current={navigationClass("formulas") ? "page" : undefined}><span aria-hidden="true">ƒ</span><span>נוסחאון</span></Link>
    <Link className={navigationClass("concepts")} href={courseAppPath("concepts")} aria-current={navigationClass("concepts") ? "page" : undefined}><span aria-hidden="true">⌘</span><span>מפת מושגים</span></Link>
  </nav>;

  return <div className={`course-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
    <aside className="course-sidebar" aria-label="ניווט סביבת הלמידה">
      <Link className="course-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="132" height="56" /></Link>
      <Link className="course-rail-brand" href="/" aria-label="Syllo — דף הבית"><span aria-hidden="true" /></Link>
      {productNavigation}
      <div className="course-divider" />
      <CourseTree courses={workspace.courses} />
      <div className="course-sidebar-actions">
        <LogoutButton variant="sidebar" compact={sidebarCollapsed} />
        <button
          className="course-sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "פתיחת סרגל הניווט" : "קיפול סרגל הניווט"}
          title={sidebarCollapsed ? "פתיחת ניווט" : "קיפול ניווט"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M9 4v16" />{sidebarCollapsed ? <path d="M13 12h5M16 9l3 3-3 3" /> : <path d="M11 12H6M8 9l-3 3 3 3" />}</svg>
        </button>
      </div>
    </aside>
    <section className="course-workspace">
      <header className="course-mobile-header">
        <div className="mobile-product-row"><Link className="course-mobile-brand" href="/" aria-label="Syllo — דף הבית"><img className="brand-logo" src="/brand/syllo-logo.png" alt="Syllo" width="112" height="48" /></Link><div className="mobile-product-actions">{productNavigation}<LogoutButton /></div></div>
        <p className="mobile-course-context">{course.title}</p>{courseNavigation}
      </header>
      <main className={`course-main${isConceptMap ? " course-main-concept-map" : ""}${isCourseCollection ? " course-main-wide" : ""}`}>
        {children}
      </main>
    </section>
  </div>;
}
