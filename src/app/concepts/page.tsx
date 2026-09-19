import type { Metadata } from "next";
import CourseLayout from "../../components/course-layout";
import ConceptMap from "../../components/concept-map";
import ConceptDetails from "../../components/concept-details";
import { conceptMap } from "../../lib/concept-map";

export const metadata: Metadata = { title: "מפת מושגים | מערכות תקשורת", description: "24 מושגים במערכות תקשורת, עם הסברים, נוסחאות, דוגמאות וקשרים בין שיעורים." };

export default function ConceptsPage() {
  const entries = conceptMap.map((concept) => ({
    id: concept.id, title: concept.title, english: concept.english,
    lesson: concept.lesson, category: concept.category, summary: concept.summary,
    connections: concept.connections,
    search: [concept.title, concept.english, concept.summary, concept.details, concept.category, concept.real_world, ...concept.formulas].join(" ").toLocaleLowerCase(),
    details: <ConceptDetails concept={concept} />,
  }));
  return <CourseLayout><ConceptMap entries={entries} /></CourseLayout>;
}
