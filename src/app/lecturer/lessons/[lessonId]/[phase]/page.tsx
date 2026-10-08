import { notFound } from "next/navigation";
import CourseLayout from "../../../../../components/course-layout";
import LessonPhase from "../../../../../components/lesson-phase";
import Lesson05Player from "../../../../../components/lesson-05-player";
import Lesson05Practice from "../../../../../components/lesson-05-practice";
import { getLesson } from "../../../../../lib/course-data";

const validPhases = new Set(["slides", "practice", "summary"]);

/** Protected by the lecturer-scoped /lecturer route in proxy.ts. */
export default async function LecturerLessonPreviewPage({ params }: { params: Promise<{ lessonId: string; phase: string }> }) {
  const { lessonId, phase } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson || !lesson.hidden || !validPhases.has(phase)) notFound();

  const content = lessonId === "lesson-05" && phase === "slides"
    ? <Lesson05Player />
    : lessonId === "lesson-05" && phase === "practice"
      ? <Lesson05Practice />
      : <LessonPhase lesson={lesson} phase={phase as "slides" | "practice" | "summary"} />;
  return <CourseLayout>{content}</CourseLayout>;
}
