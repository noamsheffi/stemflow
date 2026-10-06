import { NextResponse } from "next/server";
import { getSql } from "../../../lib/db";
import { ensureMidtermPracticeSchema } from "../../../lib/midterm-practice-results";

export const runtime = "nodejs";

const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const { sessionId, clientId, questionId, eventType } = body;
  if (!isUuid(sessionId) || !isUuid(clientId) || typeof questionId !== "string" || !/^q[1-7]$/.test(questionId) || !["started", "question_opened", "step_revealed", "completed", "self_assessment", "feedback"].includes(String(eventType))) return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  const stepIndex = body.stepIndex === undefined ? null : body.stepIndex;
  const confidence = body.confidence === undefined ? null : body.confidence;
  const helpfulness = body.helpfulness === undefined ? null : body.helpfulness;
  const understood = body.understood === undefined ? null : body.understood;
  const feedback = body.feedback === undefined ? null : body.feedback;
  if (!(stepIndex === null || (Number.isInteger(stepIndex) && Number(stepIndex) >= 0 && Number(stepIndex) <= 10)) || !(confidence === null || (Number.isInteger(confidence) && Number(confidence) >= 1 && Number(confidence) <= 5)) || !(helpfulness === null || (Number.isInteger(helpfulness) && Number(helpfulness) >= 1 && Number(helpfulness) <= 5)) || !(understood === null || typeof understood === "boolean") || !(feedback === null || (typeof feedback === "string" && feedback.length <= 1000))) return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  try {
    await ensureMidtermPracticeSchema();
    await getSql()`INSERT INTO midterm_practice_events (session_id, client_id, question_id, event_type, step_index, confidence, helpfulness, understood, feedback)
      VALUES (${sessionId}, ${clientId}, ${questionId}, ${eventType}, ${stepIndex}, ${confidence}, ${helpfulness}, ${understood}, ${feedback})`;
    return NextResponse.json({ accepted: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "storage_unavailable" }, { status: 503 }); }
}
