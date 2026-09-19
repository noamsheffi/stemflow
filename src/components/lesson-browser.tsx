"use client";

import { useState } from "react";
import { EmptyContent, LessonCard } from "./course-content";
import type { CourseLesson } from "../lib/course-data";
import styles from "./lesson-browser.module.css";

export default function LessonBrowser({ lessons }: { lessons: CourseLesson[] }) {
  const [query, setQuery] = useState("");
  const [lessonId, setLessonId] = useState("all");
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = lessons.filter((lesson) => (lessonId === "all" || lesson.lessonId === lessonId) && terms.every((term) => `${lesson.number} ${lesson.title} ${lesson.topics.join(" ")}`.toLocaleLowerCase().includes(term)));
  const reset = () => { setQuery(""); setLessonId("all"); };
  return <>
    <section className={styles.controls} aria-label="חיפוש וסינון מערכי שיעור">
      <label className={styles.search}>חיפוש במערכי שיעור<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="שם שיעור או נושא — למשל אפנון, Wi‑Fi או משוב" /></label>
      <label className={styles.selectLabel}>סינון לפי שיעור<select value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="all">כל השיעורים</option>{lessons.map((lesson) => <option key={lesson.lessonId} value={lesson.lessonId}>שיעור {lesson.number.toString().padStart(2, "0")} · {lesson.title}</option>)}</select></label>
    </section>
    <div className={styles.summary}><span role="status" aria-live="polite">מוצגים {filtered.length} מתוך {lessons.length} מערכי שיעור</span><button type="button" onClick={reset}>איפוס חיפוש וסינון</button></div>
    <section className="lesson-list" aria-label="מערכי שיעור">{filtered.length === 0 ? <EmptyContent title="לא נמצאו מערכי שיעור מתאימים">אפשר לשנות את החיפוש או לאפס את הסינון.</EmptyContent> : filtered.map((lesson) => <LessonCard key={lesson.lessonId} lesson={lesson} />)}</section>
  </>;
}
