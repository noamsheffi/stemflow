import { NextResponse } from "next/server";

import { getSql } from "../../../../lib/db";
import { parseSlideFrictionSubmission, SLIDE_FRICTION_EXPERIMENT_ID } from "../../../../lib/slide-friction";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const submission = parseSlideFrictionSubmission(body);
  if (!submission) return NextResponse.json({ error: "invalid_submission" }, { status: 400 });

  try {
    const rows = await getSql()`
      INSERT INTO slide_friction_submissions (
        experiment_id, anonymous_client_id, difficult_slide_ids, no_significant_difficulty,
        most_difficult_slide_id, difficulty_reasons, recovery_behaviors, lecturer_awareness,
        not_signaling_reasons, preferred_intervention, live_feedback_likelihood,
        live_feedback_concern, recovery_success, recovery_trigger
      ) VALUES (
        ${SLIDE_FRICTION_EXPERIMENT_ID}, ${submission.anonymousClientId}, ${submission.answers.difficultSlideIds},
        ${submission.answers.noSignificantDifficulty}, ${submission.answers.mostDifficultSlideId || null},
        ${submission.answers.difficultyReasons}, ${submission.answers.recoveryBehaviors},
        ${submission.answers.lecturerAwareness || null}, ${submission.answers.notSignalingReasons},
        ${submission.answers.preferredIntervention || null}, ${submission.answers.liveFeedbackLikelihood},
        ${submission.answers.liveFeedbackConcern}, ${submission.answers.recoverySuccess},
        ${submission.answers.recoveryTrigger || null}
      )
      ON CONFLICT (experiment_id, anonymous_client_id) DO NOTHING
      RETURNING id, submitted_at
    ` as unknown as Array<{ id: string; submitted_at: string }>;

    if (rows.length === 0) return NextResponse.json({ error: "duplicate_submission" }, { status: 409 });
    return NextResponse.json({ id: rows[0].id, submittedAt: rows[0].submitted_at }, { status: 201 });
  } catch (error) {
    console.error("Unable to store anonymous Product Lab #02 submission", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
