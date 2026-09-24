import WorkspaceLayout from "../../components/workspace-layout";
import WorkspaceCourseList from "../../components/workspace-course-list";
import { workspace } from "../../lib/course-data";

export default function Home() {
  return (
    <WorkspaceLayout>
      <section className="workspace-intro">
        <p className="item-kicker">Syllo</p>
        <h1>הקורסים שלי</h1>
        <p>סביבת הלמידה האישית שלך.</p>
      </section>
      <WorkspaceCourseList courses={workspace.courses} />
    </WorkspaceLayout>
  );
}
