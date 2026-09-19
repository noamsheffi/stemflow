"use client";

import { useState, type ReactNode } from "react";
import styles from "./formula-sheet.module.css";

type Entry = { id: string; lesson: string; topic: string; search: string; content: ReactNode };
const lessonNames = ["אנטנות וגלים", "אותות וספקטרום", "מתנדים וברקהאוזן", "אפנון AM"];

export default function FormulaSheet({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [topic, setTopic] = useState("all");
  const topics = [...new Set(entries.map((entry) => entry.topic))];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = entries.filter((entry) => (lesson === "all" || lesson === entry.lesson) && (topic === "all" || topic === entry.topic) && terms.every((term) => entry.search.includes(term)));
  function reset() { setQuery(""); setLesson("all"); setTopic("all"); }
  return <div className={styles.sheet} dir="rtl">
    <header className={styles.hero}>
      <p className={styles.eyebrow}>מערכות תקשורת · 11.9004 · סמסטר א׳</p>
      <h1>כל נוסחה. בהקשר שלה.</h1>
      <p>נוסחאון אינטראקטיבי עם משמעות הסמלים, יחידות המידה, שימוש בשיעור ודגשים לקראת הבחינה.</p>
    </header>
    <section className={styles.controls} aria-label="חיפוש וסינון נוסחאות">
      <label className={styles.search}>חיפוש בנוסחאון<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="שם נוסחה, סמל, נושא או יחידה — למשל AM, תדר, Hz" /></label>
      <fieldset className={styles.filters}><legend>לפי שיעור</legend><div className={styles.pills}>
        <button type="button" aria-pressed={lesson === "all"} onClick={() => setLesson("all")}>כל השיעורים</button>
        {lessonNames.map((name, i) => <button type="button" key={name} aria-pressed={lesson === String(i + 1)} onClick={() => setLesson(String(i + 1))}>שיעור {i + 1} · {name}</button>)}
      </div></fieldset>
      <fieldset className={styles.filters}><legend>לפי נושא</legend><div className={styles.pills}>
        <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>כל הנושאים</button>
        {topics.map((name) => <button type="button" key={name} aria-pressed={topic === name} onClick={() => setTopic(name)}>{name}</button>)}
      </div></fieldset>
    </section>
    <div className={styles.summary}><span role="status" aria-live="polite">מוצגות {filtered.length} מתוך {entries.length} נוסחאות</span><button type="button" className={styles.reset} onClick={reset}>איפוס סינון וחיפוש</button></div>
    <section className={styles.grid} aria-label="נוסחאות">{filtered.map((entry) => <div key={entry.id}>{entry.content}</div>)}</section>
    {filtered.length === 0 && <div className={styles.empty}><h2>לא נמצאו נוסחאות מתאימות</h2><p>אפשר לשנות את החיפוש או לאפס את הסינון.</p><button className={styles.reset} onClick={reset}>הצגת כל הנוסחאות</button></div>}
    <p className={styles.footer}>{entries.length} נוסחאות · 4 שיעורים · הקישורים למערכי השיעור מוצגים בהתאם לחומרים הזמינים באתר.</p>
  </div>;
}
