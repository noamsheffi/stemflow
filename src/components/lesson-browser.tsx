"use client";

import { useState } from "react";
import { EmptyContent, LessonCard } from "./course-content";
import LessonOpenLink from "./lesson-open-link";
import CollectionToolbar from "./collection-toolbar";
import type { CourseLesson } from "../lib/course-data";
import { lessonHref } from "../lib/course-data";
import styles from "./lesson-browser.module.css";

export default function LessonBrowser({ lessons }: { lessons: CourseLesson[] }) {
  const [query, setQuery] = useState("");
  const [lessonId, setLessonId] = useState("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = lessons.filter((lesson) => (lessonId === "all" || lesson.lessonId === lessonId) && terms.every((term) => `${lesson.number} ${lesson.title} ${lesson.topics.join(" ")}`.toLocaleLowerCase().includes(term)));
  const reset = () => { setQuery(""); setLessonId("all"); };
  return <>
    <section className={styles.controls} aria-label="חיפוש וסינון מערכי שיעור">
      <label className={styles.search}>חיפוש במערכי שיעור<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="שם שיעור או נושא — למשל אפנון, Wi‑Fi או משוב" /></label>
      <label className={styles.selectLabel}>סינון לפי שיעור<select value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="all">כל השיעורים</option>{lessons.map((lesson) => <option key={lesson.lessonId} value={lesson.lessonId}>שיעור {lesson.number.toString().padStart(2, "0")} · {lesson.title}</option>)}</select></label>
    </section>
    <CollectionToolbar ariaLabel="אופן התצוגה" selectedView={view} views={[{ value: "cards", label: "כרטיסיות" }, { value: "table", label: "טבלה" }]} onViewChange={setView} summary={`מוצגים ${filtered.length} מתוך ${lessons.length} מערכי שיעור`} onReset={reset} resetLabel="איפוס חיפוש וסינון" />
    {filtered.length === 0 ? <EmptyContent title="לא נמצאו מערכי שיעור מתאימים">אפשר לשנות את החיפוש או לאפס את הסינון.</EmptyContent> : <div className={styles.content}>{view === "cards" ? (
      <section className="lesson-list" aria-label="מערכי שיעור בתצוגת כרטיסיות">{filtered.map((lesson) => <LessonCard key={lesson.lessonId} lesson={lesson} />)}</section>
    ) : (
      <div className={styles.tableScroll}>
        <table className={styles.lessonTable}>
          <caption className={styles.visuallyHidden}>מערכי השיעור התואמים לחיפוש ולסינון</caption>
          <thead><tr><th scope="col">שיעור</th><th scope="col">נושאים</th><th scope="col">קישורים</th></tr></thead>
          <tbody>{filtered.map((lesson) => {
            const lessonPlan = lesson.resources.find((resource) => resource.kind === "lesson-html");
            const homePractice = lesson.resources.find((resource) => resource.kind === "exercise");
            return <tr key={lesson.lessonId}>
              <th scope="row"><span className={styles.lessonNumber}>{lesson.number.toString().padStart(2, "0")}</span><span className={styles.lessonTitle}>{lesson.title}</span></th>
              <td>{lesson.topics.length ? lesson.topics.join(" · ") : "—"}</td>
              <td><div className={styles.tableActions}>
                {lessonPlan && <LessonOpenLink className="lesson-card-action primary" href={lessonPlan.href} lessonId={lesson.lessonId} resourceId={lessonPlan.resourceId} resourceKind={lessonPlan.kind}>למערך השיעור</LessonOpenLink>}
                {homePractice && <LessonOpenLink className="lesson-card-action" href={homePractice.href} lessonId={lesson.lessonId} resourceId={homePractice.resourceId} resourceKind={homePractice.kind}>לתרגול אינטראקטיבי</LessonOpenLink>}
                {!lessonPlan && <LessonOpenLink className="lesson-card-action primary" href={lessonHref(lesson)} lessonId={lesson.lessonId} resourceId="lesson-main-html">לחומרי השיעור</LessonOpenLink>}
              </div></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    )}</div>}
  </>;
}
