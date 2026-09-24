import type { Metadata } from "next";
import CourseLayout from "../../components/course-layout";
import CourseFormulas from "../../components/course-formulas";

export const metadata: Metadata = { title: "נוסחאון | מערכות תקשורת", description: "נוסחאות הקורס לפי שיעור, עם משמעות הסמלים והיחידות." };

export default function FormulasPage() {
  return <CourseLayout><CourseFormulas /></CourseLayout>;
}
