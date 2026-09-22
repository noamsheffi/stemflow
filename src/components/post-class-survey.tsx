"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { emptyAnswers, EXPERIMENT_ID, flow, questions, validAnswer, type Answers } from "../lib/post-class";
import styles from "./post-class.module.css";
const storage = `syllo:${EXPERIMENT_ID}:v1`;
function read(key: string) { try { return localStorage.getItem(`${storage}:${key}`); } catch { return null; } }
function write(key: string, value: string) { try { localStorage.setItem(`${storage}:${key}`, value); } catch { /* Survey remains usable without storage. */ } }
function clearDraft() { try { localStorage.removeItem(`${storage}:draft`); } catch { /* Best effort. */ } }
function restoreDraft(raw: string): { answers: Answers; step: number } {
  const saved = JSON.parse(raw);
  const answers: Answers = { ...emptyAnswers, other_text: {} };
  for (const [index, question] of questions.entries()) {
    if (validAnswer(index, saved?.answers?.[question.key])) Object.assign(answers, { [question.key]: saved.answers[question.key] });
    const other = saved?.answers?.other_text?.[question.key];
    if (typeof other === "string") answers.other_text[question.key] = other.slice(0, 800);
  }
  if (typeof saved?.answers?.concept_connection_example === "string") answers.concept_connection_example = saved.answers.concept_connection_example.slice(0, 800);
  const steps = flow(answers.returned_to_material);
  const firstMissing = steps.findIndex(index => !validAnswer(index, answers[questions[index].key]));
  const maximum = firstMissing < 0 ? steps.length - 1 : firstMissing;
  return { answers, step: Number.isInteger(saved?.step) ? Math.max(0, Math.min(saved.step, maximum)) : 0 };
}
export default function PostClassSurvey() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientId = useRef("");
  const legend = useRef<HTMLLegendElement>(null);
  const steps = flow(answers.returned_to_material);
  const index = steps[step] ?? 0;
  const question = questions[index];
  const value = answers[question.key];
  const multiple = index === 1 || index === 4;
  const selected = (key: string) => Array.isArray(value) ? value.includes(key) : String(value) === key;
  useEffect(() => {
    clientId.current = read("client-id") || crypto.randomUUID();
    write("client-id", clientId.current);
    setDone(Boolean(read("submitted")));
    const raw = read("draft");
    if (raw) { try { const saved = restoreDraft(raw); setAnswers(saved.answers); setStep(saved.step); } catch { clearDraft(); } }
    setReady(true);
  }, []);
  useEffect(() => { if (ready && !done) write("draft", JSON.stringify({ answers, step })); }, [answers, step, ready, done]);
  useEffect(() => { if (ready) legend.current?.focus(); }, [step, ready]);
  function choose(key: string) {
    setError("");
    setAnswers(current => {
      if (index === 0) return { ...current, returned_to_material: key as Answers["returned_to_material"], material_actions: [], return_trigger: null, non_return_reason: null, other_text: { formula_context_needs: current.other_text.formula_context_needs } };
      if (multiple) {
        const previous = current[question.key] as string[];
        let next = previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key];
        if (index === 4) next = key === "none" && !previous.includes(key) ? [key] : next.filter(item => item !== "none");
        if (index === 4 && next.length > 2) return current;
        return { ...current, [question.key]: next };
      }
      return { ...current, [question.key]: index === 5 ? Number(key) : key };
    });
  }
  async function advance(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!validAnswer(index, value)) { setError(index === 4 ? "יש לבחור תשובה אחת או שתיים." : "יש לבחור תשובה לפני שממשיכים."); return; }
    if (step < steps.length - 1) { setStep(step + 1); setError(""); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/submissions/002-post-class-behavior", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anonymousClientId: clientId.current, answers }) });
      if (!response.ok && response.status !== 409) throw new Error("submission_failed");
      write("submitted", "true"); clearDraft(); setDone(true);
    } catch { setError("לא הצלחנו לשמור את התשובות כרגע. התשובות נשארו כאן ואפשר לנסות שוב."); }
    finally { setBusy(false); }
  }
  if (!ready) return <section className={styles.card} aria-busy="true">טוענים את השאלון…</section>;
  if (done) return <section className={`${styles.card} completion-card`}><div className="completion-icon" aria-hidden="true">✓</div><p className="eyebrow">שאלון 02 · אחרי השיעור</p><h1>תודה.</h1><p className="intro">המטרה היא להבין איך אתם באמת משתמשים בחומר אחרי השיעור ואיך אפשר להפוך את חומרי הקורס לשימושיים יותר עבורכם.</p><Link className={styles.backLink} href="/course/communication-systems">חזרה לקורס</Link></section>;
  return <section className={styles.card} aria-labelledby="post-class-title">
    <header className="survey-header"><p className="eyebrow">שאלון 02 · 3–4 דקות</p><h1 id="post-class-title">הלמידה ממשיכה אחרי השיעור</h1><p className="intro">השאלון עוזר לי להבין איך אתם משתמשים בחומר אחרי השיעור ואיך אפשר להפוך אותו לשימושי יותר עבורכם.</p><p className="privacy-note">השאלון אנונימי. אין תשובה נכונה או לא נכונה ואין קשר לציון. נא לא לכתוב שם או מידע אישי.</p></header>
    <div className="progress-region"><div className="progress-labels"><span>{answers.returned_to_material ? `שאלה ${step + 1} מתוך ${steps.length}` : "מתחילים · השאלות הבאות מותאמות לתשובה שלך"}</span></div><div className="progress-track" role="progressbar" aria-label="התקדמות בשאלון" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((step + 1) / steps.length * 100)}><div className="progress-value" style={{ width: `${(step + 1) / steps.length * 100}%` }} /></div></div>
    <form onSubmit={advance} noValidate><fieldset disabled={busy}><legend ref={legend} tabIndex={-1}>{question.prompt}</legend><p className="question-hint" id="choice-hint">{index === 4 ? "אפשר לבחור עד שתי תשובות. אם לא חסר מידע, יש לבחור רק באפשרות זו." : multiple ? "אפשר לבחור כמה תשובות." : index === 2 || index === 3 ? "יש לבחור את הסיבה העיקרית." : "יש לבחור תשובה אחת."}</p>
      <div className="options" role={multiple ? "group" : "radiogroup"} aria-label={question.prompt} aria-describedby="choice-hint">{question.options.map(([key, label]) => <label className={`option ${selected(key) ? "option-selected" : ""}`} key={key}><input type={multiple ? "checkbox" : "radio"} name={question.key} value={key} checked={selected(key)} disabled={index === 4 && Array.isArray(value) && value.length === 2 && !selected(key) && key !== "none"} onChange={() => choose(key)} /><span>{label}</span></label>)}</div>
      {selected("other") && <div className={styles.optional}><label htmlFor="other-text">פירוט אחר (לא חובה)</label><textarea id="other-text" rows={2} maxLength={800} value={answers.other_text[question.key] ?? ""} onChange={event => setAnswers(current => ({ ...current, other_text: { ...current.other_text, [question.key]: event.target.value } }))} /></div>}
      {index === 5 && <div className={styles.optional}><label htmlFor="concept-example">אם יש דוגמה מהקורס שבה קשר בין שני נושאים עזר לך להבין, אפשר לכתוב אותה כאן. (לא חובה)</label><textarea id="concept-example" rows={3} maxLength={800} value={answers.concept_connection_example} onChange={event => setAnswers(current => ({ ...current, concept_connection_example: event.target.value }))} /></div>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="actions">{step > 0 && <button className="button button-secondary" type="button" onClick={() => { setStep(step - 1); setError(""); }}>חזרה</button>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "שומרים…" : step === steps.length - 1 ? "סיום השאלון" : "המשך"}</button></div>
    </fieldset></form>
  </section>;
}
