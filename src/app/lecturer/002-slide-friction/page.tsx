import { getSlideFrictionResults, type Distribution } from "../../../lib/slide-friction-results";

export const dynamic = "force-dynamic";

function DistributionTable({ title, data }: { title: string; data: Distribution[] }) {
  return (
    <section className="results-section" aria-labelledby={title}>
      <h2 id={title}>{title}</h2>
      <table>
        <thead><tr><th>תשובה</th><th>מספר תשובות</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.label}><td>{item.label}</td><td>{item.count}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

export default async function SlideFrictionLecturerPage() {
  try {
    const results = await getSlideFrictionResults();

    return (
      <main className="page-shell">
        <section className="results-card" aria-labelledby="results-title">
          <p className="eyebrow">STEMFlow · Product Lab #02</p>
          <h1 id="results-title">איפה איבדתי אותך? — תוצאות</h1>
          <p className="results-total">סה״כ הגשות: <strong>{results.totalResponses}</strong></p>

          <section className="results-section" aria-labelledby="slide-heatmap-title">
            <h2 id="slide-heatmap-title">מפת קושי לפי שקף</h2>
            <table>
              <thead><tr><th>שקף</th><th>מספר סטודנטים</th><th>אחוז מהמשיבים</th></tr></thead>
              <tbody>{results.slideHeatmap.map((slide) => <tr key={slide.id}><td>שקף {slide.number}</td><td>{slide.count}</td><td>{slide.percentage}%</td></tr>)}</tbody>
            </table>
          </section>

          <section className="results-section" aria-labelledby="top-slides-title">
            <h2 id="top-slides-title">3 השקפים הקשים ביותר</h2>
            {results.topDifficultSlides.length === 0 ? <p className="empty-results">עדיין לא סומנו שקפים קשים.</p> : (
              <table>
                <thead><tr><th>שקף</th><th>מספר סטודנטים</th><th>אחוז מהמשיבים</th></tr></thead>
                <tbody>{results.topDifficultSlides.map((slide) => <tr key={slide.id}><td>שקף {slide.number}</td><td>{slide.count}</td><td>{slide.percentage}%</td></tr>)}</tbody>
              </table>
            )}
          </section>

          <section className="results-section" aria-labelledby="silent-confusion-title">
            <h2 id="silent-confusion-title">שיעור בלבול שקט</h2>
            <p className="results-total"><strong>{results.silentConfusion.percentage}%</strong> ({results.silentConfusion.count} מתוך {results.silentConfusion.denominator}) מהמשיבים שסימנו קושי חשבו שהמרצה כנראה לא ידע או לא ידע שלא הבינו.</p>
          </section>

          <DistributionTable title="סיבות לקושי" data={results.difficultyReasons} />
          <DistributionTable title="מה היה הכי עוזר" data={results.preferredInterventions} />
          <DistributionTable title="סבירות לשימוש בסימון אנונימי" data={results.liveFeedbackLikelihood} />
          <DistributionTable title="מה גרם להבנה להתחבר" data={results.recoveryTriggers} />

          <section className="results-section" aria-labelledby="comments-title">
            <h2 id="comments-title">תגובות פתוחות על הסימון השקט</h2>
            {results.comments.length === 0 ? <p className="empty-results">לא התקבלו תגובות פתוחות.</p> : (
              <div className="response-list">
                {results.comments.map((comment, index) => <article className="response-card" key={`${comment.submittedAt}-${index}`}><p className="response-time">התקבל: {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(comment.submittedAt))}</p><p>{comment.comment}</p></article>)}
              </div>
            )}
          </section>
        </section>
      </main>
    );
  } catch {
    return (
      <main className="page-shell"><section className="results-card" aria-labelledby="results-title"><p className="eyebrow">STEMFlow · Product Lab #02</p><h1 id="results-title">התוצאות אינן זמינות כרגע</h1><p>יש לוודא שמסד הנתונים הוגדר ושקובץ הסכימה של ניסוי #002 הורץ.</p></section></main>
    );
  }
}
