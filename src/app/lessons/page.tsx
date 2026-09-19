import CourseLayout from "../../components/course-layout";
import { EmptyContent, LessonCard } from "../../components/course-content";
import { lessons } from "../../lib/course-data";

export default function LessonsPage() {
  return (
    <CourseLayout>
      <section className="course-page-hero">
        <div className="course-page-hero-content"><p className="item-kicker">מערכות תקשורת · 11.9004 · סמסטר א׳</p>
        <h1>מערכי שיעור</h1>
        <p>כל שיעור כולל קישורים לחומר המקורי, מושגים ונוסחאות רלוונטיים.</p></div>
        <div className="course-page-hero-stats">
          <span>{lessons.length} שיעורים</span>
          <span>חומר מקורי ותרגול</span>
          <span>מושגים ונוסחאות בהקשר</span>
        </div>
      </section>
      <section className="lesson-list" aria-label="מערכי שיעור">
        {lessons.length === 0 ? <EmptyContent title="אין עדיין מערכי שיעור רשומים">קובצי השיעור לא נמצאים עדיין בריפו. לאחר הוספתם ל־Registry הם יופיעו כאן אוטומטית.</EmptyContent> : lessons.map((lesson) => <LessonCard key={lesson.lessonId} lesson={lesson} />)}
      </section>
    </CourseLayout>
  );
}
