import Link from "next/link";
import FormulaMath from "./formula-math";
import { conceptMap, conceptFormulaIds } from "../lib/concept-map";
import { courseAppPath, lessons, lessonHref, getFormula } from "../lib/course-data";
import styles from "./concept-map.module.css";

export default function ConceptDetails({ concept }: { concept: typeof conceptMap[number] }) {
  const lesson = lessons.find((item) => `שיעור ${item.number}` === concept.lesson);
  return <div className={styles.details}>
    <section className={styles.lessonBox}><h3>המושג בשיעור</h3><p>{concept.lesson} · {concept.category}</p>{lesson ? <Link href={lessonHref(lesson)}>למערך {concept.lesson} ←</Link> : <p>מערך {concept.lesson} טרם זמין באתר</p>}</section>
    <section><h3>להבין את המושג</h3><p>{concept.details}</p></section>
    {concept.formulas.length > 0 && <section><h3>הנוסחאות שמאחורי המושג</h3>{concept.formulas.map((tex) => <div className={styles.math} key={tex}><FormulaMath tex={tex} display /></div>)}<div className={styles.links}>{(conceptFormulaIds[concept.id] ?? []).map((id) => { const formula = getFormula(id); return formula ? <Link key={id} href={`${courseAppPath("formulas")}/${id}`}>{formula.name} ←</Link> : null; })}</div></section>}
    <section className={styles.trap}><h3>שימו לב בבחינה</h3><p>{concept.exam_trap}</p></section>
    <section><h3>מהכיתה לעולם האמיתי</h3><p>{concept.real_world}</p></section>
  </div>;
}
