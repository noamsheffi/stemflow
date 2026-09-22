import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";
import { workspace } from "../../../../lib/course-data";
import { EXPERIMENT_ID } from "../../../../lib/survey";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    await sql`CREATE TABLE IF NOT EXISTS lecturer_interest_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), first_name TEXT NOT NULL, last_name TEXT NOT NULL,
      email TEXT NOT NULL, phone TEXT NOT NULL, institution TEXT NOT NULL, course TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`ALTER TABLE lecturer_interest_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'חדש'`;
    const [tables] = await Promise.all([
      sql`SELECT to_regclass('public.survey_submissions') IS NOT NULL AS problem_discovery,
                 to_regclass('public.slide_friction_submissions') IS NOT NULL AS slide_friction,
                 to_regclass('public.post_class_submissions') IS NOT NULL AS post_class`,
    ]);
    const availableTables = (tables as Array<{ problem_discovery: boolean; slide_friction: boolean; post_class: boolean }>)[0];
    const [learners, pendingRequests, problemDiscovery, slideFriction, postClass] = await Promise.all([
      sql`SELECT COUNT(DISTINCT anonymous_client_id)::int AS count FROM student_lesson_events WHERE occurred_at >= NOW() - INTERVAL '30 days'`,
      sql`SELECT COUNT(*)::int AS count FROM lecturer_interest_leads WHERE status IN ('חדש', 'בבדיקה')`,
      availableTables.problem_discovery ? sql`SELECT COUNT(*)::int AS count FROM survey_submissions WHERE experiment_id = ${EXPERIMENT_ID}` : Promise.resolve([{ count: null }]),
      availableTables.slide_friction ? sql`SELECT COUNT(*)::int AS count FROM slide_friction_submissions` : Promise.resolve([{ count: null }]),
      availableTables.post_class ? sql`SELECT COUNT(*)::int AS count FROM post_class_submissions` : Promise.resolve([{ count: null }]),
    ]);
    const count = (rows: unknown) => Number((rows as Array<{ count: number | string }>)[0]?.count ?? 0);

    return NextResponse.json({
      activeLearners30d: count(learners),
      surveyResponses: [problemDiscovery, slideFriction, postClass].reduce((total, rows) => total + count(rows), 0),
      pendingRequests: count(pendingRequests),
      courseCount: workspace.courses.length,
      surveys: [
        { id: "001-problem-discovery", title: "חוויית הלמידה בקורס", type: "שאלון סטודנטים", responses: availableTables.problem_discovery ? count(problemDiscovery) : null, questionnaireUrl: "/survey" },
        { id: "002-slide-friction", title: "משוב על שקופיות", type: "משוב במהלך השיעור", responses: availableTables.slide_friction ? count(slideFriction) : null, questionnaireUrl: "/slide-friction" },
        { id: "002-post-class-behavior", title: "הלמידה אחרי השיעור", type: "שאלון סטודנטים", responses: availableTables.post_class ? count(postClass) : null, questionnaireUrl: "/course/communication-systems/surveys/002-post-class-behavior" },
      ],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to load admin overview", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
