"use client";

import { useState, type ReactNode } from "react";
import styles from "./formula-sheet.module.css";

type Entry = { id: string; lesson: string; topic: string; search: string; content: ReactNode };
const lessonNames = ["אנטנות וגלים", "אותות וספקטרום", "מתנדים וברקהאוזן", "אפנון AM"];

export default function FormulaSheet({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [topic, setTopic] = useState("all");
  const [view, setView] = useState<"cards" | "rows">("cards");
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
      <label className={styles.selectLabel}>לפי שיעור<select value={lesson} onChange={(event) => setLesson(event.target.value)}><option value="all">כל השיעורים</option>{lessonNames.map((name, i) => <option value={String(i + 1)} key={name}>שיעור {i + 1} · {name}</option>)}</select></label>
      <label className={styles.selectLabel}>לפי נושא<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="all">כל הנושאים</option>{topics.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
    </section>
    <div className={styles.summary}><span role="status" aria-live="polite">מוצגות {filtered.length} מתוך {entries.length} נוסחאות</span><div className={styles.summaryActions}><div className={styles.viewSwitch} role="group" aria-label="אופן תצוגת הנוסחאות"><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}>כרטיסיות</button><button type="button" aria-pressed={view === "rows"} onClick={() => setView("rows")}>שורות</button></div><button type="button" className={styles.reset} onClick={reset}>איפוס סינון וחיפוש</button></div></div>
    <section className={`${styles.grid} ${view === "rows" ? styles.rows : ""}`} aria-label={`נוסחאות — תצוגת ${view === "cards" ? "כרטיסיות" : "שורות"}`}>{filtered.map((entry) => <div key={entry.id}>{entry.content}</div>)}</section>
    {filtered.length === 0 && <div className={styles.empty}><h2>לא נמצאו נוסחאות מתאימות</h2><p>אפשר לשנות את החיפוש או לאפס את הסינון.</p><button className={styles.reset} onClick={reset}>הצגת כל הנוסחאות</button></div>}
    <p className={styles.footer}>{entries.length} נוסחאות · 4 שיעורים · הקישורים למערכי השיעור מוצגים בהתאם לחומרים הזמינים באתר.</p>
  </div>;
}
