"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  difficultyReasonOptions,
  emptySlideFrictionAnswers,
  lecturerAwarenessOptions,
  lessonSlides,
  notSignalingReasonOptions,
  preferredInterventionOptions,
  recoveryBehaviorOptions,
  recoverySuccessOptions,
  recoveryTriggerOptions,
  type SlideFrictionAnswers,
} from "../lib/slide-friction";

const draftStorageKey = "stemflow:product-lab-002:draft";
const clientStorageKey = "stemflow:product-lab-002:client-id";
const submittedStorageKey = "stemflow:product-lab-002:submitted";

type Screen = "slides" | "reasons" | "behavior" | "awareness" | "intervention" | "liveFeedback" | "recovery";

export default function SlideFrictionSurvey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SlideFrictionAnswers>(emptySlideFrictionAnswers);
  const [hasTriedToAdvance, setHasTriedToAdvance] = useState(false);
  const [completionState, setCompletionState] = useState<"success" | "duplicate" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [hasRestoredLocalState, setHasRestoredLocalState] = useState(false);

  const screens = useMemo<Screen[]>(() => answers.noSignificantDifficulty
    ? ["slides", "liveFeedback", "recovery"]
    : ["slides", "reasons", "behavior", "awareness", "intervention", "liveFeedback", "recovery"], [answers.noSignificantDifficulty]);
  const screen = screens[step] ?? screens[0];
  const completionPercent = Math.round(((step + 1) / screens.length) * 100);

  useEffect(() => {
    const alreadySubmitted = window.localStorage.getItem(submittedStorageKey);
    if (alreadySubmitted) {
      setCompletionState("success");
      setHasRestoredLocalState(true);
      return;
    }

    const draft = window.localStorage.getItem(draftStorageKey);
    if (draft) {
      try {
        setAnswers({ ...emptySlideFrictionAnswers, ...(JSON.parse(draft) as Partial<SlideFrictionAnswers>) });
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }
    setHasRestoredLocalState(true);
  }, []);

  useEffect(() => {
    if (hasRestoredLocalState && !completionState) {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(answers));
    }
  }, [answers, completionState, hasRestoredLocalState]);

  useEffect(() => {
    setStep((current) => Math.min(current, screens.length - 1));
  }, [screens.length]);

  function update(patch: Partial<SlideFrictionAnswers>) {
    setAnswers((current) => ({ ...current, ...patch }));
    setSubmissionError("");
  }

  function toggleArray(key: "difficultyReasons" | "recoveryBehaviors" | "notSignalingReasons", value: string, maximum?: number) {
    const current = answers[key];
    const selected = current.includes(value);
    if (!selected && maximum && current.length >= maximum) return;
    update({ [key]: selected ? current.filter((item) => item !== value) : [...current, value] } as Partial<SlideFrictionAnswers>);
  }

  function toggleSlide(slideId: string) {
    const selected = answers.difficultSlideIds.includes(slideId);
    if (!selected && answers.difficultSlideIds.length >= 3) return;
    const difficultSlideIds = selected
      ? answers.difficultSlideIds.filter((item) => item !== slideId)
      : [...answers.difficultSlideIds, slideId];
    update({
      noSignificantDifficulty: false,
      difficultSlideIds,
      mostDifficultSlideId: difficultSlideIds.includes(answers.mostDifficultSlideId) ? answers.mostDifficultSlideId : "",
    });
  }

  function selectNoSignificantDifficulty(checked: boolean) {
    update({
      noSignificantDifficulty: checked,
      difficultSlideIds: checked ? [] : answers.difficultSlideIds,
      mostDifficultSlideId: checked ? "" : answers.mostDifficultSlideId,
      difficultyReasons: checked ? [] : answers.difficultyReasons,
      recoveryBehaviors: checked ? [] : answers.recoveryBehaviors,
      lecturerAwareness: checked ? "" : answers.lecturerAwareness,
      notSignalingReasons: checked ? [] : answers.notSignalingReasons,
      preferredIntervention: checked ? "" : answers.preferredIntervention,
    });
  }

  function isValidCurrentScreen() {
    if (screen === "slides") return answers.noSignificantDifficulty || (answers.difficultSlideIds.length > 0 && Boolean(answers.mostDifficultSlideId));
    if (screen === "reasons") return answers.difficultyReasons.length > 0;
    if (screen === "behavior") return answers.recoveryBehaviors.length > 0;
    if (screen === "awareness") {
      const requiresReason = answers.lecturerAwareness === "כנראה שלא" || answers.lecturerAwareness === "לא";
      return Boolean(answers.lecturerAwareness) && (!requiresReason || answers.notSignalingReasons.length > 0);
    }
    if (screen === "intervention") return Boolean(answers.preferredIntervention);
    if (screen === "liveFeedback") return answers.liveFeedbackLikelihood !== null;
    return Boolean(answers.recoverySuccess) && (answers.recoverySuccess === "לא" || Boolean(answers.recoveryTrigger));
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidCurrentScreen()) {
      setHasTriedToAdvance(true);
      return;
    }

    if (step < screens.length - 1) {
      setStep((current) => current + 1);
      setHasTriedToAdvance(false);
      return;
    }
    void submitAnswers();
  }

  async function submitAnswers() {
    setIsSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/submissions/002-slide-friction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousClientId: getOrCreateClientId(), answers }),
      });
      if (response.status === 409) {
        window.localStorage.setItem(submittedStorageKey, JSON.stringify({ duplicateDetectedAt: new Date().toISOString() }));
        window.localStorage.removeItem(draftStorageKey);
        setCompletionState("duplicate");
        return;
      }
      if (!response.ok) throw new Error("Submission failed");
      const receipt = await response.json() as { id: string; submittedAt: string };
      window.localStorage.setItem(submittedStorageKey, JSON.stringify(receipt));
      window.localStorage.removeItem(draftStorageKey);
      setCompletionState("success");
    } catch {
      setSubmissionError("לא הצלחנו לשמור את התשובות כרגע. אפשר לנסות שוב בעוד רגע.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completionState) return <CompletionScreen duplicate={completionState === "duplicate"} />;

  return (
    <main className="page-shell">
      <section className="survey-card" aria-labelledby="survey-title">
        <header className="survey-header">
          <p className="eyebrow">Product Lab #02</p>
          <h1 id="survey-title">איפה איבדתי אותך?</h1>
          <p className="intro">המטרה היא להבין באילו רגעים החומר היה פחות ברור ולשפר את דרך ההוראה והלמידה. אין קשר לציון.</p>
          <p className="privacy-note">השאלון אנונימי ולוקח כ־5–7 דקות. נא לא לכתוב שם או מידע אישי.</p>
        </header>

        <div className="progress-region" aria-label={`שאלה ${step + 1} מתוך ${screens.length}`}>
          <div className="progress-labels"><span>שאלה {step + 1} מתוך {screens.length}</span><span>{completionPercent}%</span></div>
          <div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={screens.length} aria-valuenow={step + 1}>
            <div className="progress-value" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <form onSubmit={submitStep} noValidate>
          <fieldset>
            {screen === "slides" && <SlidesScreen answers={answers} onToggleSlide={toggleSlide} onNoDifficulty={selectNoSignificantDifficulty} onMostDifficult={(mostDifficultSlideId) => update({ mostDifficultSlideId })} />}
            {screen === "reasons" && <MultiSelectScreen title="מה הקשה עליך בשקף הזה?" hint="אפשר לבחור עד שתי תשובות." options={difficultyReasonOptions} selected={answers.difficultyReasons} onToggle={(value) => toggleArray("difficultyReasons", value, 2)} />}
            {screen === "behavior" && <MultiSelectScreen title="כשנתקעת בשקף הזה היום, מה עשית בפועל?" options={recoveryBehaviorOptions} selected={answers.recoveryBehaviors} onToggle={(value) => toggleArray("recoveryBehaviors", value)} />}
            {screen === "awareness" && <AwarenessScreen answers={answers} onAwareness={(lecturerAwareness) => update({ lecturerAwareness, notSignalingReasons: [] })} onToggleReason={(value) => toggleArray("notSignalingReasons", value)} />}
            {screen === "intervention" && <SingleSelectScreen title="מה היה הכי עוזר לך באותו רגע?" options={preferredInterventionOptions} value={answers.preferredIntervention} onChange={(preferredIntervention) => update({ preferredIntervention })} />}
            {screen === "liveFeedback" && <LiveFeedbackScreen answers={answers} onLikelihood={(liveFeedbackLikelihood) => update({ liveFeedbackLikelihood })} onConcern={(liveFeedbackConcern) => update({ liveFeedbackConcern })} />}
            {screen === "recovery" && <RecoveryScreen answers={answers} onSuccess={(recoverySuccess) => update({ recoverySuccess, recoveryTrigger: "" })} onTrigger={(recoveryTrigger) => update({ recoveryTrigger })} />}

            {hasTriedToAdvance && !isValidCurrentScreen() && <p className="error-message" role="alert">יש להשלים את הבחירה לפני שממשיכים.</p>}
            {submissionError && <p className="error-message" role="alert">{submissionError}</p>}
          </fieldset>

          <div className="actions">
            {step > 0 && <button className="button button-secondary" type="button" onClick={() => { setStep((current) => current - 1); setHasTriedToAdvance(false); }}>חזרה</button>}
            <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "שומרים..." : step === screens.length - 1 ? "סיום השאלון" : "המשך"}</button>
          </div>
        </form>
      </section>
    </main>
  );
}

function SlidesScreen({ answers, onToggleSlide, onNoDifficulty, onMostDifficult }: { answers: SlideFrictionAnswers; onToggleSlide: (slideId: string) => void; onNoDifficulty: (checked: boolean) => void; onMostDifficult: (slideId: string) => void }) {
  return <>
    <legend>באילו שקפים היה לך הכי קשה לעקוב?</legend>
    <p className="question-hint">אפשר לבחור עד 3 שקפים.</p>
    <div className="slide-grid" aria-label="בחירת שקפים">
      {lessonSlides.map((slide) => {
        const selected = answers.difficultSlideIds.includes(slide.id);
        const disabled = !selected && answers.difficultSlideIds.length >= 3;
        return <button className={`slide-card ${selected ? "slide-card-selected" : ""}`} type="button" key={slide.id} disabled={answers.noSignificantDifficulty || disabled} aria-pressed={selected} onClick={() => onToggleSlide(slide.id)}><span>שקף</span><strong>{slide.number}</strong></button>;
      })}
    </div>
    <label className={`option no-difficulty-option ${answers.noSignificantDifficulty ? "option-selected" : ""}`}>
      <input type="checkbox" checked={answers.noSignificantDifficulty} onChange={(event) => onNoDifficulty(event.target.checked)} />
      <span>לא היה שקף שבו הרגשתי קושי משמעותי</span>
    </label>
    {!answers.noSignificantDifficulty && answers.difficultSlideIds.length > 0 && <div className="follow-up-choice">
      <p className="question-hint">איזה מהם היה הכי קשה?</p>
      <div className="options" role="radiogroup" aria-label="השקף הכי קשה">
        {answers.difficultSlideIds.map((slideId) => {
          const slide = lessonSlides.find((item) => item.id === slideId);
          return <label className={`option ${answers.mostDifficultSlideId === slideId ? "option-selected" : ""}`} key={slideId}><input type="radio" name="mostDifficultSlide" checked={answers.mostDifficultSlideId === slideId} onChange={() => onMostDifficult(slideId)} /><span>שקף {slide?.number}</span></label>;
        })}
      </div>
    </div>}
  </>;
}

function MultiSelectScreen({ title, hint, options, selected, onToggle }: { title: string; hint?: string; options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <><legend>{title}</legend>{hint && <p className="question-hint">{hint}</p>}<div className="options">{options.map((option) => <label className={`option ${selected.includes(option) ? "option-selected" : ""}`} key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} /><span>{option}</span></label>)}</div></>;
}

function SingleSelectScreen({ title, options, value, onChange }: { title: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <><legend>{title}</legend><div className="options" role="radiogroup" aria-label={title}>{options.map((option) => <label className={`option ${value === option ? "option-selected" : ""}`} key={option}><input type="radio" name={title} checked={value === option} onChange={() => onChange(option)} /><span>{option}</span></label>)}</div></>;
}

function AwarenessScreen({ answers, onAwareness, onToggleReason }: { answers: SlideFrictionAnswers; onAwareness: (value: string) => void; onToggleReason: (value: string) => void }) {
  const needsReason = answers.lecturerAwareness === "כנראה שלא" || answers.lecturerAwareness === "לא";
  return <><SingleSelectScreen title="לדעתך, באותו רגע המרצה ידע שלא הבנת?" options={lecturerAwarenessOptions} value={answers.lecturerAwareness} onChange={onAwareness} />{needsReason && <div className="follow-up-choice"><p className="question-hint">למה לא סימנת או שאלת?</p><div className="options">{notSignalingReasonOptions.map((option) => <label className={`option ${answers.notSignalingReasons.includes(option) ? "option-selected" : ""}`} key={option}><input type="checkbox" checked={answers.notSignalingReasons.includes(option)} onChange={() => onToggleReason(option)} /><span>{option}</span></label>)}</div></div>}</>;
}

function LiveFeedbackScreen({ answers, onLikelihood, onConcern }: { answers: SlideFrictionAnswers; onLikelihood: (value: number) => void; onConcern: (value: string) => void }) {
  return <><legend>עד כמה סביר שהיית משתמש בזה כשאתה מתקשה?</legend><p className="question-hint">נניח שבמהלך השיעור היה לך בטלפון סימון שקט ואנונימי: 🟢 ברור · 🟡 לא בטוח · 🔴 לא הבנתי · 💡 צריך דוגמה</p><div className="scale-options" role="radiogroup" aria-label="סבירות להשתמש בסימון שקט"><span>בכלל לא סביר</span><div>{[1, 2, 3, 4, 5].map((number) => <button className={`scale-button ${answers.liveFeedbackLikelihood === number ? "scale-button-selected" : ""}`} key={number} type="button" aria-pressed={answers.liveFeedbackLikelihood === number} onClick={() => onLikelihood(number)}>{number}</button>)}</div><span>סביר מאוד</span></div><label className="open-field-label" htmlFor="live-feedback-concern">מה עלול לגרום לך לא להשתמש בזה? <span>אופציונלי</span></label><textarea id="live-feedback-concern" rows={3} maxLength={800} value={answers.liveFeedbackConcern} onChange={(event) => onConcern(event.target.value)} placeholder="אפשר לכתוב כאן..." /></>;
}

function RecoveryScreen({ answers, onSuccess, onTrigger }: { answers: SlideFrictionAnswers; onSuccess: (value: string) => void; onTrigger: (value: string) => void }) {
  return <><SingleSelectScreen title="האם היה היום משהו שבהתחלה לא הבנת ואז כן הבנת?" options={recoverySuccessOptions} value={answers.recoverySuccess} onChange={onSuccess} />{answers.recoverySuccess === "כן" && <div className="follow-up-choice"><SingleSelectScreen title="מה גרם לזה להתחבר?" options={recoveryTriggerOptions} value={answers.recoveryTrigger} onChange={onTrigger} /></div>}</>;
}

function getOrCreateClientId() {
  const existing = window.localStorage.getItem(clientStorageKey);
  if (existing) return existing;
  const clientId = window.crypto.randomUUID();
  window.localStorage.setItem(clientStorageKey, clientId);
  return clientId;
}

function CompletionScreen({ duplicate }: { duplicate: boolean }) {
  return <main className="page-shell"><section className="survey-card completion-card" aria-labelledby="completion-title"><div className="completion-icon" aria-hidden="true">✓</div><p className="eyebrow">{duplicate ? "הגשה קודמת נמצאה" : "תודה"}</p><h1 id="completion-title">{duplicate ? "נראה שכבר שלחת תשובה" : "תודה."}</h1><p>{duplicate ? "כדי למנוע כפילויות, אפשר להגיש תשובה אחת מכל דפדפן עבור הניסוי הזה." : "המטרה היא להבין איפה החומר הופך לפחות ברור ולשפר את דרך ההוראה והלמידה בשיעורים הבאים."}</p></section></main>;
}
