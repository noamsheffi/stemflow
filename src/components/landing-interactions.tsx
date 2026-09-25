"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

const demoViews = [
  { id: "workspace", label: "הקורסים שלי", url: "/workspace", address: "syllo.live/workspace" },
  { id: "lesson", label: "מערך שיעור 04", url: "/course/communication-systems/lessons/lesson-04/slides", address: "syllo.live/courses/11.9004/lessons/4" },
] as const;

export default function LandingDemo() {
  const [active, setActive] = useState(0);
  const frameBody = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const view = demoViews[active];

  useEffect(() => {
    const element = frameBody.current;
    if (!element) return;
    const resize = () => setScale(Math.min(1, element.clientWidth / 1440));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div className={styles.demoWrap}>
    <header className={styles.sectionHeading}><p className={styles.eyebrow}>לראות מבפנים</p><h2 id="demo-title">ככה זה נראה בקורס אמיתי.</h2><p>מערכות תקשורת, סמסטר א׳. עברו בין מסך הקורסים למערך השיעור.</p></header>
    <div className={styles.demoTabs} role="tablist" aria-label="בחירת מסך להדגמה">
      {demoViews.map((item, index) => <button type="button" aria-pressed={active === index} className={active === index ? styles.demoTabActive : ""} key={item.id} onClick={() => setActive(index)}>{item.label}</button>)}
    </div>
    <div className={styles.demoWindow}>
      <div className={styles.windowBar} aria-hidden="true"><i /><i /><i /><span className={styles.mono} dir="ltr">{view.address}</span></div>
      <div className={styles.windowBody} ref={frameBody} style={{ height: Math.max(340, 900 * scale) }}>
        <iframe key={view.id} src={view.url} title={`הדגמה אינטראקטיבית: ${view.label}`} loading="lazy" style={{ transform: `scale(${scale})` }} />
      </div>
    </div>
    <div className={styles.demoNote}><span>ההדגמה מציגה את סביבת הלמידה.</span><Link href={view.url}>לפתיחה בחלון מלא ←</Link></div>
  </div>;
}
