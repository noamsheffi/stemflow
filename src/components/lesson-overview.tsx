import Link from "next/link";
import type { CourseLesson } from "../lib/course-data";
import styles from "./student-workspace.module.css";

const phases = [
  { id: "slides", number: "01", stage: "בכיתה", title: "מערך השיעור", description: "פתיחת המצגת והניווט בין שקפי השיעור." },
  { id: "practice", number: "02", stage: "אחרי השיעור", title: "תרגול אינטראקטיבי", description: "תרגול וחזרה על הנושאים שנלמדו." },
  { id: "summary", number: "03", stage: "לקראת השיעור הבא", title: "רפלקציה", description: "סיכום אישי וסימון נושאים לחזרה." },
] as const;

export default function LessonOverview({ lesson }: { lesson: CourseLesson }) {
  return <section className={styles.lessonOverview}>
    <header className={styles.lessonHeader}>
      <p className={styles.pageKicker}>שיעור <span dir="ltr">{String(lesson.number).padStart(2, "0")}</span> · {lesson.topics.slice(0, 3).join(" · ")}</p>
      <h1>{lesson.title}</h1>
      <p className={styles.lessonOverviewIntro}>בחרו את החלק בשיעור שאליו תרצו לעבור.</p>
    </header>
    <nav className={styles.lessonOverviewPhases} aria-label="בחירת חלק בשיעור">
      {phases.map((phase) => <Link key={phase.id} className={styles.lessonOverviewPhase} href={`/course/communication-systems/lessons/${lesson.lessonId}/${phase.id}`}>
        <span className={styles.lessonOverviewNumber} dir="ltr">{phase.number}</span>
        <span className={styles.lessonOverviewText}><small>{phase.stage}</small><strong>{phase.title}</strong><span>{phase.description}</span></span>
        <span className={styles.lessonOverviewArrow} aria-hidden="true">←</span>
      </Link>)}
    </nav>
  </section>;
}
