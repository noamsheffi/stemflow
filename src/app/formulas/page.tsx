import type { Metadata } from "next";
import Link from "next/link";
import CourseLayout from "../../components/course-layout";
import FormulaSheet from "../../components/formula-sheet";
import FormulaMath from "../../components/formula-math";
import styles from "../../components/formula-sheet.module.css";
import data from "../../lib/formula-sheet-data.json";
import { lessons, lessonHref } from "../../lib/course-data";

export const metadata: Metadata = { title: "נוסחאון אינטראקטיבי | מערכות תקשורת", description: "24 נוסחאות במערכות תקשורת: אנטנות, אותות, מתנדים ואפנון AM, עם סינון, יחידות וקישורים לשיעורים." };

export default function FormulasPage() {
  const entries = data.map((formula) => {
    const lesson = lessons.find((item) => item.number === Number(formula.lesson));
    const aliases = formula.id === "lambda" ? "λ lambda" : formula.id === "angular_freq" ? "ω omega" : formula.id === "am_efficiency" ? "η eta" : "";
    return {
      id: formula.id, lesson: formula.lesson, topic: formula.topic,
      search: `${JSON.stringify(formula)} ${aliases}`.toLocaleLowerCase(),
      content: <article id={formula.id} className={styles.card}>
        <div className={styles.badges}><span>שיעור {formula.lesson}</span><span>{formula.topic}</span></div>
        <h2>{formula.name}</h2>
        <div className={styles.expression} dir="ltr"><FormulaMath tex={formula.formula_latex} display /></div>
        <table className={styles.table}><caption className={styles.srOnly}>משתנים ויחידות — {formula.name}</caption><thead><tr><th scope="col">סמל</th><th scope="col">משמעות</th><th scope="col">יחידות</th></tr></thead><tbody>
          {formula.params.map((param) => <tr key={param.symbol}><td><FormulaMath tex={param.symbol} /></td><td>{param.name}</td><td>{param.unit.includes("\\") ? <FormulaMath tex={param.unit} /> : param.unit}</td></tr>)}
        </tbody></table>
        <details className={styles.context}><summary>הנוסחה בשיעור</summary><p>{formula.usage}</p>{lesson ? <Link className={styles.lessonButton} href={lessonHref(lesson)} aria-label={`פתיחת מערך שיעור ${lesson.number}: ${lesson.title}`}>פתיחת מערך שיעור {lesson.number}</Link> : <span className={styles.pending}>מערך שיעור {formula.lesson} טרם זמין באתר</span>}</details>
        <details className={styles.trap}><summary>שימו לב בבחינה</summary><p>{formula.trap}</p></details>
      </article>,
    };
  });
  return <CourseLayout><FormulaSheet entries={entries} /></CourseLayout>;
}
