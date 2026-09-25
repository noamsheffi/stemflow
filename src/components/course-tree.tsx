"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Course } from "../lib/course-data";
import { lessons } from "../lib/course-data";
import LogoutButton from "./logout-button";
import styles from "./student-workspace.module.css";

const phases = [
  { id: "slides", number: "01", phase: "בכיתה", label: "מערך השיעור" },
  { id: "practice", number: "02", phase: "אחרי השיעור", label: "תרגול אינטראקטיבי" },
  { id: "summary", number: "03", phase: "לקראת השיעור הבא", label: "רפלקציה" },
] as const;

const courseHref = (courseId: string, section = "") => `/course/${courseId}${section ? `/${section}` : ""}`;

export default function CourseTree({ courses, collapsed = false, onToggleCollapsed }: { courses: Course[]; collapsed?: boolean; onToggleCollapsed?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const currentCourse = courses.find((item) => pathname === courseHref(item.courseId) || pathname.startsWith(`${courseHref(item.courseId)}/`))
    ?? courses.find((item) => item.status === "active")
    ?? courses[0];
  const currentLesson = lessons.find((lesson) => pathname.includes(`/lessons/${lesson.lessonId}`));

  useEffect(() => {
    if (currentLesson) setExpandedLessons((value) => ({ ...value, [currentLesson.lessonId]: true }));
  }, [currentLesson]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const courseLessons = currentCourse?.courseId === "communication-systems"
    ? lessons.filter((lesson) => currentCourse.lessonIds.includes(lesson.lessonId))
    : [];
  const filteredLessons = courseLessons.filter((lesson) => `${lesson.number} ${lesson.title} ${lesson.topics.join(" ")}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const activeSection = (section: string) => pathname === courseHref(currentCourse?.courseId ?? "communication-systems", section)
    || Boolean(section && pathname.startsWith(`${courseHref(currentCourse?.courseId ?? "communication-systems", section)}/`));
  const sectionItems = [
    { id: "", label: "בית הקורס", icon: "home" },
    { id: "formulas", label: "נוסחאון", icon: "formula", count: currentCourse?.formulaIds.length },
    { id: "concepts", label: "מפת מושגים", icon: "map", count: currentCourse?.conceptIds.length },
    { id: "materials", label: "חומרי עזר", icon: "folder", count: undefined },
  ];

  return (
    <aside id="course-navigation" className={`${styles.tree} ${collapsed ? styles.treeCompact : ""}`} aria-label="ניווט בקורס">
      <header className={styles.treeBrandRow}>
        {onToggleCollapsed && <button type="button" className={styles.navCollapseButton} onClick={onToggleCollapsed} aria-expanded={!collapsed} aria-controls="course-navigation" aria-label={`${collapsed ? "הרחבת" : "צמצום"} פאנל הניווט`} title={`${collapsed ? "הרחבת" : "צמצום"} פאנל הניווט`}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3" width="15" height="14" rx="1.5"/><path d="M7.5 3v14M11 10h3m-1.5-1.5L14 10l-1.5 1.5"/></svg>
        </button>}
        <Link href="/workspace" className={styles.treeBrand} aria-label="Syllo — סביבת הלמידה">
          <Image src="/brand/syllo-logo.png" width={1584} height={600} alt="Syllo" loading="eager" />
        </Link>
        <Link href="/workspace" className={styles.compactBrand} aria-label="Syllo — סביבת הלמידה" title="Syllo">
          <Image src="/brand/syllo-logo.png" width={1584} height={600} alt="" />
        </Link>
      </header>
      {collapsed && <nav className={styles.compactCourses} aria-label="בחירת קורס">
        {courses.map((course) => <Link key={course.courseId} className={`${styles.compactCourse} ${currentCourse?.courseId === course.courseId ? styles.compactCourseActive : ""}`} href={courseHref(course.courseId)} aria-label={course.title} aria-current={currentCourse?.courseId === course.courseId ? "page" : undefined} title={course.title}>{course.title.replace(/\s+/g, "").slice(0, 2)}</Link>)}
      </nav>}
      <div className={styles.courseHeading}>
        <span className={styles.courseCode} dir="ltr">{currentCourse?.courseNumber ?? "Syllo"}</span>
        <label className={styles.courseSelector}>
          <span className={styles.srOnly}>בחירת קורס</span>
          <select className={styles.courseSelect} value={currentCourse?.courseId ?? ""} onChange={(event) => router.push(courseHref(event.target.value))} aria-label="בחירת קורס">
            {courses.map((course) => <option key={course.courseId} value={course.courseId}>{course.title}</option>)}
          </select>
          <span className={styles.courseSelectChevron} aria-hidden="true">⌄</span>
        </label>
      </div>

      <div className={styles.treeSearch}>
        <button type="button" className={styles.searchToggle} aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
          <span aria-hidden="true">⌕</span><span>חיפוש בקורס</span><kbd dir="ltr">⌘ K</kbd>
        </button>
        {searchOpen && <label className={styles.searchInputLabel}>
          <span className={styles.srOnly}>חיפוש שיעור</span>
          <input type="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="שם שיעור או נושא" />
        </label>}
      </div>

      <nav className={styles.treeScroll} aria-label="תוכן הקורס">
        <ul className={styles.treeList}>
          <li><Link className={`${styles.treeLink} ${activeSection("") ? styles.active : ""}`} href={courseHref(currentCourse?.courseId ?? "communication-systems")} aria-label="בית הקורס" title="בית הקורס" aria-current={activeSection("") ? "page" : undefined}>
            <span className={styles.navIcon} aria-hidden="true">⌂</span><span>בית הקורס</span>
          </Link></li>
        </ul>

        <p className={styles.treeSectionHeading}>מערכי שיעור</p>
        {filteredLessons.length ? <ul className={styles.treeList}>
          {filteredLessons.map((lesson) => {
            const expanded = expandedLessons[lesson.lessonId] ?? currentLesson?.lessonId === lesson.lessonId;
            const lessonPath = courseHref(currentCourse?.courseId ?? "communication-systems", `lessons/${lesson.lessonId}`);
            const lessonActive = pathname.startsWith(lessonPath);
            const childId = `lesson-phases-${lesson.lessonId}`;
            return <li className={styles.lessonTreeItem} key={lesson.lessonId}>
              <div className={`${styles.lessonTreeRow} ${lessonActive ? styles.lessonCurrent : ""}`}>
                <span className={styles.statusDot} aria-hidden="true" />
                <span className={styles.srOnly}>נתוני התקדמות אישיים לשיעור הזה אינם זמינים.</span>
                <span className={styles.lessonNumber} dir="ltr">{String(lesson.number).padStart(2, "0")}</span>
                <Link href={lesson.lessonId === "lesson-04" ? lessonPath : `${lessonPath}/slides`} className={styles.compactLessonLink} aria-label={`שיעור ${lesson.number}: ${lesson.title}`} title={lesson.title}>{String(lesson.number).padStart(2, "0")}</Link>
                <Link href={lesson.lessonId === "lesson-04" ? lessonPath : `${lessonPath}/slides`} className={styles.lessonName} aria-current={lessonActive ? "page" : undefined}>{lesson.title}</Link>
                <button type="button" className={styles.disclosure} aria-label={`${expanded ? "סגירת" : "פתיחת"} שלבי שיעור ${lesson.number}`} aria-expanded={expanded} aria-controls={childId} onClick={() => setExpandedLessons((value) => ({ ...value, [lesson.lessonId]: !expanded }))}>
                  <span aria-hidden="true">{expanded ? "⌄" : "⌃"}</span>
                </button>
              </div>
              <ul className={styles.phaseList} id={childId} hidden={!expanded}>
                {phases.map((phase) => {
                  const href = `${lessonPath}/${phase.id}`;
                  const active = pathname === href;
                  return <li key={phase.id}><Link href={href} className={`${styles.phaseLink} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
                    <span className={styles.phaseNumber} dir="ltr">{phase.number}</span><span className={styles.phaseLabel}>{phase.label}</span>
                  </Link></li>;
                })}
              </ul>
            </li>;
          })}
        </ul> : <p className={styles.emptyTree}>{query ? "לא נמצאו שיעורים" : "עדיין אין שיעורים רשומים בקורס הזה"}</p>}

        <p className={styles.treeSectionHeading}>ספריית הקורס</p>
        <ul className={styles.treeList}>
          {sectionItems.filter((item) => item.id && currentCourse?.sections.includes(item.id as "formulas" | "concepts" | "materials")).map((item) => {
            const href = courseHref(currentCourse?.courseId ?? "communication-systems", item.id);
            const active = activeSection(item.id);
            return <li key={item.id}><Link className={`${styles.treeLink} ${active ? styles.active : ""}`} href={href} aria-label={item.label} title={item.label} aria-current={active ? "page" : undefined}>
              <span className={styles.navIcon} aria-hidden="true">{item.icon === "formula" ? "ƒ" : item.icon === "map" ? "⌘" : "▤"}</span>
              <span>{item.label}</span>{item.count != null && <span className={styles.treeCount} dir="ltr">{item.count}</span>}
            </Link></li>;
          })}
        </ul>
      </nav>

      <footer className={styles.treeFooter}>
        <Link href="/workspace" className={styles.profileLink} aria-label="הגדרות סביבת הלמידה">
          <span className={styles.profileAvatar} aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.4 3-5 6.5-5s5.8 1.6 6.5 5"/></svg></span>
          <span>סביבת הלמידה</span>
        </Link>
        <LogoutButton variant="sidebar" compact={collapsed} />
      </footer>
    </aside>
  );
}

export { phases as coursePhases };
