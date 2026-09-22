import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS lecturer_interest_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), first_name TEXT NOT NULL, last_name TEXT NOT NULL,
    email TEXT NOT NULL, phone TEXT NOT NULL, institution TEXT NOT NULL, course TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE lecturer_interest_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'חדש'`;
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await getSql()`SELECT id, first_name, last_name, email, institution, course, submitted_at, status FROM lecturer_interest_leads ORDER BY submitted_at DESC` as unknown as Array<Record<string, unknown>>;
    return NextResponse.json({ requests: rows.map((row) => ({
      id: `REQ-${String(row.id).slice(0, 8).toUpperCase()}`,
      databaseId: row.id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      institution: row.institution,
      subject: row.course,
      date: new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(row.submitted_at as string)),
      status: row.status === "אושר" || row.status === "בבדיקה" ? row.status : "חדש",
      initials: `${String(row.first_name).slice(0, 1)}${String(row.last_name).slice(0, 1)}`,
      color: "blue",
    })) });
  } catch (error) {
    console.error("Failed to load admin lecturer requests", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
