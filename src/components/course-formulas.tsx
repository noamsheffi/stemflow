"use client";

import Link from "next/link";
import { useState } from "react";
import data from "../lib/formula-sheet-data.json";
import { course, lessons } from "../lib/course-data";
import FormulaMath from "./formula-math";
import styles from "./student-workspace.module.css";

const lessonNumbers = [...new Set(data.map((formula) => formula.lesson))].sort((a, b) => Number(a) - Number(b));

export default function CourseFormulas() {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = data.filter((formula) => (lesson === "all" || formula.lesson === lesson) && (!normalizedQuery || JSON.stringify(formula).toLocaleLowerCase().includes(normalizedQuery)));
  const groups = lessonNumbers.filter((number) => filtered.some((formula) => formula.lesson === number));

  return <>
    <header className={styles.pageHeading}><p className={styles.pageKicker}>{course.title} · נוסחאות לפי שיעור</p><h1>נוסחאון</h1><p>הנוסחאות, משמעות הסמלים, היחידות והשימוש שלהן בחומר הקורס.</p></header>
    <div className={styles.searchControls}>
      <label className={styles.searchField}><span aria-hidden="true">⌕</span><span className={styles.srOnly}>חיפוש בנוסחאון</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="שם נוסחה, סמל, משמעות או יחידה" /></label>
      <div className={styles.filterChips} role="group" aria-label="סינון נוסחאות לפי שיעור">
        <button type="button" className={styles.filterChip} aria-pressed={lesson === "all"} onClick={() => setLesson("all")}>הכול</button>
        {lessonNumbers.map((number) => <button type="button" className={styles.filterChip} dir="ltr" aria-pressed={lesson === number} key={number} onClick={() => setLesson(number)}>{String(number).padStart(2, "0")}</button>)}
      </div>
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">מוצגות {filtered.length} מתוך {data.length} נוסחאות</p>
    {filtered.length ? <div className={styles.formulaList}>
      {groups.map((number) => {
        const lessonData = lessons.find((item) => item.number === Number(number));
        const groupFormulas = filtered.filter((formula) => formula.lesson === number);
        const heading = lessonData ? `שיעור ${String(number).padStart(2, "0")} · ${lessonData.title}` : data.find((formula) => formula.lesson === number)?.lesson_title ?? `שיעור ${number}`;
        const rows = <>{groupFormulas.map((formula) => <article className={styles.formulaDetail} id={formula.id} key={formula.id}>
          <div className={styles.resourceRow}>
            <div className={styles.resourceName}>{formula.name}<small className={styles.topicLabel}>{formula.topic}</small></div>
            <div className={styles.resourceEquation} dir="ltr"><FormulaMath tex={formula.formula_latex} display /></div>
            <div className={styles.variables}>
              {formula.params.map((param) => <span className={styles.variable} key={`${formula.id}-${param.symbol}`}><b className={styles.variableSymbol} dir="ltr">{param.symbol}</b><span>{param.name}</span><span className={styles.variableUnit}>{param.unit}</span></span>)}
            </div>
          </div>
          <details className={styles.formulaUsage}><summary>השימוש והקשר בשיעור</summary><p>{formula.usage}</p><p><strong>שימו לב:</strong> {formula.trap}</p></details>
        </article>)}</>;
        return <section className={`${styles.card} ${styles.formulaGroup}`} key={number}>
          {lessonData ? <Link className={styles.formulaGroupHeader} href={`/course/${course.courseId}/lessons/${lessonData.lessonId}/slides`}><span>{heading}</span><span>{groupFormulas.length} נוסחאות · למערך השיעור ←</span></Link> : <h2 className={styles.formulaGroupHeader}><span>{heading}</span><span>{groupFormulas.length} נוסחאות · אין מערך רשום</span></h2>}
          {rows}
        </section>;
      })}
    </div> : <p className={styles.emptyState}>לא נמצאו נוסחאות מתאימות.</p>}
  </>;
}
