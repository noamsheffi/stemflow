import CourseLayout from "../../../../components/course-layout";
import SupportingMaterials from "../../../../components/supporting-materials";
import AnalyticsEventTracker from "../../../../components/analytics-event-tracker";
import { course, workspace } from "../../../../lib/course-data";

export default function SupportingMaterialsPage() {
  return (
    <CourseLayout>
      <AnalyticsEventTracker eventName="supporting_materials_open" properties={{ workspace_id: workspace.workspaceId, course_id: course.courseId }} />
      <section className="course-page-hero">
        <div className="course-page-hero-content">
          <p className="item-kicker">{course.title} · חומרי עזר</p>
          <h1>חומרי עזר</h1>
          <p>הספר, הסילבוס והנוסחאון של הקורס זמינים כאן לעיון מהיר.</p>
        </div>
        <div className="course-page-hero-stats"><span>3 מסמכים</span><span>קבצי PDF</span><span>לשימוש במהלך הלמידה</span></div>
      </section>
      <SupportingMaterials />
    </CourseLayout>
  );
}
