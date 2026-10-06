import "server-only";
import { getSql } from "./db";

export type MidtermPracticeQuestionSummary = {
  question_id: string;
  starts: number;
  steps_revealed: number;
  completions: number;
  average_helpfulness: number | null;
  feedback_count: number;
  assessments: number;
  average_confidence: number | null;
  needs_support: number;
};

export type MidtermPracticeComment = { question_id: string; feedback: string; occurred_at: string };

export async function ensureMidtermPracticeSchema() {
  await getSql().query(`CREATE TABLE IF NOT EXISTS midterm_practice_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL, client_id UUID NOT NULL,
    question_id TEXT NOT NULL CHECK (question_id ~ '^q[1-7]$'),
    event_type TEXT NOT NULL CHECK (event_type IN ('started','question_opened','step_revealed','completed','self_assessment','feedback')),
    step_index INTEGER CHECK (step_index IS NULL OR step_index BETWEEN 0 AND 10),
    confidence INTEGER CHECK (confidence IS NULL OR confidence BETWEEN 1 AND 5),
    helpfulness INTEGER CHECK (helpfulness IS NULL OR helpfulness BETWEEN 1 AND 5), understood BOOLEAN,
    feedback TEXT CHECK (feedback IS NULL OR char_length(feedback) <= 1000), occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await getSql().query(`CREATE INDEX IF NOT EXISTS midterm_practice_question_idx ON midterm_practice_events (question_id, occurred_at DESC)`);
}

export async function getMidtermPracticeResults() {
  await ensureMidtermPracticeSchema();
  const sql = getSql();
  const questions = await sql`WITH event_totals AS (
    SELECT question_id,
      COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('started','question_opened')) AS starts,
      COUNT(*) FILTER (WHERE event_type = 'step_revealed') AS steps_revealed,
      COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'completed') AS completions,
      ROUND(AVG(helpfulness) FILTER (WHERE event_type = 'feedback'), 2) AS average_helpfulness,
      COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'feedback' AND (helpfulness IS NOT NULL OR feedback IS NOT NULL)) AS feedback_count
    FROM midterm_practice_events GROUP BY question_id
  ), latest_assessment AS (
    SELECT DISTINCT ON (session_id, question_id) session_id, question_id, confidence, understood
    FROM midterm_practice_events WHERE event_type = 'self_assessment'
    ORDER BY session_id, question_id, occurred_at DESC
  )
  SELECT totals.*, COUNT(assessment.session_id) AS assessments,
    ROUND(AVG(assessment.confidence), 2) AS average_confidence,
    COUNT(assessment.session_id) FILTER (WHERE assessment.understood = false) AS needs_support
  FROM event_totals totals LEFT JOIN latest_assessment assessment USING (question_id)
  GROUP BY totals.question_id, totals.starts, totals.steps_revealed, totals.completions, totals.average_helpfulness, totals.feedback_count
  ORDER BY totals.question_id` as unknown as MidtermPracticeQuestionSummary[];
  const comments = await sql`SELECT question_id, feedback, occurred_at
    FROM midterm_practice_events WHERE event_type = 'feedback' AND feedback IS NOT NULL AND char_length(trim(feedback)) > 0
    ORDER BY occurred_at DESC LIMIT 200` as unknown as MidtermPracticeComment[];
  return { questions, comments };
}
