import FormulaMath from "../../../components/formula-math";
import Link from "next/link";
import { notFound } from "next/navigation";

import CourseLayout from "../../../components/course-layout";
import { concepts, courseAppPath, getFormula, getLesson, lessonHref } from "../../../lib/course-data";

export default async function FormulaPage({ params }: { params: Promise<{ formulaId: string }> }) {
  const { formulaId } = await params;
  const formula = getFormula(formulaId);
  if (!formula) notFound();

  return <CourseLayout><section className="page-intro"><p className="item-kicker">נוסחה</p><h1>{formula.name}</h1><p className="formula-expression formula-detail" dir="ltr"><FormulaMath tex={formula.expression} display /></p><p>{formula.physicalMeaning}</p></section><section className="detail-section"><h2>משתנים ויחידות</h2><dl className="variable-list">{formula.variables.map((variable) => <div key={variable.symbol}><dt dir="ltr"><FormulaMath tex={variable.symbol} /></dt><dd>{variable.meaning} <span dir="ltr">[{variable.unit}]</span></dd></div>)}</dl></section><section className="detail-section"><h2>נלמד ב</h2>{formula.lessonIds.map((lessonId) => { const lesson = getLesson(lessonId); return lesson ? <Link className="text-link" key={lessonId} href={lessonHref(lesson)}>שיעור {lesson.number.toString().padStart(2, "0")} — {lesson.title}</Link> : null; })}</section><section className="detail-section"><h2>מושגים קשורים</h2>{formula.conceptIds.map((conceptId) => { const concept = concepts.find((item) => item.conceptId === conceptId); return concept ? <Link className="text-link" key={conceptId} href={`${courseAppPath("concepts")}/${conceptId}`}>{concept.name}</Link> : null; })}</section></CourseLayout>;
}
