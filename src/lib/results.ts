import "server-only";

import { getSql } from "./db";
import { EXPERIMENT_ID, findHelpEaseOptions, problemTypeOptions } from "./survey";

type SubmissionRow = {
  submitted_at: string;
  first_place: string;
  stuck_response: string;
  friction: string;
  find_help_ease: string;
  wish: string;
  problem_type: string;
};

export type Distribution = { label: string; count: number };

export type SurveyResults = {
  totalSubmissions: number;
  findHelpEase: Distribution[];
  problemType: Distribution[];
  responses: Array<{
    submittedAt: string;
    firstPlace: string;
    stuckResponse: string;
    friction: string;
    wish: string;
  }>;
};

function distribution(options: readonly string[], values: string[]): Distribution[] {
  return options.map((label) => ({ label, count: values.filter((value) => value === label).length }));
}

export async function getSurveyResults(): Promise<SurveyResults> {
  const rows = await getSql()`
    SELECT submitted_at, first_place, stuck_response, friction, find_help_ease, wish, problem_type
    FROM survey_submissions
    WHERE experiment_id = ${EXPERIMENT_ID}
    ORDER BY submitted_at DESC
  ` as unknown as SubmissionRow[];

  return {
    totalSubmissions: rows.length,
    findHelpEase: distribution(findHelpEaseOptions, rows.map((row) => row.find_help_ease)),
    problemType: distribution(problemTypeOptions, rows.map((row) => row.problem_type)),
    responses: rows.map((row) => ({
      submittedAt: row.submitted_at,
      firstPlace: row.first_place,
      stuckResponse: row.stuck_response,
      friction: row.friction,
      wish: row.wish,
    })),
  };
}
