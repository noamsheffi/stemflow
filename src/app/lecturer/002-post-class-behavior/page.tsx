import Link from "next/link";
import WorkspaceLayout from "../../../components/workspace-layout";
import styles from "../../../components/post-class.module.css";
import { getSql } from "../../../lib/db";
import { EXPERIMENT_ID, surveyPath, type Answers } from "../../../lib/post-class";
import { summarize } from "../../../lib/post-class-results";
export const dynamic = "force-dynamic";
function Distribution({ title, data, denominator }: { title: string; data: { label: string; count: number }[]; denominator: number }) {
  return <section className="results-section"><h3>{title}</h3><p className="privacy-note">בסיס החישוב: {denominator} משיבים</p><table><thead><tr><th scope="col">תשובה</th><th scope="col">מספר</th><th scope="col">אחוז</th></tr></thead><tbody>{data.map(item => <tr key={item.label}><td>{item.label}</td><td>{item.count}</td><td>{denominator ? `${Math.round(item.count / denominator * 100)}%` : "—"}</td></tr>)}</tbody></table></section>;
}
export default async function Page() {
  let results;
  try {
    const rows = await getSql()`SELECT returned_to_material, material_actions, return_trigger, non_return_reason, formula_context_needs, concept_connection_value, concept_connection_example, other_text FROM post_class_submissions WHERE experiment_id = ${EXPERIMENT_ID} ORDER BY submitted_at DESC` as unknown as Answers[];
    results = summarize(rows);
  } catch {
    return <WorkspaceLayout><h1>תוצאות שאלון 02 אינן זמינות כרגע</h1><p>יש לוודא שהחיבור למסד הנתונים זמין ושהמיגרציה 004 הורצה.</p><Link href="/lecturer">לתוצאות ניסוי #001</Link></WorkspaceLayout>;
  }
  return <WorkspaceLayout><div className={styles.results}>
    <nav aria-label="ניווט בין ניסויים"><Link href="/lecturer">ניסוי #001</Link><Link href="/lecturer/002-slide-friction">ניסוי קושי בשקפים</Link><Link href={surveyPath}>לשאלון הסטודנטים</Link></nav>
    <p className="eyebrow">Syllo · 002-post-class-behavior</p><h1>למידה אחרי השיעור — תוצאות</h1><p className="results-total">סה״כ הגשות: <strong>{results.total}</strong></p>
    {results.total === 0 && <p>עדיין לא התקבלו תשובות לניסוי הזה.</p>}
    <section className="results-section"><h2>עדות התנהגותית — דיווח עצמי</h2><p>הנתונים מתארים התנהגות שהסטודנטים דיווחו עליה; הם אינם מדידה של פתיחת החומר בפועל.</p><p className="results-total"><strong>{results.total ? `${Math.round(results.yes / results.total * 100)}%` : "—"}</strong> דיווחו שפתחו את החומר ({results.yes} מתוך {results.total}).</p>
      <Distribution title="חזרה לחומר אחרי השיעור" data={results.returns} denominator={results.total} />
      <Distribution title="מה עשו אחרי פתיחת החומר" data={results.actions} denominator={results.yes} />
      <Distribution title="הסיבה העיקרית לפתיחת החומר" data={results.triggers} denominator={results.yes} />
      <Distribution title="למה לא חזרו לחומר" data={results.nonReturn} denominator={results.no} />
    </section>
    <section className="results-section"><h2>צרכים מוצהרים</h2><p>התשובות משקפות צרכים וערך נתפס. בשאלות מרובות בחירות האחוזים עשויים להסתכם ביותר מ־100%.</p>
      <Distribution title="מה חסר סביב נוסחאות" data={results.formulas} denominator={results.total} />
      <Distribution title="ערך נתפס של קשר בין מושגים" data={results.concepts} denominator={results.total} />
      <p>ממוצע: <strong>{results.average?.toFixed(2) ?? "—"}</strong> · חציון: <strong>{results.median ?? "—"}</strong></p>
    </section>
    <section className="results-section"><h2>השערות לפתרון — טרם אומתו</h2><p>Formula Hub ו־Concept Map הן השערות לפתרון. תשובות על הקשר של נוסחאות או מושגים אינן מאמתות ביקוש לתכונות האלה.</p></section>
    <section className="results-section"><h2>תגובות פתוחות ללא מזהי משיבים</h2>{!results.comments.length ? <p>לא התקבלו תגובות פתוחות.</p> : results.comments.map((comment, index) => <article className="response-card" key={index}><h3>{comment.label}</h3><p>{comment.text}</p></article>)}</section>
  </div></WorkspaceLayout>;
}
