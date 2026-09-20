import { questions, type Answers } from "./post-class";
export function summarize(rows: Answers[]) {
  const distribution = (index: number, subset = rows) => questions[index].options.map(([key, label]) => ({
    label, count: subset.filter(row => { const value = row[questions[index].key]; return Array.isArray(value) ? value.includes(key) : String(value) === key; }).length,
  }));
  const scores = rows.map(row => row.concept_connection_value).filter((n): n is number => n !== null).sort((a, b) => a - b);
  const middle = Math.floor(scores.length / 2);
  const yes = rows.filter(row => row.returned_to_material === "yes");
  const no = rows.filter(row => row.returned_to_material === "no");
  return {
    total: rows.length, yes: yes.length, no: no.length,
    returns: distribution(0), actions: distribution(1, yes), triggers: distribution(2, yes), nonReturn: distribution(3, no),
    formulas: distribution(4).sort((a, b) => b.count - a.count), concepts: distribution(5),
    average: scores.length ? scores.reduce((sum, n) => sum + n, 0) / scores.length : null,
    median: scores.length ? scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2 : null,
    comments: rows.flatMap(row => [
      ...Object.entries(row.other_text).filter(([, value]) => value?.trim()).map(([key, value]) => ({ label: questions.find(q => q.key === key)?.prompt ?? "אחר", text: value! })),
      ...(row.concept_connection_example ? [{ label: "דוגמה לקשר בין נושאים", text: row.concept_connection_example }] : []),
    ]),
  };
}
