import CourseLayout from "../../../../components/course-layout";
import SupportingMaterials from "../../../../components/supporting-materials";
import AnalyticsEventTracker from "../../../../components/analytics-event-tracker";
import { course, workspace } from "../../../../lib/course-data";
import styles from "../../../../components/student-workspace.module.css";

export default function SupportingMaterialsPage() {
  return <CourseLayout>
    <AnalyticsEventTracker eventName="supporting_materials_open" properties={{ workspace_id: workspace.workspaceId, course_id: course.courseId }} />
    <header className={styles.pageHeading}><p className={styles.pageKicker}>{course.title} · ספריית הקורס</p><h1>חומרי עזר</h1><p>מסמכי הקורס והספרים הרשומים לשימוש במהלך הלמידה.</p></header>
    <SupportingMaterials />
  </CourseLayout>;
}
