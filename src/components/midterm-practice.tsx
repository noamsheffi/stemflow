"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { midtermQuestions } from "../lib/midterm-practice";
import styles from "./midterm-practice.module.css";

type QuestionProgress = { revealed: number; understood?: boolean; confidence?: number; helpfulness?: number; feedback?: string };
type PracticeProgress = { sessionId: string; activeQuestion: number; questions: Record<string, QuestionProgress>; started: boolean };
const STORE_KEY = "syllo:midterm-practice:v1";
const CLIENT_KEY = "syllo:analytics-client-id";
function readSaved(): PracticeProgress | null { try { const value = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); return value && typeof value.sessionId === "string" ? value : null; } catch { return null; } }
function getClientId() { try { const old = localStorage.getItem(CLIENT_KEY); if (old) return old; const id = crypto.randomUUID(); localStorage.setItem(CLIENT_KEY, id); return id; } catch { return crypto.randomUUID(); } }

export default function MidtermPractice() {
  const [progress, setProgress] = useState<PracticeProgress | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const clientId = useRef("");
  const current = progress ? midtermQuestions[progress.activeQuestion] : null;
  const currentProgress = current && progress ? progress.questions[current.id] ?? { revealed: 0 } : null;
  const visibleSteps = current && currentProgress ? current.steps.slice(0, currentProgress.revealed) : [];
  const stats = useMemo(() => {
    const entries = Object.values(progress?.questions ?? {});
    const completed = Object.entries(progress?.questions ?? {}).filter(([id, item]) => item.revealed >= (midtermQuestions.find(q => q.id === id)?.steps.length ?? 999)).length;
    const revealed = entries.reduce((sum, item) => sum + item.revealed, 0);
    const rated = entries.filter(item => item.confidence);
    const average = rated.length ? rated.reduce((sum, item) => sum + (item.confidence ?? 0), 0) / rated.length : 0;
    return { completed, revealed, average };
  }, [progress]);

  useEffect(() => {
    clientId.current = getClientId();
    const existing = readSaved();
    if (existing) setProgress(existing);
    else setProgress({ sessionId: crypto.randomUUID(), activeQuestion: 0, questions: {}, started: false });
    setReady(true);
  }, []);
  useEffect(() => { if (ready && progress) localStorage.setItem(STORE_KEY, JSON.stringify(progress)); }, [progress, ready]);

  function record(questionId: string, eventType: string, extra: Record<string, unknown> = {}) {
    if (!progress) return;
    void fetch("/api/midterm-practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: progress.sessionId, clientId: clientId.current, questionId, eventType, ...extra }) }).catch(() => undefined);
  }
  function start() {
    if (!progress) return;
    setProgress({ ...progress, started: true });
    record(midtermQuestions[0].id, "started");
  }
  function revealNext() {
    if (!current || !currentProgress || !progress || currentProgress.revealed >= current.steps.length) return;
    const index = currentProgress.revealed;
    setProgress({ ...progress, questions: { ...progress.questions, [current.id]: { ...currentProgress, revealed: index + 1 } } });
    record(current.id, "step_revealed", { stepIndex: index });
    if (index + 1 === current.steps.length) record(current.id, "completed");
  }
  function updateQuestion(patch: Partial<QuestionProgress>, eventType?: "self_assessment" | "feedback") {
    if (!current || !currentProgress || !progress) return;
    const next = { ...currentProgress, ...patch };
    setProgress({ ...progress, questions: { ...progress.questions, [current.id]: next } });
    if (eventType) record(current.id, eventType, { confidence: next.confidence ?? null, helpfulness: next.helpfulness ?? null, understood: next.understood ?? null, feedback: next.feedback ?? null });
  }
  function moveQuestion(index: number) { if (progress) { setProgress({ ...progress, activeQuestion: index }); record(midtermQuestions[index].id, "question_opened"); } }
  function reset() { const fresh = { sessionId: crypto.randomUUID(), activeQuestion: 0, questions: {}, started: false }; setProgress(fresh); localStorage.removeItem(STORE_KEY); setSaved(false); }

  if (!ready || !progress) return <section className={styles.shell} aria-busy="true">טוענים את התרגול…</section>;
  if (!progress.started) return <section className={styles.intro}>
    <Link className={styles.back} href="/course/communication-systems">← חזרה לקורס</Link>
    <p className={styles.kicker}>מערכות תקשורת · תרגול הכנה לבוחן אמצע</p><h1>נבין כל פתרון,<br /><span>צעד אחד בכל פעם.</span></h1>
    <p className={styles.lead}>7 שאלות מתוך מבחן המתכונת. קודם חושבים לבד, ואז פותחים את ההסבר בשלבים. בסוף כל שאלה אפשר לסמן איך הלך ולשתף מה עדיין לא ברור.</p>
    <div className={styles.introStats}><div><strong>7</strong><span>שאלות</span></div><div><strong>3–4</strong><span>צעדים לפתרון</span></div><div><strong>100</strong><span>נקודות במתכונת</span></div></div>
    <p className={styles.note}>מומלץ להצטייד בנוסחאון ובמחשבון. נסו לפתור לפני פתיחת כל שלב.</p><button className={styles.primary} onClick={start}>מתחילים לתרגל <span aria-hidden="true">←</span></button>
  </section>;

  return <div className={styles.shell} dir="rtl">
    <header className={styles.top}><Link className={styles.back} href="/course/communication-systems">← חזרה לקורס</Link><div className={styles.heading}><p className={styles.kicker}>הכנה לבוחן אמצע · מערכות תקשורת</p><h1>תרגול מודרך</h1></div><div className={styles.summary} aria-label="ההתקדמות שלך"><div><strong>{stats.completed}/{midtermQuestions.length}</strong><span>שאלות שהושלמו</span></div><div><strong>{stats.revealed}</strong><span>צעדים שנלמדו</span></div>{stats.average > 0 && <div><strong>{stats.average.toFixed(1)}/5</strong><span>ביטחון ממוצע</span></div>}</div></header>
    <div className={styles.layout}>
      <nav className={styles.questionNav} aria-label="בחירת שאלה">{midtermQuestions.map((question, index) => { const item = progress.questions[question.id]; const done = Boolean(item && item.revealed >= question.steps.length); return <button key={question.id} className={`${styles.questionLink} ${index === progress.activeQuestion ? styles.questionCurrent : ""}`} onClick={() => moveQuestion(index)} aria-current={index === progress.activeQuestion ? "step" : undefined}><span className={styles.questionNum}>{done ? "✓" : String(index + 1).padStart(2, "0")}</span><span><strong>{question.title}</strong><small>{question.section} · {question.points} נק׳</small></span></button>; })}</nav>
      <section className={styles.content} aria-live="polite">
        {current && currentProgress && <>
          <div className={styles.questionHead}><span className={styles.badge}>שאלה {progress.activeQuestion + 1} · {current.points} נקודות</span><h2>{current.title}</h2><p>{current.prompt}</p></div>
          <div className={styles.progressRow}><span>נפתחו {currentProgress.revealed} מתוך {current.steps.length} שלבים</span><div className={styles.track} role="progressbar" aria-label="התקדמות בשאלה" aria-valuemin={0} aria-valuemax={current.steps.length} aria-valuenow={currentProgress.revealed}><i style={{ width: `${currentProgress.revealed / current.steps.length * 100}%` }} /></div></div>
          <div className={styles.steps}>{visibleSteps.map((step, index) => <article className={styles.step} key={step.title}><div className={styles.stepTitle}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3></div><p className={styles.prompt}>{step.prompt}</p><details className={styles.hint}><summary>רמז קטן</summary><p>{step.hint}</p></details><div className={styles.answer}><span className={styles.answerLabel}>כך פותרים</span><p>{step.answer}</p></div></article>)}</div>
          {currentProgress.revealed < current.steps.length ? <button className={styles.primary} onClick={revealNext}>{currentProgress.revealed ? "הצגת השלב הבא" : "פתיחת שלב הפתרון הראשון"} <span aria-hidden="true">←</span></button> : <div className={styles.feedback}>
            <div className={styles.feedbackTitle}><span>סיימנו את השאלה</span><h3>איך הלך לך?</h3><p>המשוב אנונימי ועוזר לנו לראות מה כדאי לחזק.</p></div>
            <fieldset><legend>הצלחתי להבין את הפתרון</legend><div className={styles.choiceRow}><button type="button" aria-pressed={currentProgress.understood === true} className={currentProgress.understood === true ? styles.selected : ""} onClick={() => updateQuestion({ understood: true }, "self_assessment")}>כן, הבנתי</button><button type="button" aria-pressed={currentProgress.understood === false} className={currentProgress.understood === false ? styles.selected : ""} onClick={() => updateQuestion({ understood: false }, "self_assessment")}>עדיין לא</button></div></fieldset>
            <fieldset><legend>כמה בטוח/ה את/ה בתשובה? (1 = לא בטוח/ה, 5 = בטוח/ה)</legend><div className={styles.rating}>{[1,2,3,4,5].map(n => <button key={n} type="button" aria-pressed={currentProgress.confidence === n} className={currentProgress.confidence === n ? styles.selected : ""} onClick={() => updateQuestion({ confidence: n }, "self_assessment")}>{n}</button>)}</div></fieldset>
            <fieldset><legend>עד כמה ההסבר בשלבים עזר לך? (1–5)</legend><div className={styles.rating}>{[1,2,3,4,5].map(n => <button key={n} type="button" aria-pressed={currentProgress.helpfulness === n} className={currentProgress.helpfulness === n ? styles.selected : ""} onClick={() => updateQuestion({ helpfulness: n }, "feedback")}>{n}</button>)}</div></fieldset>
            <label className={styles.textLabel}>מה עדיין לא ברור? (רשות)<textarea maxLength={1000} rows={3} value={currentProgress.feedback ?? ""} onChange={event => updateQuestion({ feedback: event.target.value })} onBlur={() => currentProgress.feedback && record(current.id, "feedback", { feedback: currentProgress.feedback, helpfulness: currentProgress.helpfulness ?? null })} /></label><small className={styles.privacy}>המשוב נשמר באופן אנונימי. נא לא לכתוב שם או פרטים מזהים.</small>
            {currentProgress.understood !== undefined && <p className={styles.thanks} role="status">תודה על המשוב.</p>}
          </div>}
          <div className={styles.questionActions}>{progress.activeQuestion > 0 && <button className={styles.secondary} onClick={() => moveQuestion(progress.activeQuestion - 1)}>השאלה הקודמת</button>}{progress.activeQuestion < midtermQuestions.length - 1 ? <button className={styles.secondary} onClick={() => moveQuestion(progress.activeQuestion + 1)}>לשאלה הבאה ←</button> : <button className={styles.secondary} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>סיימתי את התרגול</button>}</div>
          {saved && <p className={styles.thanks} role="status">ההתקדמות נשמרת במכשיר הזה. אפשר לחזור לתרגול בכל זמן.</p>}
        </>}
      </section>
    </div>
    <footer className={styles.footer}><span>ההתקדמות שלך נשמרת בדפדפן הזה. המשוב נאסף ללא שם.</span><button onClick={reset}>התחלה מחדש</button></footer>
  </div>;
}
