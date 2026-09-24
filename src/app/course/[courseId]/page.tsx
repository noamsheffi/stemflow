import Link from "next/link";
import { notFound } from "next/navigation";
import AnalyticsEventTracker from "../../../components/analytics-event-tracker";
import WorkspaceLayout from "../../../components/workspace-layout";
import { getCourse, workspace } from "../../../lib/course-data";

export default async function RegisteredCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const item = getCourse(courseId);
  if (!item) notFound();

  return (
    <WorkspaceLayout>
      <AnalyticsEventTracker eventName="course_open" properties={{ workspace_id: workspace.workspaceId, course_id: item.courseId }} />
      <section className="workspace-registered-course" aria-labelledby="registered-course-title">
        <p className="item-kicker">{item.status === "active" ? "קורס פעיל" : "קורס בארכיון"}</p>
        <h1 id="registered-course-title">{item.title}</h1>
        <p className="workspace-course-number" dir="ltr">{item.courseNumber}</p>
        <p>מרצה: {item.lecturer}</p>
        <p className="workspace-course-empty">הקורס נוסף לסביבת הלמידה. התוכן שלו יופיע כאן לאחר רישום השיעורים והמשאבים.</p>
        <Link className="text-link" href="/workspace">חזרה לכל הקורסים</Link>
      </section>
    </WorkspaceLayout>
  );
}
