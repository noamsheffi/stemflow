import Link from "next/link";

import CourseLayout from "../../../components/course-layout";
import LessonOpenLink from "../../../components/lesson-open-link";
import AnalyticsEventTracker from "../../../components/analytics-event-tracker";
import { course, courseAppPath, lessonHref, lessons, workspace } from "../../../lib/course-data";

export default function CourseHomePage() {
  const latestLesson = lessons.at(-1);

  return (
    <CourseLayout>
      <AnalyticsEventTracker eventName="course_open" properties={{ workspace_id: workspace.workspaceId, course_id: course.courseId }} />
      <section className="course-hero">
        <div>
          <p className="item-kicker">קורס פעיל · מרצה: {course.lecturer}</p>
          <h1>ברוכים הבאים לקורס<br />{course.title}</h1>
          <p>כל מערכי השיעור, התרגולים והידע של הקורס—במקום אחד.</p>
        </div>
        <div className="course-hero-action">
          <span>המשך מהשיעור האחרון</span>
          {latestLesson ? <LessonOpenLink href={lessonHref(latestLesson)} lessonId={latestLesson.lessonId} resourceId="lesson-main-html">שיעור {latestLesson.number.toString().padStart(2, "0")} <bdi>←</bdi></LessonOpenLink> : <Link href={courseAppPath("lessons")}>למערכי השיעור <bdi>←</bdi></Link>}
        </div>
      </section>

      <section className="course-shortcuts" aria-label="גישה מהירה">
        <Link href={courseAppPath("lessons")}><i aria-hidden="true">▤</i><strong>מערכי שיעור</strong><span>מצגות, חומרים ותרגול עצמי</span><bdi aria-hidden="true">←</bdi></Link>
        <Link href={courseAppPath("formulas")}><i aria-hidden="true">ƒ</i><strong>נוסחאון</strong><span>נוסחה, משמעות והקשר בקורס</span><bdi aria-hidden="true">←</bdi></Link>
        <Link href={courseAppPath("concepts")}><i aria-hidden="true">⌘</i><strong>מפת מושגים</strong><span>הקשרים בין הנושאים שלמדנו</span><bdi aria-hidden="true">←</bdi></Link>
      </section>

      <section className="course-page-hero" aria-labelledby="survey-invite-title">
        <p className="item-kicker">הקול שלכם · שאלון 02</p>
        <h2 id="survey-invite-title">מה קורה אחרי השיעור?</h2>
        <p>שאלון אנונימי קצר על השימוש בחומרי הקורס · 3–4 דקות</p>
        <Link className="button button-primary" href={courseAppPath("surveys/002-post-class-behavior")}>לשאלון השני ←</Link>
      </section>

      <section className="course-status" aria-label="סטטוס תוכן הקורס">
        <div><span>שיעורים זמינים</span><strong>{lessons.length}</strong><small>כולל מערכים ותרגולים</small></div>
        <div><span>השיעור האחרון</span><strong>{latestLesson ? `שיעור ${latestLesson.number.toString().padStart(2, "0")}` : "טרם נרשם"}</strong><small>{latestLesson?.title ?? ""}</small></div>
        <div><span>מצב הקורס</span><strong>מתקדם בהדרגה</strong><small>הידע נבנה יחד עם השיעורים</small></div>
      </section>
    </CourseLayout>
  );
}
