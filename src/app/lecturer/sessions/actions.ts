"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSql } from "../../../lib/db";
import { ensureLecturerReflectionSchema, ensureLecturerSessionSchema } from "../../../lib/learning-schema";
import { hasValidLecturerReflectionToken } from "../../../lib/lecturer-reflection-token";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reflectionAnswer(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const answer = value.trim();
  return answer.length > 0 && answer.length <= 1000 ? answer : null;
}

export async function saveLecturerReflection(formData: FormData) {
  const sessionId = formData.get("sessionId");
  const token = formData.get("token");
  const returnPath = typeof sessionId === "string" && uuidPattern.test(sessionId)
    ? `/lecturer/sessions/${sessionId}`
    : "/lecturer/sessions";
  const redirectWith = (state: string): never => redirect(`${returnPath}?reflection=${state}`);

  if (typeof sessionId !== "string" || typeof token !== "string" || !hasValidLecturerReflectionToken(token, sessionId)) {
    redirectWith("expired");
  }

  const whatWorked = reflectionAnswer(formData.get("whatWorked"));
  const whatWasDifficult = reflectionAnswer(formData.get("whatWasDifficult"));
  const whatWillChange = reflectionAnswer(formData.get("whatWillChange"));
  if (!whatWorked || !whatWasDifficult || !whatWillChange) redirectWith("invalid");

  try {
    await ensureLecturerSessionSchema();
    await ensureLecturerReflectionSchema();
    await getSql()`
      INSERT INTO lecturer_session_reflections (session_id, what_worked, what_was_difficult, what_will_change)
      VALUES (${sessionId}, ${whatWorked}, ${whatWasDifficult}, ${whatWillChange})
      ON CONFLICT (session_id) DO UPDATE SET
        what_worked = EXCLUDED.what_worked,
        what_was_difficult = EXCLUDED.what_was_difficult,
        what_will_change = EXCLUDED.what_will_change,
        updated_at = NOW()
    `;
  } catch {
    redirectWith("error");
  }

  revalidatePath(returnPath);
  redirectWith("saved");
}
