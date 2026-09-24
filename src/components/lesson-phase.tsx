"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CourseLesson } from "../lib/course-data";
import { concepts, course, lessons } from "../lib/course-data";
import LessonOpenLink from "./lesson-open-link";
import styles from "./student-workspace.module.css";

const phases = [
  { id: "slides", number: "01", phase: "בכיתה", label: "מערך השיעור" },
  { id: "practice", number: "02", phase: "אחרי השיעור", label: "תרגול אינטראקטיבי" },
  { id: "summary", number: "03", phase: "לקראת השיעור הבא", label: "רפלקציה" },
] as const;
type PhaseId = (typeof phases)[number]["id"];
type Draft = { understanding: number | null; conceptIds: string[]; note: string };
const emptyDraft: Draft = { understanding: null, conceptIds: [], note: "" };
const understandingOptions = ["לא הבנתי", "הבנתי חלקית", "הבנתי", "הבנתי היטב"];

function phaseHref(lessonId: string, phase: PhaseId) {
  return `/course/${course.courseId}/lessons/${lessonId}/${phase}`;
}

function ReflectionDraft({ lesson }: { lesson: CourseLesson }) {
  const storageKey = `syllo:reflection-draft:${course.courseId}:${lesson.lessonId}`;
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saveState, setSaveState] = useState<"saved" | "error" | null>(null);
  const lessonConcepts = concepts.filter((concept) => lesson.conceptIds.includes(concept.conceptId));
  const lessonConceptIds = lesson.conceptIds;

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
      if (stored && typeof stored === "object") {
        const candidate = stored as Partial<Draft>;
        setDraft({
          understanding: Number.isInteger(candidate.understanding) && Number(candidate.understanding) >= 0 && Number(candidate.understanding) < understandingOptions.length ? Number(candidate.understanding) : null,
          conceptIds: Array.isArray(candidate.conceptIds) ? candidate.conceptIds.filter((id): id is string => typeof id === "string" && lessonConceptIds.includes(id)) : [],
          note: typeof candidate.note === "string" ? candidate.note.slice(0, 2000) : "",
        });
      }
    } catch { /* The reflection draft is still usable when storage is disabled. */ }
  }, [lessonConceptIds, storageKey]);

  const toggleConcept = (conceptId: string) => {
    setSaveState(null);
    setDraft((value) => ({ ...value, conceptIds: value.conceptIds.includes(conceptId) ? value.conceptIds.filter((id) => id !== conceptId) : [...value.conceptIds, conceptId] }));
  };

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaveState("saved");
    } catch { setSaveState("error"); }
  };

  return <div className={styles.reflection}>
    <section className={`${styles.card} ${styles.reflectionCard}`}>
      <fieldset>
        <legend>עד כמה הבנת את החומר בשיעור?</legend>
        <div className={styles.scale}>
          {understandingOptions.map((label, index) => <button type="button" key={label} className={styles.choice} aria-pressed={draft.understanding === index} onClick={() => { setSaveState(null); setDraft((value) => ({ ...value, understanding: index })); }}>{label}</button>)}
        </div>
      </fieldset>
    </section>
    <section className={`${styles.card} ${styles.reflectionCard}`}>
      <h2>איפה צריך עזרה?</h2>
      {lessonConcepts.length > 0 ? <div className={styles.conceptChoices}>
        {lessonConcepts.map((concept) => <button type="button" key={concept.conceptId} className={styles.conceptChoice} aria-pressed={draft.conceptIds.includes(concept.conceptId)} onClick={() => toggleConcept(concept.conceptId)}>{concept.name}</button>)}
      </div> : <p className={styles.reflectionNote}>עדיין לא משויכים מושגים לשיעור הזה.</p>}
      <label className={styles.noteLabel}><span>משפט על מה שהיה קשה או לא ברור</span><textarea value={draft.note} maxLength={2000} onChange={(event) => { setSaveState(null); setDraft((value) => ({ ...value, note: event.target.value })); }} placeholder="אפשר לכתוב כאן הערה אישית לעצמך…" /></label>
    </section>
    <p className={styles.reflectionNote}>הטיוטה נשמרת בדפדפן הזה בלבד ואינה נשלחת למרצה. שליחת רפלקציה עדיין אינה מחוברת לשירות שמירה.</p>
    <div className={styles.reflectionActions}>
      <button type="button" className={styles.secondaryButton} onClick={save}>שמירת טיוטה</button>
      {saveState === "saved" && <span className={styles.saveStatus} role="status">הטיוטה נשמרה במכשיר הזה.</span>}
      {saveState === "error" && <span className={styles.saveStatus} role="status">הדפדפן לא אפשר לשמור את הטיוטה.</span>}
    </div>
  </div>;
}

export default function LessonPhase({ lesson, phase }: { lesson: CourseLesson; phase: PhaseId }) {
  const resource = lesson.resources.find((item) => phase === "slides" ? item.kind === "lesson-html" : item.kind === "exercise");
  const phaseIndex = phases.findIndex((item) => item.id === phase);
  const lessonIndex = lessons.findIndex((item) => item.lessonId === lesson.lessonId);
  const nextLesson = lessons[lessonIndex + 1];
  const phaseContent = phase === "slides" ? {
    title: "בכיתה",
    description: "מערך השיעור נפתח כאן בתוך סביבת הלמידה.",
  } : phase === "practice" ? {
    title: "אחרי השיעור",
    description: "התרגול האינטראקטיבי המקורי של השיעור.",
  } : {
    title: "לקראת השיעור הבא",
    description: "עוצרים לרגע, מסמנים מה ברור ומה כדאי לחזור עליו.",
  };

  return <>
    <header className={styles.lessonHeader}>
      <p className={styles.pageKicker}>שיעור <span dir="ltr">{String(lesson.number).padStart(2, "0")}</span></p>
      <h1>{lesson.title}</h1>
      <div className={styles.lessonTags}>{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
    </header>
    <nav className={styles.stepper} aria-label="שלבי מחזור הלמידה">
      {phases.map((item) => {
        const isActive = item.id === phase;
        const phaseResource = lesson.resources.some((resourceItem) => item.id === "slides" ? resourceItem.kind === "lesson-html" : item.id === "practice" ? resourceItem.kind === "exercise" : false);
        const meta = item.id === "summary" ? "לא מחובר" : phaseResource ? "זמין" : "לא זמין";
        return <Link className={`${styles.step} ${isActive ? styles.stepActive : ""}`} href={phaseHref(lesson.lessonId, item.id)} key={item.id} aria-current={isActive ? "step" : undefined}>
          <span className={styles.stepNumber} dir="ltr">{item.number}</span><span className={styles.stepText}><small>{item.phase}</small><strong>{item.label}</strong></span><span className={styles.stepMeta}>{meta}</span>
        </Link>;
      })}
    </nav>

    <section aria-labelledby="phase-heading">
      <div className={styles.phaseIntro}><h2 id="phase-heading">{phaseContent.title}</h2><p>{phaseContent.description}</p></div>
      {phase === "slides" && resource && <div className={styles.viewer}>
        <iframe className={styles.viewerFrame} src={resource.href} title={`מערך שיעור ${lesson.number}: ${lesson.title}`} allowFullScreen />
        <div className={styles.viewerFooter}><span>{resource.title}</span><LessonOpenLink className={styles.materialLink} href={resource.href} lessonId={lesson.lessonId} resourceId={resource.resourceId} resourceKind={resource.kind} target="_blank" rel="noreferrer">פתיחה בחלון חדש</LessonOpenLink></div>
      </div>}
      {phase === "slides" && !resource && <p className={styles.emptyState}>מערך השיעור עדיין לא זמין.</p>}
      {phase === "practice" && resource && <>
        <iframe className={styles.practiceFrame} src={resource.href} title={`תרגול שיעור ${lesson.number}: ${lesson.title}`} />
        <div className={styles.viewerFooter}><LessonOpenLink className={styles.materialLink} href={resource.href} lessonId={lesson.lessonId} resourceId={resource.resourceId} resourceKind={resource.kind} target="_blank" rel="noreferrer">פתיחה בחלון חדש</LessonOpenLink></div>
      </>}
      {phase === "practice" && !resource && <p className={styles.emptyState}>אין תרגול רשום לשיעור הזה.</p>}
      {phase === "summary" && <ReflectionDraft lesson={lesson} />}
    </section>

    <footer className={styles.lessonFooter}>
      {phaseIndex < phases.length - 1
        ? <Link className={styles.secondaryButton} href={phaseHref(lesson.lessonId, phases[phaseIndex + 1].id)}>הבא: {phases[phaseIndex + 1].phase} · {phases[phaseIndex + 1].label} ←</Link>
        : nextLesson
          ? <Link className={styles.secondaryButton} href={phaseHref(nextLesson.lessonId, "slides")}>לשיעור {String(nextLesson.number).padStart(2, "0")} ←</Link>
          : <Link className={styles.secondaryButton} href="/course/communication-systems/lessons">חזרה למערכי השיעור ←</Link>}
    </footer>
  </>;
}
