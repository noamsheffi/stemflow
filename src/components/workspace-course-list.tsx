"use client";

import Link from "next/link";
import { useState } from "react";
import type { Course } from "../lib/course-data";

type CourseFilter = "active" | "all";

export default function WorkspaceCourseList({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<CourseFilter>("active");
  const visibleCourses = filter === "active" ? courses.filter((item) => item.status === "active") : courses;

  return (
    <section className="workspace-course-list" aria-label="הקורסים שלי">
      <div className="workspace-course-list-toolbar">
        <h2>הקורסים שלי</h2>
        <label className="workspace-course-filter">
          <span>הצגת קורסים</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as CourseFilter)}>
            <option value="active">קורסים פעילים</option>
            <option value="all">כל הקורסים</option>
          </select>
        </label>
      </div>

      {visibleCourses.length === 0 ? (
        <p className="workspace-course-empty">אין קורסים להצגה במסנן הזה.</p>
      ) : (
        <div className="workspace-course-grid">
          {visibleCourses.map((item) => (
            <article className="workspace-course-card" key={item.courseId}>
              <div className="workspace-course-details">
                <p className="item-kicker">{item.status === "active" ? "קורס פעיל" : "קורס בארכיון"}</p>
                <div className="workspace-course-title-line">
                  <h3>{item.title}</h3>
                  <span className="workspace-course-number" dir="ltr">{item.courseNumber}</span>
                </div>
                <p className="workspace-course-lecturer">מרצה: {item.lecturer}</p>
              </div>

              <dl className="workspace-course-stats">
                <div><dt>{item.lessonIds.length}</dt><dd>שיעורים זמינים</dd></div>
                <div><dt>{item.conceptIds.length}</dt><dd>מושגים</dd></div>
                <div><dt>{item.formulaIds.length}</dt><dd>נוסחאות</dd></div>
              </dl>

              <Link className="workspace-course-open" href={`/course/${item.courseId}`}>
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
