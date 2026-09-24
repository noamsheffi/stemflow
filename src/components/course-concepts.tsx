"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { conceptMap } from "../lib/concept-map";
import formulaSheet from "../lib/formula-sheet-data.json";
import { concepts, course, lessons } from "../lib/course-data";
import styles from "./student-workspace.module.css";

type Concept = (typeof conceptMap)[number];
const lessonNumber = (value: string) => Number(value.match(/\d+/)?.[0] ?? 0);

export default function CourseConcepts() {
  const [selectedId, setSelectedId] = useState(conceptMap[0]?.id ?? "");
  const [view, setView] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase();
  const filtered = useMemo(() => conceptMap.filter((item) => !term || [item.title, item.english, item.lesson, item.category, item.summary, item.details, ...item.formulas].join(" ").toLocaleLowerCase().includes(term)), [term]);
  const visibleIds = new Set(filtered.map((item) => item.id));
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const lessonNumbers = [...new Set(filtered.map((item) => lessonNumber(item.lesson)))].sort((a, b) => b - a);
  const byLesson = lessonNumbers.map((number) => ({ number, items: filtered.filter((item) => lessonNumber(item.lesson) === number) }));
  const graphWidth = Math.max(160, byLesson.length * 172 - 12);
  const graphHeight = Math.max(96, Math.max(...byLesson.map((group) => group.items.length), 1) * 56 + 55);
  const positionById = new Map<string, { x: number; y: number }>();
  byLesson.forEach((group, column) => group.items.forEach((item, row) => positionById.set(item.id, { x: 80 + column * 172, y: 66 + row * 56 })));
  const incomingIds = selected ? conceptMap.filter((item) => item.connections.includes(selected.id)).map((item) => item.id) : [];
  const relatedIds = new Set(selected ? [selected.id, ...selected.connections, ...incomingIds] : []);
  const selectedData = selected ? concepts.find((item) => item.conceptId === selected.id) : undefined;
  const selectedLesson = selected ? lessons.find((item) => item.number === lessonNumber(selected.lesson)) : undefined;
  const formulaNames = (selected?.formulas ?? []).map((tex) => formulaSheet.find((item) => item.formula_latex === tex)).filter((item): item is (typeof formulaSheet)[number] => Boolean(item));

  const edgePaths = filtered.flatMap((item) => item.connections.flatMap((relatedId) => {
    if (!visibleIds.has(relatedId) || item.id.localeCompare(relatedId) > 0) return [];
    const from = positionById.get(item.id), to = positionById.get(relatedId);
    if (!from || !to) return [];
    const dx = (to.x - from.x) * 0.48;
    const path = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
    const active = item.id === selected?.id || relatedId === selected?.id;
    return [{ id: `${item.id}-${relatedId}`, path, active }];
  }));

  const conceptButton = (item: Concept) => <button type="button" className={`${styles.conceptNode} ${selected?.id === item.id ? styles.conceptNodeSelected : ""} ${selected && !relatedIds.has(item.id) ? styles.conceptNodeDim : ""}`} key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id}>
    <strong>{item.title}</strong><span dir="ltr">{item.english}</span>
  </button>;

  return <>
    <header className={styles.pageHeading}><p className={styles.pageKicker}>{course.title} · הקשרים בין נושאים</p><h1>מפת מושגים</h1><p>עוברים בין מושגי הקורס ורואים אילו רעיונות מתחברים זה לזה.</p></header>
    <div className={styles.searchControls}>
      <label className={styles.searchField}><span aria-hidden="true">⌕</span><span className={styles.srOnly}>חיפוש מושג</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש בעברית או באנגלית" /></label>
      <div className={styles.segmented} role="group" aria-label="אופן תצוגת המושגים"><button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>מפת קשרים</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>רשימה</button></div>
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">{filtered.length} מתוך {conceptMap.length} מושגים</p>
    {!selected ? <p className={styles.emptyState}>לא נמצאו מושגים מתאימים לחיפוש.</p> : view === "map" ? <div className={styles.conceptMapLayout}>
      <div className={styles.conceptMapViewport} role="region" aria-label="מושגים לפי שיעור; אפשר לגלול לרוחב">
        <div className={styles.conceptGraph} style={{ width: graphWidth, minHeight: graphHeight }}>
          <svg className={styles.conceptEdges} width={graphWidth} height={graphHeight} viewBox={`0 0 ${graphWidth} ${graphHeight}`} aria-hidden="true">
            {edgePaths.map((edge) => <path key={edge.id} d={edge.path} className={edge.active ? styles.conceptEdgeActive : styles.conceptEdge} />)}
          </svg>
          <div className={styles.conceptColumns}>
            {byLesson.map((group) => <section className={styles.conceptColumn} key={group.number} aria-label={`שיעור ${group.number}`}>
              <h2>שיעור <span dir="ltr">{group.number}</span></h2>{group.items.map(conceptButton)}
            </section>)}
          </div>
        </div>
      </div>
      <aside className={`${styles.card} ${styles.conceptDetail}`} aria-label="פרטי מושג נבחר">
        <span className={styles.conceptTag}>{selected.lesson} · {selected.category}</span>
        <h2>{selected.title}</h2><span dir="ltr">{selected.english}</span><p>{selected.summary}</p>
        <h3>מושגים מקושרים</h3>
        {relatedIds.size > 1 ? [...relatedIds].filter((id) => id !== selected.id).map((id) => {
          const related = conceptMap.find((item) => item.id === id);
          return related ? <button className={styles.conceptRelation} key={id} type="button" onClick={() => setSelectedId(id)}>{related.title}</button> : null;
        }) : <p className={styles.reflectionNote}>אין קשרים רשומים למושג הזה.</p>}
        {formulaNames.length > 0 && <><h3>נוסחאות בנושא</h3>{formulaNames.map((item) => <Link className={styles.conceptRelation} key={item.id} href={`/course/${course.courseId}/formulas#${item.id}`}>{item.name}</Link>)}</>}
        {selectedLesson ? <Link className={styles.contextMore} href={`/course/${course.courseId}/lessons/${selectedLesson.lessonId}/slides`}>למערך השיעור <span aria-hidden="true">←</span></Link> : <p className={styles.reflectionNote}>אין מערך שיעור רשום לנושא הזה.</p>}
      </aside>
    </div> : <>
      <div className={styles.conceptCards} aria-label="רשימת מושגים">{filtered.map((item) => <button className={styles.conceptCard} key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selected.id === item.id}><strong>{item.title}</strong><small dir="ltr">{item.english}</small><span>{item.lesson} · {item.category}</span></button>)}</div>
      <aside className={`${styles.card} ${styles.conceptDetail} ${styles.listConceptDetail}`} aria-label="פרטי מושג נבחר"><span className={styles.conceptTag}>{selected.lesson} · {selected.category}</span><h2>{selected.title}</h2><span dir="ltr">{selected.english}</span><p>{selected.summary}</p>{selectedData?.relatedConceptIds.map((id) => { const related = concepts.find((item) => item.conceptId === id); return related ? <button className={styles.conceptRelation} key={id} type="button" onClick={() => setSelectedId(id)}>{related.name}</button> : null; })}</aside>
    </>}
  </>;
}
