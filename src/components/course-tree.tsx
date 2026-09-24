"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Course, CourseSectionId } from "../lib/course-data";

const sections: Array<{ id: CourseSectionId | ""; label: string; icon: string }> = [
  { id: "", label: "בית הקורס", icon: "⌂" },
  { id: "lessons", label: "מערכי שיעור", icon: "▤" },
  { id: "materials", label: "חומרי עזר", icon: "▰" },
  { id: "formulas", label: "נוסחאון", icon: "ƒ" },
  { id: "concepts", label: "מפת מושגים", icon: "⌘" },
];

function courseHref(courseId: string, section = "") {
  return `/course/${courseId}${section ? `/${section}` : ""}`;
}

export default function CourseTree({ courses }: { courses: Course[] }) {
  const pathname = usePathname();
  const currentCourse = courses.find((item) => {
    const href = courseHref(item.courseId);
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(() => {
    const defaultCourse = currentCourse ?? courses.find((item) => item.status === "active");
    return defaultCourse ? { [defaultCourse.courseId]: true } : {};
  });

  return (
    <nav className="course-tree" aria-label="עץ הקורסים">
      <p className="course-tree-label">הקורסים שלי</p>
      <ul className="course-tree-list">
        {courses.map((item) => {
          const isCurrent = currentCourse?.courseId === item.courseId;
          const isExpanded = expandedCourses[item.courseId] ?? (isCurrent || (!currentCourse && item.status === "active"));
          const childListId = `course-tree-links-${item.courseId}`;

          return (
            <li className="course-tree-item" key={item.courseId}>
              <div className={`course-tree-course${isCurrent ? " current" : ""}`}>
                <button
                  className="course-tree-toggle"
                  type="button"
                  onClick={() => setExpandedCourses((expanded) => ({ ...expanded, [item.courseId]: !isExpanded }))}
                  aria-label={`${isExpanded ? "סגירת" : "פתיחת"} הקורס ${item.title}`}
                  aria-expanded={isExpanded}
                  aria-controls={childListId}
                >
                  <span aria-hidden="true">{isExpanded ? "⌄" : "›"}</span>
                </button>
                <Link href={courseHref(item.courseId)} aria-current={isCurrent && pathname === courseHref(item.courseId) ? "page" : undefined}>
                  <span className="course-tree-folder" aria-hidden="true">▾</span>
                  <span className="course-tree-course-name">{item.title}</span>
                  <span className="course-tree-course-number" dir="ltr">{item.courseNumber}</span>
                </Link>
              </div>
              <ul className="course-nav course-tree-children" id={childListId} aria-label={`עמודים בקורס ${item.title}`} hidden={!isExpanded}>
                  {sections.filter((section) => !section.id || item.sections.includes(section.id)).map((section) => {
                    const href = courseHref(item.courseId, section.id);
                    const active = pathname === href || Boolean(section.id && pathname.startsWith(`${href}/`));
                    return (
                      <li key={section.id || "home"}>
                        <Link className={active ? "active" : undefined} href={href} aria-current={active ? "page" : undefined}>
                          <span aria-hidden="true">{section.icon}</span>
                          <span className="nav-label">{section.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
