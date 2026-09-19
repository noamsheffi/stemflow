import Link from "next/link";
import WorkspaceLayout from "../components/workspace-layout";
import { course, formulas, lessons, concepts } from "../lib/course-data";

export default function Home() {
  return <WorkspaceLayout><section className="workspace-intro"><p className="item-kicker">Syllo</p><h1>הקורסים שלי</h1><p>סביבת הלמידה האישית שלך.</p></section><section className="workspace-course-list" aria-label="הקורסים שלי"><article className="workspace-course-card"><div><p className="item-kicker">קורס פעיל</p><h2>{course.title}</h2><p dir="ltr">{course.titleEnglish}</p><span>מרצה: {course.lecturer}</span></div><dl><div><dt>{lessons.length}</dt><dd>שיעורים זמינים</dd></div><div><dt>{concepts.length}</dt><dd>מושגים</dd></div><div><dt>{formulas.length}</dt><dd>נוסחאות</dd></div></dl><Link href="/course/communication-systems">פתח קורס <bdi>←</bdi></Link></article></section></WorkspaceLayout>;
}
