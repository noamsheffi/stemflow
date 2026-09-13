"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { emptyAnswers, questions, type Answers } from "../lib/survey";

const draftStorageKey = "stemflow:product-lab-001:draft";
const clientStorageKey = "stemflow:product-lab-001:client-id";
const submittedStorageKey = "stemflow:product-lab-001:submitted";

export default function Survey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [hasTriedToAdvance, setHasTriedToAdvance] = useState(false);
  const [completionState, setCompletionState] = useState<"success" | "duplicate" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [hasRestoredLocalState, setHasRestoredLocalState] = useState(false);
  const question = questions[step];
  const answer = answers[question.key];
  const completionPercent = Math.round(((step + 1) / questions.length) * 100);

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
        const savedAnswers = JSON.parse(draft) as Partial<Answers>;
        setAnswers({ ...emptyAnswers, ...savedAnswers });
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

  function updateAnswer(value: string) {
    setAnswers((current) => ({ ...current, [question.key]: value }));
    setSubmissionError("");
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim()) {
      setHasTriedToAdvance(true);
      return;
    }

    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      setHasTriedToAdvance(false);
      return;
    }

    void submitAnswers();
  }

  function goBack() {
    if (step === 0) return;
    setStep((current) => current - 1);
    setHasTriedToAdvance(false);
  }

  async function submitAnswers() {
    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const response = await fetch("/api/submissions", {
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

  if (completionState) {
    return <CompletionScreen duplicate={completionState === "duplicate"} />;
  }

  return (
    <main className="page-shell">
      <section className="survey-card" aria-labelledby="survey-title">
        <header className="survey-header">
          <p className="eyebrow">Product Lab #01</p>
          <h1 id="survey-title">איך נראית הלמידה שלך היום?</h1>
          <p className="intro">
            המטרה היא להבין איך אתם לומדים ומה מקשה עליכם. אין תשובה נכונה או לא נכונה,
            ואין קשר לציון.
          </p>
          <p className="privacy-note">השאלון אנונימי. נא לא לכתוב שם או מידע אישי.</p>
        </header>

        <div className="progress-region" aria-label={`שאלה ${step + 1} מתוך ${questions.length}`}>
          <div className="progress-labels">
            <span>שאלה {step + 1} מתוך {questions.length}</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={step + 1}>
            <div className="progress-value" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <form onSubmit={submitStep} noValidate>
          <fieldset>
            <legend>{question.prompt}</legend>
            {question.hint && <p className="question-hint">{question.hint}</p>}

            {question.type === "text" ? (
              <textarea
                id={question.key}
                value={answer}
                onChange={(event) => updateAnswer(event.target.value)}
                aria-describedby={hasTriedToAdvance && !answer.trim() ? `${question.key}-error` : undefined}
                autoFocus
                rows={5}
                maxLength={question.maxLength}
                placeholder="כתוב כאן..."
              />
            ) : (
              <div className="options" role="radiogroup" aria-label={question.prompt}>
                {question.options?.map((option) => (
                  <label className={`option ${answer === option ? "option-selected" : ""}`} key={option}>
                    <input
                      type="radio"
                      name={question.key}
                      value={option}
                      checked={answer === option}
                      onChange={(event) => updateAnswer(event.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {hasTriedToAdvance && !answer.trim() && (
              <p className="error-message" id={`${question.key}-error`} role="alert">יש לבחור או לכתוב תשובה לפני שממשיכים.</p>
            )}
            {submissionError && <p className="error-message" role="alert">{submissionError}</p>}
          </fieldset>

          <div className="actions">
            {step > 0 && <button className="button button-secondary" type="button" onClick={goBack}>חזרה</button>}
            <button className="button button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "שומרים..." : step === questions.length - 1 ? "סיום השאלון" : "המשך"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function getOrCreateClientId() {
  const existing = window.localStorage.getItem(clientStorageKey);
  if (existing) return existing;

  const clientId = window.crypto.randomUUID();
  window.localStorage.setItem(clientStorageKey, clientId);
  return clientId;
}

function CompletionScreen({ duplicate }: { duplicate: boolean }) {
  return (
    <main className="page-shell">
      <section className="survey-card completion-card" aria-labelledby="completion-title">
        <div className="completion-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">{duplicate ? "הגשה קודמת נמצאה" : "תודה על השיתוף"}</p>
        <h1 id="completion-title">{duplicate ? "נראה שכבר שלחת תשובה" : "התשובות שלך נשמרו"}</h1>
        <p>{duplicate ? "כדי למנוע כפילויות, אפשר להגיש תשובה אחת מכל דפדפן עבור הניסוי הזה." : "התשובות נשמרו באופן אנונימי לצורך המחקר בכיתה."}</p>
        <p>המשוב שלך יעזור לנו להבין טוב יותר את חוויית הלמידה בקורס.</p>
      </section>
    </main>
  );
}
