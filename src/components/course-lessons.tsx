"use client";

import Link from "next/link";
import { useState } from "react";
import { course, lessons } from "../lib/course-data";
import styles from "./student-workspace.module.css";

export default function CourseLessons() {
  const [query, setQuery] = useState("");
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = lessons.filter((lesson) => terms.every((term) => `${lesson.number} ${lesson.title} ${lesson.topics.join(" ")}`.toLocaleLowerCase().includes(term)));

  return <>
    <header className={styles.pageHeading}><p className={styles.pageKicker}>{course.title} · <span dir="ltr">{course.courseNumber}</span></p><h1>מערכי שיעור</h1><p>כל שיעור מחבר בין מערך השיעור, תרגול וחומרי העזר הקשורים אליו.</p></header>
    <div className={styles.searchControls}>
      <label className={styles.searchField}><span aria-hidden="true">⌕</span><span className={styles.srOnly}>חיפוש במערכי שיעור</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש לפי שיעור או נושא" /></label>
      <span className={styles.resultCount} role="status" aria-live="polite">{filtered.length} מתוך {lessons.length} שיעורים</span>
    </div>
    {filtered.length ? <section className={styles.syllabus} aria-label="רשימת מערכי שיעור"><div className={styles.syllabusRows}>
      {filtered.map((lesson) => <article className={styles.syllabusRow} key={lesson.lessonId}>
        <span className={styles.syllabusNumber} dir="ltr">{String(lesson.number).padStart(2, "0")}</span>
        <span className={styles.syllabusText}><strong>{lesson.title}</strong><small>{lesson.topics.join(" · ")} · {lesson.resources.length} משאבים</small></span>
        <Link className={styles.materialLink} href={`/course/${course.courseId}/lessons/${lesson.lessonId}/slides`}>פתיחת שיעור</Link>
      </article>)}
    </div></section> : <p className={styles.emptyState}>לא נמצאו שיעורים מתאימים לחיפוש.</p>}
  </>;
}
