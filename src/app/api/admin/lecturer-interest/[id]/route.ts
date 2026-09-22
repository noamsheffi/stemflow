import { NextRequest, NextResponse } from "next/server";
import { getSql } from "../../../../../lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  if (!body || !["חדש", "בבדיקה", "אושר"].includes(body.status ?? "")) return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  try {
    await getSql()`ALTER TABLE lecturer_interest_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'חדש'`;
    const rows = await getSql()`UPDATE lecturer_interest_leads SET status = ${body.status} WHERE id = ${id}::uuid RETURNING id` as unknown as Array<Record<string, unknown>>;
    if (!rows.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update admin lecturer request", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
