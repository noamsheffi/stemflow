"use client";

import Link from "next/link";
import { useState } from "react";
import { courseAppPath } from "../lib/course-data";
import styles from "./concept-map.module.css";

type Entry = { id: string; title: string; english: string; lesson: string; category: string; summary: string; search: string; connections: string[] };
const lessons = ["שיעור 1", "שיעור 2", "שיעור 3", "שיעור 4"];
const lessonTitles = ["תווך, גלים ואנטנות", "אותות וספקטרום", "מתנדים ומשוב", "אפנון AM"];

export default function ConceptMap({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"cards" | "branches">("cards");
  const categories = [...new Set(entries.map((entry) => entry.category))];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = entries.filter((entry) => (lesson === "all" || entry.lesson === lesson) && (category === "all" || entry.category === category) && terms.every((term) => entry.search.includes(term)));
  function reset() { setQuery(""); setLesson("all"); setCategory("all"); }
  function conceptButton(entry: Entry, compact = false) {
    return <Link className={compact ? styles.node : styles.card} key={entry.id} href={`${courseAppPath("concepts")}/${entry.id}`}>
      {!compact && <span className={styles.badges}><span>{entry.lesson}</span><span>{entry.category}</span></span>}
      <strong>{entry.title}</strong><span className={styles.english} dir="ltr">{entry.english}</span>
      {!compact && <><span className={styles.description}>{entry.summary}</span><span className={styles.cardFooter}><span>{entry.connections.length} מושגים קשורים</span><b>לגלות את הקשרים ←</b></span></>}
    </Link>;
  }
  return <div className={styles.map} dir="rtl">
    <header className={styles.hero}><p className="item-kicker">מערכות תקשורת · 11.9004 · סמסטר א׳</p><h1>מפת המושגים</h1><p>רואים את הקשרים. מבינים את התמונה.</p><span>מהאנטנה ועד לאפנון — הסברים, נוסחאות ודוגמאות שמחברים את חומרי הקורס.</span><div className={styles.heroStats}><span>{entries.length} מושגים</span><span>4 שיעורים</span><span>למידה דרך קשרים</span></div></header>
    <section className={styles.controls} aria-label="חיפוש וסינון מושגים">
      <label className={styles.search}>מה רוצים להבין היום?<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש מושג, מונח באנגלית או נוסחה — למשל קולפיץ, Fourier, AM" /></label>
      <fieldset><legend>לפי שיעור</legend><div className={styles.pills}><button aria-pressed={lesson === "all"} onClick={() => setLesson("all")}>כל השיעורים</button>{lessons.map((item, i) => <button key={item} aria-pressed={lesson === item} onClick={() => setLesson(item)}>{item} · {lessonTitles[i]}</button>)}</div></fieldset>
      <fieldset><legend>לפי נושא</legend><div className={styles.pills}><button aria-pressed={category === "all"} onClick={() => setCategory("all")}>כל הנושאים</button>{categories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></fieldset>
    </section>
    <div className={styles.toolbar}><div className={styles.viewToggle} role="group" aria-label="אופן התצוגה"><button aria-pressed={view === "cards"} onClick={() => setView("cards")}>כרטיסים</button><button aria-pressed={view === "branches"} onClick={() => setView("branches")}>מפת ענפים</button></div><span role="status" aria-live="polite">מוצגים {filtered.length} מתוך {entries.length} מושגים</span><button className={styles.reset} onClick={reset}>איפוס חיפוש וסינון</button></div>
    {filtered.length === 0 ? <section className={styles.empty}><h2>לא נמצאו מושגים מתאימים</h2><p>נסו מונח אחר או הציגו שוב את כל המושגים.</p><button className={styles.reset} onClick={reset}>הצגת כל המושגים</button></section> : view === "cards" ? <section className={styles.grid} aria-label="כרטיסי מושגים">{filtered.map((entry) => conceptButton(entry))}</section> : <section aria-label="מפת ענפים לפי שיעור"><div className={styles.root}>מערכות תקשורת<span>בחרו מושג כדי לחקור את הקשרים שלו</span></div><div className={styles.branches}>{lessons.map((item, i) => { const items = filtered.filter((entry) => entry.lesson === item); return items.length ? <section className={styles.branch} key={item}><h2><span>{item} · {items.length} מושגים</span>{lessonTitles[i]}</h2><div>{items.map((entry) => conceptButton(entry, true))}</div></section> : null; })}</div></section>}
    <p className={styles.footnote}>כל מושג מחובר להקשר שלו בקורס. חומרי שיעור 4 יופיעו כשהם יהיו זמינים באתר.</p>
  </div>;
}
