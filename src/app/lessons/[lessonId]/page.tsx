import Link from "next/link";
import { notFound } from "next/navigation";

import CourseLayout from "../../../components/course-layout";
import LessonOpenLink from "../../../components/lesson-open-link";
import { courseAppPath, formulas, concepts, getLesson, resourceKindLabels } from "../../../lib/course-data";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(`lesson-${lessonId}`) ?? getLesson(lessonId);
  if (!lesson) notFound();

  return <CourseLayout><section className="page-intro"><p className="item-kicker">שיעור {lesson.number.toString().padStart(2, "0")}</p><h1>{lesson.title}</h1>{lesson.topics.length > 0 && <p className="topic-list">{lesson.topics.join(" · ")}</p>}</section><section className="resource-list" aria-label="חומרי השיעור">{lesson.resources.map((resource) => <LessonOpenLink key={resource.resourceId} className="resource-row" href={resource.href} lessonId={lesson.lessonId} resourceId={resource.resourceId}><span>{resourceKindLabels[resource.kind]}</span><strong>{resource.title}</strong></LessonOpenLink>)}</section>{lesson.slides.length > 0 && <section className="detail-section"><h2>שקפים</h2>{lesson.slides.map((slide) => <article className="slide-anchor" id={slide.slideId} key={slide.slideId}><strong>שקף {slide.number}</strong>{slide.title && <span>{slide.title}</span>}</article>)}</section>}<section className="detail-section"><h2>נוסחאות קשורות</h2>{formulas.filter((formula) => lesson.formulaIds.includes(formula.formulaId)).map((formula) => <Link className="text-link" key={formula.formulaId} href={`${courseAppPath("formulas")}/${formula.formulaId}`}>{formula.name}</Link>)}</section><section className="detail-section"><h2>מושגים קשורים</h2>{concepts.filter((concept) => lesson.conceptIds.includes(concept.conceptId)).map((concept) => <Link className="text-link" key={concept.conceptId} href={`${courseAppPath("concepts")}/${concept.conceptId}`}>{concept.name}</Link>)}</section><p className="back-link"><Link href={courseAppPath("lessons")}>חזרה למערכי השיעור</Link></p></CourseLayout>;
}
