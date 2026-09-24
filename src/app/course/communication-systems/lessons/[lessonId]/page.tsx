import { notFound, redirect } from "next/navigation";
import { getLesson } from "../../../../../lib/course-data";

export default async function LessonIndexPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  redirect(`/course/communication-systems/lessons/${lesson.lessonId}/slides`);
}
