import { notFound } from "next/navigation";
import Link from "next/link";
import Lesson04Player from "../../../../../components/lesson-04-player";
import Lesson05Player from "../../../../../components/lesson-05-player";
import Lesson05Practice from "../../../../../components/lesson-05-practice";
import LecturerWorkspace from "../../../../../components/lecturer-workspace";
import { getLesson } from "../../../../../lib/course-data";
import styles from "./lesson-preview.module.css";

const phases = [
  { id: "slides", number: "01", label: "מערך השיעור" },
  { id: "practice", number: "02", label: "תרגול אינטראקטיבי" },
  { id: "summary", number: "03", label: "רפלקציה" },
] as const;
type Phase = (typeof phases)[number]["id"];

/** Lecturer-only lesson preview. The route remains inside the lecturer workspace. */
export default async function LecturerLessonPreviewPage({ params }: { params: Promise<{ lessonId: string; phase: string }> }) {
  const { lessonId, phase: requestedPhase } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson || !phases.some((item) => item.id === requestedPhase)) notFound();
  const phase = requestedPhase as Phase;
  const resource = lesson.resources.find((item) => phase === "slides" ? item.kind === "lesson-html" : phase === "practice" ? item.kind === "exercise" : false);

  return <LecturerWorkspace activeLessonId={lesson.lessonId} breadcrumb={`שיעור ${String(lesson.number).padStart(2, "0")} · ${lesson.title}`}>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>שיעור <span dir="ltr">{String(lesson.number).padStart(2, "0")}</span> · סביבת מרצה</p><h1>{lesson.title}</h1><p>תצוגת מערך ותרגול בתוך פנל המרצים.</p><div className={styles.topics}>{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
    </header>
    <nav className={styles.phaseNav} aria-label="שלבי השיעור">{phases.map((item) => <Link key={item.id} className={`${styles.phase} ${phase === item.id ? styles.phaseActive : ""}`} href={`/lecturer/lessons/${lesson.lessonId}/${item.id}`} aria-current={phase === item.id ? "step" : undefined}><span className={styles.phaseNumber} dir="ltr">{item.number}</span><span className={styles.phaseText}><small>{item.id === "slides" ? "בכיתה" : item.id === "practice" ? "אחרי השיעור" : "לקראת השיעור הבא"}</small><b>{item.label}</b></span></Link>)}</nav>
    {phase === "slides" && lesson.lessonId === "lesson-04" ? <Lesson04Player lecturerMode />
      : phase === "slides" && lesson.lessonId === "lesson-05" ? <Lesson05Player lecturerMode />
        : phase === "practice" && lesson.lessonId === "lesson-05" ? <Lesson05Practice />
          : resource ? <section className={styles.viewer}><iframe src={resource.href} title={`${resource.title}: ${lesson.title}`} allowFullScreen /><div className={styles.viewerFooter}><span>{resource.title}</span><Link className={styles.openNew} href={resource.href} target="_blank" rel="noreferrer">פתיחה בחלון חדש ↗</Link></div></section>
            : <p className={styles.empty}>{phase === "summary" ? "רפלקציה זו זמינה בסביבת הסטודנטים בלבד." : "אין לשיעור הזה תוכן בשלב שנבחר."} <Link className={styles.openNew} href="/lecturer/sessions#lessons">חזרה למערכי השיעור</Link></p>}
  </LecturerWorkspace>;
}
