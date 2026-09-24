import StudentWorkspace from "../../components/student-workspace";
import WorkspaceCourseList from "../../components/workspace-course-list";
import { workspace } from "../../lib/course-data";
import styles from "../../components/student-workspace.module.css";

export default function Home() {
  return (
    <StudentWorkspace>
      <header className={styles.pageHeading}>
        <p className={styles.pageKicker}>סביבת הלמידה</p>
        <h1>הקורסים שלי</h1>
        <p>בחרו קורס כדי להמשיך ללמוד.</p>
      </header>
      <WorkspaceCourseList courses={workspace.courses} />
    </StudentWorkspace>
  );
}
