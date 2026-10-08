"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { conceptMap } from "../lib/concept-map";
import { courseMindMap, type CourseMindMapNode } from "../lib/course-mind-map";
import formulaSheet from "../lib/formula-sheet-data.json";
import { concepts, course, lessons } from "../lib/course-data";
import styles from "./student-workspace.module.css";

type Concept = (typeof conceptMap)[number];
type MindPosition = { node: CourseMindMapNode; x: number; y: number; lessonNumber: number; width: number };
type MindEdge = { id: string; path: string; lessonNumber: number };
const lessonNumber = (value: string) => Number(value.match(/\d+/)?.[0] ?? 0);
const leaves = (node: CourseMindMapNode): number => node.children.length ? node.children.reduce((sum, child) => sum + leaves(child), 0) : 1;
const nodeWidth = (node: CourseMindMapNode) => node.kind === "root" ? 216 : node.kind === "lesson" ? 198 : node.kind === "topic" ? 176 : 198;

export default function CourseConcepts() {
  const [selectedId, setSelectedId] = useState(conceptMap.find((item) => item.id === "carrier-wave")?.id ?? conceptMap[0]?.id ?? "");
  const [view, setView] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const term = query.trim().toLocaleLowerCase();
  const filtered = useMemo(() => conceptMap.filter((item) => !term || [item.title, item.english, item.lesson, item.category, item.summary, item.details, ...item.formulas].join(" ").toLocaleLowerCase().includes(term)), [term]);
  const visibleIds = new Set(filtered.map((item) => item.id));
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const incomingIds = selected ? conceptMap.filter((item) => item.connections.includes(selected.id)).map((item) => item.id) : [];
  const relatedIds = new Set(selected ? [selected.id, ...selected.connections, ...incomingIds] : []);
  const selectedData = selected ? concepts.find((item) => item.conceptId === selected.id) : undefined;
  const selectedLesson = selected ? lessons.find((item) => item.number === lessonNumber(selected.lesson)) : undefined;
  const formulaNames = (selected?.formulas ?? []).map((tex) => formulaSheet.find((item) => item.formula_latex === tex)).filter((item): item is (typeof formulaSheet)[number] => Boolean(item));

  const filteredTree = useMemo(() => {
    const prune = (node: CourseMindMapNode): CourseMindMapNode | null => {
      if (node.conceptId) return visibleIds.has(node.conceptId) ? node : null;
      const children = node.children.map(prune).filter((child): child is CourseMindMapNode => Boolean(child));
      return node.kind === "root" || children.length ? { ...node, children } : null;
    };
    return prune(courseMindMap)!;
  }, [filtered]);

  const mapWidth = 3400;
  const rootX = mapWidth / 2;
  const rowPitch = 78;
  const maxSideLeaves = Math.max(...[-1, 1].map((side) => filteredTree.children.filter((node) => (((node.lessonNumber ?? 0) <= 2) === (side < 0))).reduce((sum, node) => sum + leaves(node), 0)), 1);
  const mapHeight = maxSideLeaves * rowPitch + 120;
  const positions: MindPosition[] = [{ node: filteredTree, x: rootX, y: mapHeight / 2, lessonNumber: 0, width: nodeWidth(filteredTree) }];
  const treeEdges: MindEdge[] = [];

  const placeSubtree = (node: CourseMindMapNode, depth: number, top: number, side: number, branchLesson: number, parent?: MindPosition) => {
    const y = top + leaves(node) * rowPitch / 2;
    const point: MindPosition = { node, x: rootX + side * depth * 220, y, lessonNumber: branchLesson, width: nodeWidth(node) };
    positions.push(point);
    if (parent) {
      const sx = parent.x + side * parent.width / 2;
      const tx = point.x - side * point.width / 2;
      const bend = (tx - sx) * 0.48;
      treeEdges.push({ id: `${parent.node.id}->${node.id}`, path: `M ${sx} ${parent.y} C ${sx + bend} ${parent.y}, ${tx - bend} ${point.y}, ${tx} ${point.y}`, lessonNumber: branchLesson });
    }
    let childTop = top;
    for (const child of node.children) {
      placeSubtree(child, depth + 1, childTop, side, branchLesson, point);
      childTop += leaves(child) * rowPitch;
    }
  };

  for (const side of [-1, 1]) {
    const branchNodes = filteredTree.children.filter((node) => ((node.lessonNumber ?? 0) <= 2) === (side < 0));
    const sideLeaves = branchNodes.reduce((sum, node) => sum + leaves(node), 0);
    let top = (mapHeight - sideLeaves * rowPitch) / 2;
    for (const branch of branchNodes) {
      placeSubtree(branch, 1, top, side, branch.lessonNumber ?? 0, positions[0]);
      top += leaves(branch) * rowPitch;
    }
  }

  const positionById = new Map(positions.filter((position) => position.node.conceptId).map((position) => [position.node.conceptId!, position]));
  const crossEdges: MindEdge[] = [...relatedIds].filter((id) => id !== selected?.id && visibleIds.has(id)).flatMap((relatedId) => {
    const from = positionById.get(selected?.id ?? ""), to = positionById.get(relatedId);
    if (!from || !to || from.lessonNumber === to.lessonNumber) return [];
    const dx = (to.x - from.x) * 0.45;
    return [{ id: `related-${selected?.id}-${relatedId}`, path: `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`, lessonNumber: from.lessonNumber }];
  });

  useEffect(() => {
    if (view !== "map") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }, [view, filtered.length]);

  const conceptButton = (item: Concept, position: MindPosition) => <button type="button" className={`${styles.mindMapNode} ${styles.mindMapConcept} ${selected?.id === item.id ? styles.mindMapSelected : ""} ${selected && !relatedIds.has(item.id) ? styles.conceptNodeDim : ""}`} data-lesson={position.lessonNumber} key={item.id} style={{ left: position.x, top: position.y }} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id} title={item.english}>
    <strong>{item.title}</strong>
  </button>;

  return <>
    <header className={styles.pageHeading}><p className={styles.pageKicker}>{course.title} · הקשרים בין נושאים</p><h1>מפת מושגים</h1><p>נושא מרכזי, ענפים לפי שיעור ותתי־נושאים שמראים איך הידע נבנה.</p></header>
    <div className={styles.searchControls}>
      <label className={styles.searchField}><span aria-hidden="true">⌕</span><span className={styles.srOnly}>חיפוש מושג</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש בעברית או באנגלית" /></label>
      <div className={styles.segmented} role="group" aria-label="אופן תצוגת המושגים"><button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>מפת חשיבה</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>רשימה</button></div>
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">{filtered.length} מתוך {conceptMap.length} מושגים</p>
    {!selected ? <p className={styles.emptyState}>לא נמצאו מושגים מתאימים לחיפוש.</p> : view === "map" ? <div className={styles.conceptMapLayout}>
      <div className={styles.conceptMapViewport} ref={viewportRef} role="region" aria-label="מפת חשיבה של מושגי הקורס; אפשר לגלול לכל הכיוונים">
        <div className={styles.mindMapCanvas} style={{ width: mapWidth, height: mapHeight }}>
          <svg className={styles.mindMapEdges} width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} aria-hidden="true">
            {treeEdges.map((edge) => <path key={edge.id} d={edge.path} className={styles.mindMapTreeEdge} data-lesson={edge.lessonNumber} />)}
            {crossEdges.map((edge) => <path key={edge.id} d={edge.path} className={styles.mindMapCrossEdge} />)}
          </svg>
          {positions.map((position) => {
            const { node, x, y, lessonNumber: number } = position;
            if (node.conceptId) {
              const item = conceptMap.find((conceptItem) => conceptItem.id === node.conceptId);
              return item ? conceptButton(item, position) : null;
            }
            const kindClass = node.kind === "root" ? styles.mindMapRoot : node.kind === "lesson" ? styles.mindMapLesson : styles.mindMapTopic;
            return <div className={`${styles.mindMapNode} ${kindClass}`} data-lesson={number || undefined} key={node.id} style={{ left: x, top: y }}>
              {node.kind === "lesson" && <small>שיעור {number}</small>}{node.title}
            </div>;
          })}
        </div>
      </div>
      <aside className={`${styles.card} ${styles.conceptDetail}`} aria-label="פרטי מושג נבחר">
        <span className={styles.conceptTag}>{selected.lesson} · {selected.category}</span>
        <h2>{selected.title}</h2><span dir="ltr">{selected.english}</span><p>{selected.summary}</p>
        <h3>קשרים בין נושאים</h3>
        {relatedIds.size > 1 ? [...relatedIds].filter((id) => id !== selected.id).map((id) => {
          const related = conceptMap.find((item) => item.id === id);
          return related ? <button className={styles.conceptRelation} key={id} type="button" onClick={() => setSelectedId(id)}>{related.title}</button> : null;
        }) : <p className={styles.reflectionNote}>אין קשרים רשומים למושג הזה.</p>}
        {formulaNames.length > 0 && <><h3>נוסחאות בנושא</h3>{formulaNames.map((item) => <Link className={styles.conceptRelation} key={item.id} href={`/course/${course.courseId}/formulas#${item.id}`}>{item.name}</Link>)}</>}
        {selectedLesson ? <Link className={styles.contextMore} href={`/course/${course.courseId}/lessons/${selectedLesson.lessonId}/slides`}>למערך השיעור <span aria-hidden="true">←</span></Link> : <p className={styles.reflectionNote}>אין מערך שיעור רשום לנושא הזה.</p>}
        <p className={styles.mindMapLegend}><span className={styles.legendBranch} /> ענף של נושא <span className={styles.legendConnection} /> קשר בין נושאים</p>
      </aside>
    </div> : <>
      <div className={styles.conceptCards} aria-label="רשימת מושגים">{filtered.map((item) => <button className={styles.conceptCard} key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selected.id === item.id}><strong>{item.title}</strong><small dir="ltr">{item.english}</small><span>{item.lesson} · {item.category}</span></button>)}</div>
      <aside className={`${styles.card} ${styles.conceptDetail} ${styles.listConceptDetail}`} aria-label="פרטי מושג נבחר"><span className={styles.conceptTag}>{selected.lesson} · {selected.category}</span><h2>{selected.title}</h2><span dir="ltr">{selected.english}</span><p>{selected.summary}</p>{selectedData?.relatedConceptIds.map((id) => { const related = concepts.find((item) => item.conceptId === id); return related ? <button className={styles.conceptRelation} key={id} type="button" onClick={() => setSelectedId(id)}>{related.name}</button> : null; })}</aside>
    </>}
  </>;
}
