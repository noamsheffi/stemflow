import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";
import { EXPERIMENT_ID, parseSubmission } from "../../../../lib/post-class";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const submission = parseSubmission(body);
  if (!submission) return NextResponse.json({ error: "invalid_submission" }, { status: 400 });
  const a = submission.answers;
  try {
    const rows = await getSql()`INSERT INTO post_class_submissions
      (experiment_id, anonymous_client_id, returned_to_material, material_actions, return_trigger, non_return_reason, formula_context_needs, concept_connection_value, concept_connection_example, other_text)
      VALUES (${EXPERIMENT_ID}, ${submission.anonymousClientId}, ${a.returned_to_material}, ${a.material_actions}, ${a.return_trigger}, ${a.non_return_reason}, ${a.formula_context_needs}, ${a.concept_connection_value}, ${a.concept_connection_example}, ${JSON.stringify(a.other_text)}::jsonb)
      ON CONFLICT (experiment_id, anonymous_client_id) DO NOTHING RETURNING id, submitted_at` as unknown as Array<{ id: string; submitted_at: string }>;
    if (!rows.length) return NextResponse.json({ error: "duplicate_submission" }, { status: 409 });
    return NextResponse.json({ id: rows[0].id, submittedAt: rows[0].submitted_at }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
