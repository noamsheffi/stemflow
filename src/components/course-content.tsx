import FormulaMath from "./formula-math";
import Link from "next/link";

import LessonOpenLink from "./lesson-open-link";
import type { CourseFormula, CourseLesson } from "../lib/course-data";
import { courseAppPath, lessonHref } from "../lib/course-data";

export function EmptyContent({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="empty-content"><h2>{title}</h2><p>{children}</p></section>;
}

export function LessonCard({ lesson }: { lesson: CourseLesson }) {
  return (
    <article className="lesson-card">
      <div className="lesson-card-top"><p className="item-kicker">שיעור</p><span>{lesson.number.toString().padStart(2, "0")}</span></div>
      <h2>{lesson.title}</h2>
      {lesson.topics.length > 0 && <p className="topic-list">{lesson.topics.join(" · ")}</p>}
      <LessonOpenLink className="text-link" href={lessonHref(lesson)} lessonId={lesson.lessonId} resourceId="lesson-main-html">פתח חומרי שיעור <bdi>←</bdi></LessonOpenLink>
    </article>
  );
}

export function FormulaCard({ formula }: { formula: CourseFormula }) {
  return (
    <article className="formula-card">
      <h2>{formula.name}</h2>
      <p className="formula-expression" dir="ltr"><FormulaMath tex={formula.expression} display /></p>
      <p>{formula.physicalMeaning}</p>
      <Link className="text-link" href={`${courseAppPath("formulas")}/${formula.formulaId}`}>לנוסחה ולהקשר שלה</Link>
    </article>
  );
}
