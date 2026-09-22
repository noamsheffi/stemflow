import Link from "next/link";
import { notFound } from "next/navigation";
import { getSql } from "../../../../lib/db";
import { getSurveyResults } from "../../../../lib/results";
import { getSlideFrictionResults, type Distribution } from "../../../../lib/slide-friction-results";
import { summarize } from "../../../../lib/post-class-results";
import type { Answers } from "../../../../lib/post-class";
import styles from "./summary.module.css";

export const dynamic = "force-dynamic";

const surveys = {
  "001-problem-discovery": { title: "חוויית הלמידה בקורס", url: "/survey", table: "survey_submissions" },
  "002-slide-friction": { title: "משוב על שקופיות", url: "/slide-friction", table: "slide_friction_submissions" },
  "002-post-class-behavior": { title: "הלמידה אחרי השיעור", url: "/course/communication-systems/surveys/002-post-class-behavior", table: "post_class_submissions" },
} as const;

export default async function SurveySummaryPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  if (!Object.hasOwn(surveys, surveyId)) notFound();
  const survey = surveys[surveyId as keyof typeof surveys];

  let exists = false;
  try {
    const result = await getSql()`SELECT to_regclass(${`public.${survey.table}`}) IS NOT NULL AS exists`;
    exists = Boolean((result as Array<{ exists: boolean }>)[0]?.exists);
  } catch {
    return <main className={styles.page} dir="rtl"><Link className={styles.back} href="/admin">→ חזרה לניהול</Link><h1>הנתונים אינם זמינים</h1><p>לא הצלחנו להתחבר למסד הנתונים. נסה שוב מאוחר יותר.</p></main>;
  }

  return <main className={styles.page} dir="rtl">
    <Link className={styles.back} href="/admin">→ חזרה לניהול</Link>
    <header className={styles.heading}><div><p className={styles.eyebrow}>סיכום שאלון · {surveyId}</p><h1>{survey.title}</h1><p>נתונים אנונימיים בלבד, מתוך הגשות שנשמרו.</p></div><div className={styles.actions}><Link href={survey.url} target="_blank" rel="noreferrer">פתיחת השאלון ↗</Link><Link href="/admin">כל השאלונים</Link></div></header>
    {!exists ? <div className={styles.notice}>טבלת התשובות של השאלון הזה עדיין לא הוגדרה במסד הנתונים. לא מוצגים נתוני דוגמה.</div> : surveyId === "001-problem-discovery" ? <ProblemDiscoverySummary /> : surveyId === "002-slide-friction" ? <SlideFrictionSummary /> : <PostClassSummary />}
  </main>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className={styles.stat}><span>{label}</span><strong>{value}</strong></div>;
}

function DistributionTable({ title, data, denominator }: { title: string; data: Distribution[]; denominator?: number }) {
  return <section className={styles.section}><h2>{title}</h2>{!data.length ? <div className={styles.empty}>אין תשובות להצגה.</div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">תשובה</th><th scope="col">מספר</th><th scope="col">אחוז</th></tr></thead><tbody>{data.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.count}</td><td>{denominator ? `${Math.round(row.count / denominator * 100)}%` : "—"}</td></tr>)}</tbody></table></div>}</section>;
}

async function ProblemDiscoverySummary() {
  const results = await getSurveyResults();
  return <><div className={styles.stats}><Stat label="מספר תשובות" value={results.totalSubmissions} /><Stat label="שאלות עם בחירה" value="2" /><Stat label="תגובות פתוחות" value={results.responses.length} /></div>
    <div className={styles.grid}><DistributionTable title="קלות מציאת עזרה בבית" data={results.findHelpEase} denominator={results.totalSubmissions} /><DistributionTable title="סוג הבעיה המרכזי" data={results.problemType} denominator={results.totalSubmissions} /></div>
    <section className={styles.section}><h2>תשובות פתוחות</h2>{!results.responses.length ? <div className={styles.empty}>עדיין לא התקבלו תשובות.</div> : results.responses.map((response, index) => <article className={styles.response} key={`${response.submittedAt}-${index}`}><time>{formatDate(response.submittedAt)}</time><h3>לאן הולכים קודם</h3><p>{response.firstPlace}</p><h3>מה עשו כשנתקעו</h3><p>{response.stuckResponse}</p><h3>מה הכי מקשה</h3><p>{response.friction}</p><h3>מה היו רוצים שיהיה קל יותר</h3><p>{response.wish}</p></article>)}</section>
  </>;
}

async function SlideFrictionSummary() {
  const results = await getSlideFrictionResults();
  return <><div className={styles.stats}><Stat label="מספר תשובות" value={results.totalResponses} /><Stat label="בלבול שקט" value={`${results.silentConfusion.percentage}%`} /><Stat label="משיבים שלא אותתו על קושי" value={results.silentConfusion.denominator} /></div>
    <div className={styles.grid}><DistributionTable title="מפת קושי לפי שקף" data={results.slideHeatmap.map((slide) => ({ label: `שקף ${slide.number}`, count: slide.count }))} denominator={results.totalResponses} /><DistributionTable title="סיבות לקושי" data={results.difficultyReasons} denominator={results.totalResponses} /><DistributionTable title="מה היה הכי עוזר" data={results.preferredInterventions} denominator={results.totalResponses} /><DistributionTable title="סבירות לשימוש במשוב חי" data={results.liveFeedbackLikelihood} denominator={results.totalResponses} /><DistributionTable title="מה עזר להתאושש" data={results.recoveryTriggers} denominator={results.totalResponses} /></div>
    <section className={styles.section}><h2>תגובות פתוחות</h2>{!results.comments.length ? <div className={styles.empty}>לא התקבלו תגובות פתוחות.</div> : results.comments.map((item, index) => <article className={styles.response} key={`${item.submittedAt}-${index}`}><time>{formatDate(item.submittedAt)}</time><p>{item.comment}</p></article>)}</section>
  </>;
}

async function PostClassSummary() {
  const rows = await getSql()`SELECT returned_to_material, material_actions, return_trigger, non_return_reason, formula_context_needs, concept_connection_value, concept_connection_example, other_text FROM post_class_submissions WHERE experiment_id = '002-post-class-behavior' ORDER BY submitted_at DESC` as unknown as Answers[];
  const results = summarize(rows);
  return <><div className={styles.stats}><Stat label="מספר תשובות" value={results.total} /><Stat label="חזרו לחומר" value={`${results.total ? Math.round(results.yes / results.total * 100) : 0}%`} /><Stat label="ערך ממוצע לקשר בין מושגים" value={results.average?.toFixed(2) ?? "—"} /></div>
    <div className={styles.grid}><DistributionTable title="חזרה לחומר אחרי השיעור" data={results.returns} denominator={results.total} /><DistributionTable title="פעולות אחרי פתיחת החומר" data={results.actions} denominator={results.yes} /><DistributionTable title="מה גרם לפתוח את החומר" data={results.triggers} denominator={results.yes} /><DistributionTable title="למה לא חזרו לחומר" data={results.nonReturn} denominator={results.no} /><DistributionTable title="צרכים סביב נוסחאות" data={results.formulas} denominator={results.total} /><DistributionTable title="ערך של קשר בין מושגים" data={results.concepts} denominator={results.total} /></div>
    <section className={styles.section}><h2>תגובות פתוחות</h2>{!results.comments.length ? <div className={styles.empty}>לא התקבלו תגובות פתוחות.</div> : results.comments.map((comment, index) => <article className={styles.response} key={`${comment.label}-${index}`}><h3>{comment.label}</h3><p>{comment.text}</p></article>)}</section>
  </>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));
}
