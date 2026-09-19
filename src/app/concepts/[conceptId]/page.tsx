import Link from "next/link";
import { notFound } from "next/navigation";
import CourseLayout from "../../../components/course-layout";
import ConceptDetails from "../../../components/concept-details";
import AnalyticsEventTracker from "../../../components/analytics-event-tracker";
import { conceptMap } from "../../../lib/concept-map";
import { course, courseAppPath, getConcept, workspace } from "../../../lib/course-data";

export default async function ConceptPage({ params }: { params: Promise<{ conceptId: string }> }) {
  const { conceptId } = await params;
  const concept = conceptMap.find((entry) => entry.id === conceptId);
  if (!concept) notFound();
  const registryConcept = getConcept(concept.id);
  return <CourseLayout><AnalyticsEventTracker eventName="concept_open" properties={{ workspace_id: workspace.workspaceId, course_id: course.courseId, concept_id: concept.id, lesson_id: registryConcept?.lessonIds[0] }} /><header className="page-intro"><p className="item-kicker">{concept.lesson} · {concept.category}</p><h1>{concept.title}</h1><p>{concept.summary}</p></header><ConceptDetails concept={concept} /><section className="detail-section"><h2>מושגים קשורים</h2>{concept.connections.map((id) => <Link key={id} className="text-link" href={`${courseAppPath("concepts")}/${id}`}>{conceptMap.find((entry) => entry.id === id)?.title}</Link>)}</section><p className="back-link"><Link href={courseAppPath("concepts")}>חזרה למפת המושגים ←</Link></p></CourseLayout>;
}
