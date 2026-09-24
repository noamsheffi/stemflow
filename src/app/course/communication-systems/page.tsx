import Link from "next/link";
import AnalyticsEventTracker from "../../../components/analytics-event-tracker";
import CourseLayout from "../../../components/course-layout";
import { concepts, course, formulas, lessons, supportingMaterials, workspace } from "../../../lib/course-data";
import styles from "../../../components/student-workspace.module.css";

const href = (section = "") => `/course/${course.courseId}${section ? `/${section}` : ""}`;
const pad2 = (value: number) => String(value).padStart(2, "0");

export default function CourseHomePage() {
  const firstLesson = lessons.find((lesson) => lesson.resources.some((resource) => resource.kind === "lesson-html"));
  const availableFormulaCount = formulas.length;
  const availableConceptCount = concepts.length;

  return <CourseLayout>
    <AnalyticsEventTracker eventName="course_open" properties={{ workspace_id: workspace.workspaceId, course_id: course.courseId }} />
    <section className={styles.homeHero}>
      <div className={styles.homeTitle}>
        <p className={styles.pageKicker}><span dir="ltr">{course.courseNumber}</span> · מרצה: {course.lecturer}</p>
        <h1>{course.title}</h1>
        <p>מהשיעור הזה לשיעור הבא — חומרי הקורס, התרגול והידע במקום אחד.</p>
      </div>
      <article className={styles.nextCard} aria-labelledby="next-step-title">
        <span className={styles.nextLabel}>הצעד הבא שלך</span>
        <h2 id="next-step-title">{firstLesson ? `שיעור ${pad2(firstLesson.number)} · ${firstLesson.title}` : "בחרו תוכן להתחלה"}</h2>
        <div className={styles.phaseSegments} aria-hidden="true"><i className={styles.phaseSegment}/><i className={styles.phaseSegment}/><i className={styles.phaseSegment}/></div>
        <div className={styles.phaseLabels}><span>בכיתה</span><span>אחרי השיעור</span><span>לקראת הבא</span></div>
        <p>פתחו את מערך השיעור הראשון והמשיכו משם.</p>
        <Link className={styles.primaryButton} href={firstLesson ? `${href(`lessons/${firstLesson.lessonId}`)}/slides` : href("lessons")}>
          {firstLesson ? "פתיחת מערך השיעור" : "למערכי השיעור"}
        </Link>
      </article>
    </section>

    <div className={styles.homeGrid}>
      <section className={`${styles.card} ${styles.syllabus}`} aria-labelledby="syllabus-title">
        <header className={styles.cardHeader}><h2 id="syllabus-title">מערכי שיעור</h2><span>מחזור למידה לכל שיעור</span></header>
        <div className={styles.loopLegend} aria-label="זמינות חומרי לימוד לפי שלב">
          <span><b dir="ltr">01</b> מערך שיעור</span><span><b dir="ltr">02</b> תרגול</span><span><b dir="ltr">03</b> רפלקציה</span>
        </div>
        <div className={styles.syllabusRows}>
          {lessons.map((lesson) => {
            const hasSlides = lesson.resources.some((resource) => resource.kind === "lesson-html");
            const hasPractice = lesson.resources.some((resource) => resource.kind === "exercise");
            return <Link className={styles.syllabusRow} key={lesson.lessonId} href={`${href(`lessons/${lesson.lessonId}`)}/slides`}>
              <span className={styles.syllabusNumber} dir="ltr">{pad2(lesson.number)}</span>
              <span className={styles.syllabusText}><strong>{lesson.title}</strong><small>{lesson.topics.join(" · ")}</small></span>
              <span className={styles.loopMini} aria-label={`${hasSlides ? "מערך שיעור זמין" : "אין מערך שיעור"}; ${hasPractice ? "תרגול זמין" : "אין תרגול"}; רפלקציה לא זמינה`}>
                <i title={hasSlides ? "מערך שיעור זמין" : "מערך שיעור לא זמין"} className={hasSlides ? styles.available : ""}/>
                <i title={hasPractice ? "תרגול זמין" : "תרגול לא זמין"} className={hasPractice ? styles.available : ""}/>
                <i title="רפלקציה אישית לשיעור אינה זמינה כרגע"/>
              </span>
            </Link>;
          })}
        </div>
      </section>

      <aside className={styles.homeSide}>
        <section className={styles.card} aria-labelledby="library-title">
          <header className={styles.cardHeader}><h2 id="library-title">ספריית הקורס</h2></header>
          <nav className={styles.libraryLinks} aria-label="ספריית הקורס">
            <Link className={styles.libraryLink} href={href("formulas")}><span className={styles.libraryIcon} aria-hidden="true">ƒ</span><span className={styles.libraryLinkText}><strong>נוסחאון</strong><small>נוסחאות ומשמעות · {availableFormulaCount}</small></span><span className={styles.libraryChevron} aria-hidden="true">‹</span></Link>
            <Link className={styles.libraryLink} href={href("concepts")}><span className={styles.libraryIcon} aria-hidden="true">⌘</span><span className={styles.libraryLinkText}><strong>מפת מושגים</strong><small>הקשרים בין נושאי הקורס · {availableConceptCount}</small></span><span className={styles.libraryChevron} aria-hidden="true">‹</span></Link>
            <Link className={styles.libraryLink} href={href("materials")}><span className={styles.libraryIcon} aria-hidden="true">▤</span><span className={styles.libraryLinkText}><strong>חומרי עזר</strong><small>מסמכים זמינים · {supportingMaterials.length}</small></span><span className={styles.libraryChevron} aria-hidden="true">‹</span></Link>
          </nav>
        </section>
        <section className={`${styles.card} ${styles.courseStatus}`} aria-labelledby="course-status-title">
          <h2 id="course-status-title">תוכן הקורס</h2>
          <div className={styles.statusCount}><strong dir="ltr">{lessons.length}</strong><span>מערכי שיעור זמינים</span></div>
          <div className={styles.statusBar} aria-hidden="true">{lessons.map((lesson) => <i key={lesson.lessonId} className={lesson.resources.some((resource) => resource.kind === "lesson-html") ? styles.available : ""}/>)}</div>
          <p>נתוני השלמת שלבי הלמידה אינם זמינים עדיין.</p>
        </section>
      </aside>
    </div>
  </CourseLayout>;
}
