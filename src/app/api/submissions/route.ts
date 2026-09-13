import { NextResponse } from "next/server";

import { getSql } from "../../../lib/db";
import { EXPERIMENT_ID, parseSubmissionPayload } from "../../../lib/survey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const submission = parseSubmissionPayload(body);
  if (!submission) {
    return NextResponse.json({ error: "invalid_submission" }, { status: 400 });
  }

  try {
    const rows = await getSql()`
      INSERT INTO survey_submissions (
        experiment_id,
        anonymous_client_id,
        first_place,
        stuck_response,
        friction,
        find_help_ease,
        wish,
        problem_type
      ) VALUES (
        ${EXPERIMENT_ID},
        ${submission.anonymousClientId},
        ${submission.answers.firstPlace},
        ${submission.answers.stuckResponse},
        ${submission.answers.friction},
        ${submission.answers.findHelpEase},
        ${submission.answers.wish},
        ${submission.answers.problemType}
      )
      ON CONFLICT (experiment_id, anonymous_client_id) DO NOTHING
      RETURNING id, submitted_at
    ` as unknown as Array<{ id: string; submitted_at: string }>;

    if (rows.length === 0) {
      return NextResponse.json({ error: "duplicate_submission" }, { status: 409 });
    }

    return NextResponse.json({ id: rows[0].id, submittedAt: rows[0].submitted_at }, { status: 201 });
  } catch (error) {
    console.error("Unable to store anonymous Product Lab #01 submission", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
