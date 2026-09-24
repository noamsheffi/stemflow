"use client";

import Link from "next/link";
import { useState } from "react";
import type { Course } from "../lib/course-data";
import styles from "./student-workspace.module.css";

type CourseFilter = "active" | "all";

export default function WorkspaceCourseList({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<CourseFilter>("active");
  const visibleCourses = filter === "active" ? courses.filter((item) => item.status === "active") : courses;

  return (
    <section className={styles.workspaceCourseList} aria-label="הקורסים שלי">
      <div className={styles.workspaceCourseToolbar}>
        <h2 className={styles.srOnly}>רשימת הקורסים</h2>
        <label className={styles.workspaceCourseFilter}>
          <span>הצגת קורסים</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as CourseFilter)} aria-label="סינון קורסים">
            <option value="active">קורסים פעילים</option>
            <option value="all">כל הקורסים</option>
          </select>
        </label>
      </div>

      {visibleCourses.length === 0 ? (
        <p className={styles.workspaceCourseEmpty}>אין קורסים להצגה במסנן הזה.</p>
      ) : (
        <div className={styles.workspaceCourseGrid}>
          {visibleCourses.map((item) => (
            <article className={styles.workspaceCourseCard} key={item.courseId}>
              <div className={styles.workspaceCourseDetails}>
                <p className={styles.pageKicker}>{item.status === "active" ? "קורס פעיל" : "קורס בארכיון"}</p>
                <div className={styles.workspaceCourseTitleLine}>
                  <h3>{item.title}</h3>
                  <span className={styles.workspaceCourseNumber} dir="ltr">{item.courseNumber}</span>
                </div>
                <p className={styles.workspaceCourseLecturer}>מרצה: {item.lecturer}</p>
              </div>

              <dl className={styles.workspaceCourseStats}>
                <div><dt>{item.lessonIds.length}</dt><dd>שיעורים זמינים</dd></div>
                <div><dt>{item.conceptIds.length}</dt><dd>מושגים</dd></div>
                <div><dt>{item.formulaIds.length}</dt><dd>נוסחאות</dd></div>
              </dl>

              <Link className={styles.workspaceCourseOpen} href={`/course/${item.courseId}`}>
                <span>פתח קורס</span>
                <span aria-hidden="true">←</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
