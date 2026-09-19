import { getSurveyResults } from "../../lib/results";

export const dynamic = "force-dynamic";

function DistributionTable({ title, data }: { title: string; data: Array<{ label: string; count: number }> }) {
  return (
    <section className="results-section" aria-labelledby={title}>
      <h2 id={title}>{title}</h2>
      <table>
        <thead>
          <tr><th>תשובה</th><th>מספר תשובות</th></tr>
        </thead>
        <tbody>
          {data.map((item) => <tr key={item.label}><td>{item.label}</td><td>{item.count}</td></tr>)}
        </tbody>
      </table>
    </section>
  );
}

export default async function LecturerPage() {
  try {
    const results = await getSurveyResults();

    return (
      <main className="page-shell">
        <section className="results-card" aria-labelledby="results-title">
          <p className="eyebrow">Syllo · Product Lab #01</p>
          <h1 id="results-title">תוצאות הסקר</h1>
          <p className="results-total">סה״כ הגשות: <strong>{results.totalSubmissions}</strong></p>

          <DistributionTable title="כמה קל למצוא עזרה בבית" data={results.findHelpEase} />
          <DistributionTable title="סוג הבעיה המרכזי" data={results.problemType} />

          <section className="results-section" aria-labelledby="raw-responses-title">
            <h2 id="raw-responses-title">תשובות פתוחות</h2>
            {results.responses.length === 0 ? (
              <p className="empty-results">עדיין לא התקבלו תשובות.</p>
            ) : (
              <div className="response-list">
                {results.responses.map((response, index) => (
                  <article className="response-card" key={`${response.submittedAt}-${index}`}>
                    <p className="response-time">התקבל: {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(response.submittedAt))}</p>
                    <Response label="לאן הולכים קודם" value={response.firstPlace} />
                    <Response label="מה עשו כשנתקעו" value={response.stuckResponse} />
                    <Response label="מה הכי מקשה" value={response.friction} />
                    <Response label="השלמת המשפט" value={response.wish} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    );
  } catch {
    return (
      <main className="page-shell">
        <section className="results-card" aria-labelledby="results-title">
          <p className="eyebrow">Syllo · Product Lab #01</p>
          <h1 id="results-title">התוצאות אינן זמינות כרגע</h1>
          <p>יש לוודא שמסד הנתונים הוגדר ושקובץ הסכימה הורץ.</p>
        </section>
      </main>
    );
  }
}

function Response({ label, value }: { label: string; value: string }) {
  return <div className="response-field"><h3>{label}</h3><p>{value}</p></div>;
}
