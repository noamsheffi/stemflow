"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { conceptMap } from "../lib/concept-map";
import { concepts, course, formulas, getLesson, workspace } from "../lib/course-data";
import FormulaMath from "./formula-math";
import CourseTree from "./course-tree";
import styles from "./student-workspace.module.css";

const contextKey = "syllo:context-panel-open";
const navigationKey = "syllo:course-navigation-collapsed";
const appCourseHref = (courseId: string, section = "") => `/course/${courseId}${section ? `/${section}` : ""}`;

function currentRoute(pathname: string) {
  const match = pathname.match(/^\/course\/([^/]+)(?:\/(.*))?$/);
  const courseId = match?.[1] ?? course.courseId;
  const rest = match?.[2] ?? "";
  const activeCourse = workspace.courses.find((item) => item.courseId === courseId) ?? course;
  const lessonMatch = rest.match(/^lessons\/(lesson-[^/]+)(?:\/(slides|practice|summary))?/);
  const lesson = lessonMatch && courseId === course.courseId ? getLesson(lessonMatch[1]) : undefined;
  const phase = lessonMatch?.[2];
  return { courseId, course: activeCourse, rest, lesson, phase };
}

function BreadcrumbBar({ pathname, contextOpen, contextAvailable, onToggleContext }: { pathname: string; contextOpen: boolean; contextAvailable: boolean; onToggleContext: () => void }) {
  const route = currentRoute(pathname);
  const courseHref = appCourseHref(route.courseId);
  const crumbs: Array<{ label: string; href?: string }> = [{ label: route.course.title, href: courseHref }];
  if (route.lesson) {
    crumbs.push({ label: `שיעור ${String(route.lesson.number).padStart(2, "0")} · ${route.lesson.title}`, href: `${courseHref}/lessons/${route.lesson.lessonId}/slides` });
    if (route.phase) {
      const phaseLabel = route.phase === "slides" ? "בכיתה · מערך השיעור" : route.phase === "practice" ? "אחרי השיעור · תרגול אינטראקטיבי" : "לקראת השיעור הבא · רפלקציה";
      crumbs.push({ label: phaseLabel });
    }
  } else if (route.rest.startsWith("lessons")) crumbs.push({ label: "מערכי שיעור" });
  else if (route.rest.startsWith("formulas")) crumbs.push({ label: "נוסחאון" });
  else if (route.rest.startsWith("concepts")) crumbs.push({ label: "מפת מושגים" });
  else if (route.rest.startsWith("materials")) crumbs.push({ label: "חומרי עזר" });

  return <header className={styles.topBar}>
    <nav aria-label="פירורי לחם" className={styles.breadcrumbs}>
      {crumbs.map((crumb, index) => <span className={styles.crumbGroup} key={`${crumb.label}-${index}`}>
        {index > 0 && <span className={styles.crumbSeparator} aria-hidden="true">›</span>}
        {crumb.href && index < crumbs.length - 1 ? <Link href={crumb.href} className={styles.crumb}>{crumb.label}</Link> : <span className={styles.crumbCurrent} aria-current="page">{crumb.label}</span>}
      </span>)}
    </nav>
    <div className={styles.topBarActions}>
      {contextAvailable && <button type="button" className={`${styles.contextToggle} ${contextOpen ? styles.contextToggleActive : ""}`} onClick={onToggleContext} aria-expanded={contextOpen} aria-controls={contextOpen ? "syllo-context-panel" : undefined} aria-label={`${contextOpen ? "סגירת" : "פתיחת"} פאנל ההקשר`} title="פאנל הקשר">
        <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3" width="15" height="14" rx="1.5"/><path d="M7.5 3v14"/></svg>
      </button>}
    </div>
  </header>;
}

function ContextPanel({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const route = currentRoute(pathname);
  const selectedLesson = route.lesson;
  const lessonFormulas = selectedLesson ? formulas.filter((item) => selectedLesson.formulaIds.includes(item.formulaId)) : [];
  const lessonConcepts = selectedLesson ? concepts.filter((item) => selectedLesson.conceptIds.includes(item.conceptId)) : [];
  const [tab, setTab] = useState<"formulas" | "concepts" | "notes">("formulas");
  const tabOrder = ["formulas", "concepts", "notes"] as const;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const noteStorageKey = `syllo:lesson-note:${route.courseId}:${selectedLesson?.lessonId ?? "course"}`;
  const [note, setNote] = useState("");

  useEffect(() => {
    try { setNote(window.localStorage.getItem(noteStorageKey) ?? ""); }
    catch { setNote(""); }
  }, [noteStorageKey]);

  const saveNote = (value: string) => {
    setNote(value);
    try { window.localStorage.setItem(noteStorageKey, value); }
    catch { /* Notes remain editable if browser storage is disabled. */ }
  };

  return <aside className={styles.contextPanel} id="syllo-context-panel" aria-label="פאנל הקשר">
    <header className={styles.contextHeader}>
      <div><span className={styles.eyebrow}>{selectedLesson ? "בהקשר של השיעור" : "ספריית הקורס"}</span><h2>{selectedLesson ? `שיעור ${String(selectedLesson.number).padStart(2, "0")}` : "חומרי הקורס"}</h2></div>
      <button className={styles.iconButton} type="button" onClick={onClose} aria-label="סגירת פאנל ההקשר">×</button>
    </header>
    <div className={styles.contextTabs} role="tablist" aria-label="תוכן פאנל ההקשר" onKeyDown={(event) => {
      const currentIndex = tabOrder.indexOf(tab);
      const nextIndex = event.key === "ArrowLeft" ? (currentIndex + 1) % tabOrder.length : event.key === "ArrowRight" ? (currentIndex + tabOrder.length - 1) % tabOrder.length : event.key === "Home" ? 0 : event.key === "End" ? tabOrder.length - 1 : -1;
      if (nextIndex >= 0) {
        event.preventDefault();
        setTab(tabOrder[nextIndex]);
        tabRefs.current[nextIndex]?.focus();
      }
    }}>
      <button ref={(element) => { tabRefs.current[0] = element; }} type="button" role="tab" tabIndex={tab === "formulas" ? 0 : -1} id="context-tab-formulas" aria-controls="context-content" aria-selected={tab === "formulas"} onClick={() => setTab("formulas")}>נוסחאות <small dir="ltr">{selectedLesson ? lessonFormulas.length : formulas.length}</small></button>
      <button ref={(element) => { tabRefs.current[1] = element; }} type="button" role="tab" tabIndex={tab === "concepts" ? 0 : -1} id="context-tab-concepts" aria-controls="context-content" aria-selected={tab === "concepts"} onClick={() => setTab("concepts")}>מושגים <small dir="ltr">{selectedLesson ? lessonConcepts.length : concepts.length}</small></button>
      <button ref={(element) => { tabRefs.current[2] = element; }} type="button" role="tab" tabIndex={tab === "notes" ? 0 : -1} id="context-tab-notes" aria-controls="context-content" aria-selected={tab === "notes"} onClick={() => setTab("notes")}>הערות</button>
    </div>
    <div className={styles.contextBody} id="context-content" role="tabpanel" aria-labelledby={`context-tab-${tab}`}>
      {tab === "formulas" && <>
        {selectedLesson ? lessonFormulas.map((item) => <article className={styles.contextFormula} key={item.formulaId}><h3>{item.name}</h3><div dir="ltr"><FormulaMath tex={item.expression} /></div></article>) : <p className={styles.contextEmpty}>בחרו שיעור כדי לראות את הנוסחאות שלו בהקשר.</p>}
        <Link className={styles.contextMore} href={appCourseHref(route.courseId, "formulas")}>לנוסחאון המלא <span aria-hidden="true">←</span></Link>
      </>}
      {tab === "concepts" && <>
        {selectedLesson ? lessonConcepts.map((item) => {
          const detail = conceptMap.find((concept) => concept.id === item.conceptId);
          const parents = item.relatedConceptIds.map((id) => concepts.find((concept) => concept.conceptId === id)?.name).filter((name): name is string => Boolean(name));
          return <article className={styles.contextConcept} key={item.conceptId}><h3>{item.name}</h3>{detail?.english && <span dir="ltr">{detail.english}</span>}{parents.length > 0 && <p>נשען על: {parents.join(" · ")}</p>}</article>;
        }) : <p className={styles.contextEmpty}>בחרו שיעור כדי לראות את המושגים שלו בהקשר.</p>}
        <Link className={styles.contextMore} href={appCourseHref(route.courseId, "concepts")}>למפת המושגים <span aria-hidden="true">←</span></Link>
      </>}
      {tab === "notes" && <label className={styles.noteLabel}><span>{selectedLesson ? `הערות אישיות לשיעור ${String(selectedLesson.number).padStart(2, "0")}` : "הערות אישיות לקורס"}</span><textarea value={note} onChange={(event) => saveNote(event.target.value)} placeholder="כתבו לעצמכם הערה…" /></label>}
    </div>
    <p className={styles.localNote}>הערות נשמרות בדפדפן הזה בלבד.</p>
  </aside>;
}

export default function StudentWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = currentRoute(pathname);
  const [contextOpen, setContextOpen] = useState(true);
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);
  const contextAvailable = pathname !== "/workspace";
  const showContext = contextOpen && contextAvailable;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(contextKey);
      if (stored !== null) setContextOpen(stored === "true");
    } catch { /* The default open panel remains available without storage. */ }
  }, []);

  useEffect(() => {
    try {
      setNavigationCollapsed(window.localStorage.getItem(navigationKey) === "true");
    } catch { /* Navigation remains expanded if browser storage is disabled. */ }
  }, []);

  const toggleContext = () => setContextOpen((open) => {
    const next = !open;
    try { window.localStorage.setItem(contextKey, String(next)); }
    catch { /* The panel still toggles when browser storage is disabled. */ }
    return next;
  });

  const toggleNavigation = () => setNavigationCollapsed((collapsed) => {
    const next = !collapsed;
    try { window.localStorage.setItem(navigationKey, String(next)); }
    catch { /* The navigation still toggles when browser storage is disabled. */ }
    return next;
  });

  const mobileSections = [
    { label: "בית", href: appCourseHref(route.courseId) },
    { label: "שיעורים", href: appCourseHref(route.courseId, "lessons") },
    { label: "נוסחאון", href: appCourseHref(route.courseId, "formulas") },
    { label: "מושגים", href: appCourseHref(route.courseId, "concepts") },
    { label: "חומרי עזר", href: appCourseHref(route.courseId, "materials") },
  ];

  return <div className={`${styles.shell} syllo-student-app ${showContext ? styles.withContext : ""} ${navigationCollapsed ? styles.navCollapsed : ""}`}>
    <a className={styles.skipLink} href="#student-main">דילוג לתוכן</a>
    <CourseTree courses={workspace.courses} collapsed={navigationCollapsed} onToggleCollapsed={toggleNavigation} />
    <div className={styles.mainColumn}>
      <div className={styles.mobileHeader}>
        <Link href="/workspace" className={styles.mobileBrand} aria-label="Syllo — סביבת הלמידה"><Image src="/brand/syllo-logo.png" width={1584} height={600} alt="Syllo" loading="eager" /></Link>
        <Link href="/workspace" className={styles.mobileCourse}>{route.course.title}</Link>
      </div>
      <nav className={styles.mobileNav} aria-label="ניווט בקורס">
        {mobileSections.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <BreadcrumbBar pathname={pathname} contextOpen={contextOpen} contextAvailable={contextAvailable} onToggleContext={toggleContext} />
      <main className={styles.pageScroll} id="student-main" tabIndex={-1}>
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
    {showContext && <ContextPanel pathname={pathname} onClose={() => {
      setContextOpen(false);
      try { window.localStorage.setItem(contextKey, "false"); } catch { /* no-op */ }
    }} />}
  </div>;
}
