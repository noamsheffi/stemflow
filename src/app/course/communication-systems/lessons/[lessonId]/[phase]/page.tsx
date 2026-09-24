import { notFound } from "next/navigation";
import CourseLayout from "../../../../../../components/course-layout";
import LessonPhase from "../../../../../../components/lesson-phase";
import { getLesson } from "../../../../../../lib/course-data";

const validPhases = new Set(["slides", "practice", "summary"]);

export default async function LessonPhasePage({ params }: { params: Promise<{ lessonId: string; phase: string }> }) {
  const { lessonId, phase } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson || !validPhases.has(phase)) notFound();

  return <CourseLayout><LessonPhase lesson={lesson} phase={phase as "slides" | "practice" | "summary"} /></CourseLayout>;
}
