"use client";

import Link from "next/link";
import { useState } from "react";
import { courseAppPath } from "../lib/course-data";
import ConceptMindMap from "./concept-mind-map";
import CollectionToolbar from "./collection-toolbar";
import styles from "./concept-map.module.css";

type Entry = { id: string; title: string; english: string; lesson: string; category: string; summary: string; search: string; connections: string[] };
const lessons = ["שיעור 1", "שיעור 2", "שיעור 3", "שיעור 4", "שיעור 5"];
const lessonTitles = ["תווך, גלים ואנטנות", "אותות וספקטרום", "מתנדים ומשוב", "אפנון AM", "אפנון FM ותקשורת ספרתית"];

export default function ConceptMap({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"cards" | "branches">("branches");
  const categories = [...new Set(entries.map((entry) => entry.category))];
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = entries.filter((entry) => (lesson === "all" || entry.lesson === lesson) && (category === "all" || entry.category === category) && terms.every((term) => entry.search.includes(term)));
  function reset() { setQuery(""); setLesson("all"); setCategory("all"); }
  function conceptButton(entry: Entry, compact = false) {
    const related = entry.connections.map((id) => entryById.get(id)).filter((item): item is Entry => Boolean(item));

    return <Link className={compact ? styles.node : styles.card} key={entry.id} href={`${courseAppPath("concepts")}/${entry.id}`}>
      {!compact && <span className={styles.badges}><span>{entry.lesson}</span><span>{entry.category}</span></span>}
      <strong>{entry.title}</strong><span className={styles.english} dir="ltr">{entry.english}</span>
      {compact && related.length > 0 && <span className={styles.nodeRelations}>קשור ל־{related.slice(0, 2).map((item) => item.title).join(" · ")}{related.length > 2 ? " ועוד" : ""}</span>}
      {!compact && <><span className={styles.description}>{entry.summary}</span><span className={styles.cardFooter}><span>{entry.connections.length} מושגים קשורים</span><b>לגלות את הקשרים</b></span></>}
    </Link>;
  }
  return <div className={styles.map} dir="rtl">
    <header className={styles.hero}><div className={styles.heroContent}><p className="item-kicker">מערכות תקשורת · 11.9004 · סמסטר א׳</p><h1>מפת המושגים</h1><p>רואים את הקשרים. מבינים את התמונה.</p><span>מהאנטנה ועד לאפנון — הסברים, נוסחאות ודוגמאות שמחברים את חומרי הקורס.</span></div><div className={styles.heroStats}><span>{entries.length} מושגים</span><span>5 שיעורים</span><span>למידה דרך קשרים</span></div></header>
    <section className={styles.controls} aria-label="חיפוש וסינון מושגים">
      <label className={styles.search}>מה רוצים להבין היום?<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש מושג, מונח באנגלית או נוסחה — למשל קולפיץ, Fourier, AM" /></label>
      <label className={styles.selectLabel}>לפי שיעור<select value={lesson} onChange={(event) => setLesson(event.target.value)}><option value="all">כל השיעורים</option>{lessons.map((item, i) => <option value={item} key={item}>{item} · {lessonTitles[i]}</option>)}</select></label>
      <label className={styles.selectLabel}>לפי נושא<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">כל הנושאים</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
    </section>
    <CollectionToolbar ariaLabel="אופן התצוגה" selectedView={view} views={[{ value: "cards", label: "כרטיסים" }, { value: "branches", label: "מפת קשרים" }]} onViewChange={setView} summary={`מוצגים ${filtered.length} מתוך ${entries.length} מושגים`} onReset={reset} resetLabel="איפוס חיפוש וסינון" />
    {filtered.length === 0 ? <section className={styles.empty}><h2>לא נמצאו מושגים מתאימים</h2><p>נסו מונח אחר או הציגו שוב את כל המושגים.</p><button className={styles.reset} onClick={reset}>הצגת כל המושגים</button></section> : view === "cards" ? <section className={styles.grid} aria-label="כרטיסי מושגים">{filtered.map((entry) => conceptButton(entry))}</section> : <ConceptMindMap entries={entries} visibleIds={filtered.map((entry) => entry.id)} />}
    <p className={styles.footnote}>כל מושג מחובר להקשר שלו בקורס, עם הסברים וקשרים למושגים נוספים.</p>
  </div>;
}
