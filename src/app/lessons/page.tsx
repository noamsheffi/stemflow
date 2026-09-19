import CourseLayout from "../../components/course-layout";
import { EmptyContent, LessonCard } from "../../components/course-content";
import { lessons } from "../../lib/course-data";

export default function LessonsPage() {
  return <CourseLayout><section className="page-intro"><p className="item-kicker">מערכות תקשורת</p><h1>מערכי שיעור</h1><p>כל שיעור כולל קישורים לחומר המקורי, מושגים ונוסחאות רלוונטיים.</p></section><section className="lesson-list">{lessons.length === 0 ? <EmptyContent title="אין עדיין מערכי שיעור רשומים">קובצי השיעור לא נמצאים עדיין בריפו. לאחר הוספתם ל־Registry הם יופיעו כאן אוטומטית.</EmptyContent> : lessons.map((lesson) => <LessonCard key={lesson.lessonId} lesson={lesson} />)}</section></CourseLayout>;
}
