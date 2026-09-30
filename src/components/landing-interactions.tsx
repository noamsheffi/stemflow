"use client";

import { useEffect, useState } from "react";
import styles from "../app/company.module.css";

const phases = [
  { number: "01", phase: "בכיתה", title: "לתפוס את הרגע", description: "מה עבד? איפה צריך לעזור?" },
  { number: "02", phase: "אחרי השיעור", title: "לחבר את הידע", description: "שיעורים · נוסחאות · מושגים" },
  { number: "03", phase: "לקראת השיעור הבא", title: "לדעת מה לשנות", description: "רפלקציה שהופכת לפעולה." },
];

export function LearningLoop() {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % phases.length), 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return <div className={styles.loop} aria-label="מחזור הלמידה של Syllo">
    <div className={styles.loopHeading}><span>מחזור אחד. למידה מתמשכת.</span><span className={styles.mono} dir="ltr">SYLLO / LOOP</span></div>
    <div className={styles.loopCards} onMouseLeave={() => setPaused(false)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
      {phases.map((phase, index) => <button type="button" key={phase.number} className={`${styles.loopStep} ${active === index ? styles.loopStepActive : ""}`} aria-pressed={active === index} onMouseEnter={() => { setPaused(true); setActive(index); }} onFocus={() => { setPaused(true); setActive(index); }} onClick={() => { setPaused(true); setActive(index); }}>
        <span className={`${styles.stepNumber} ${styles.mono}`} dir="ltr">{phase.number}</span><span className={styles.stepContent}><span className={styles.loopLabel}>{phase.phase}</span><strong>{phase.title}</strong><span className={styles.loopDescription}>{phase.description}</span><span className={styles.progressTrack} aria-hidden="true"><i /></span></span>
      </button>)}
    </div>
    <p className={styles.loopReturn}>כל שיעור הוא התחלה של השיעור הבא <span aria-hidden="true">↺</span></p>
  </div>;
}
