import { notFound, redirect } from "next/navigation";
import CourseLayout from "../../../../../components/course-layout";
import LessonOverview from "../../../../../components/lesson-overview";
import { getLesson } from "../../../../../lib/course-data";

export default async function LessonIndexPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  if (lesson.lessonId !== "lesson-04") redirect(`/course/communication-systems/lessons/${lesson.lessonId}/slides`);
  return <CourseLayout><LessonOverview lesson={lesson} /></CourseLayout>;
}
