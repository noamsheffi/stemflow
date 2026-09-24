import type { Metadata } from "next";
import CourseLayout from "../../components/course-layout";
import CourseConcepts from "../../components/course-concepts";

export const metadata: Metadata = { title: "מפת מושגים | מערכות תקשורת", description: "קשרים בין מושגים בקורס מערכות תקשורת." };

export default function ConceptsPage() {
  return <CourseLayout><CourseConcepts /></CourseLayout>;
}
