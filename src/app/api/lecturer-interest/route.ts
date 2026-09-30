import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSql } from "../../../lib/db";

const fields = ["firstName", "lastName", "email", "phone", "institution", "course"] as const;
let tableReady: Promise<void> | undefined;

async function sendRequestNotification() {
  const user = process.env.EMAIL_SMTP_USER ?? "general@syllo.live";
  const password = process.env.EMAIL_SMTP_PASSWORD;
  if (!password) throw new Error("Email SMTP password is not configured.");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST ?? "mail.privateemail.com",
    port: Number(process.env.EMAIL_SMTP_PORT ?? "465"),
    secure: true,
    auth: { user, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  await transporter.sendMail({
    from: { name: "Syllo", address: user },
    to: process.env.LECTURER_REQUEST_NOTIFICATION_EMAIL ?? "general@syllo.live",
    subject: "בקשת הצטרפות חדשה למרצים ב־Syllo",
    text: "התקבלה בקשת הצטרפות חדשה למרצים. לצפייה בפרטים, היכנסו למסך בקשות ההצטרפות: https://syllo.live/admin",
    html: '<p>התקבלה בקשת הצטרפות חדשה למרצים.</p><p><a href="https://syllo.live/admin">לצפייה בפרטים במסך בקשות ההצטרפות</a></p>',
  });
}

function ensureTable() {
  if (!tableReady) {
    tableReady = getSql()`
      CREATE TABLE IF NOT EXISTS lecturer_interest_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        institution TEXT NOT NULL,
        course TEXT NOT NULL,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const values = fields.map((field) => form.get(field));
  if (values.some((value) => typeof value !== "string" || !value.trim()) || typeof values[2] !== "string" || !/^\S+@\S+\.\S+$/.test(values[2])) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }
  const [firstName, lastName, email, phone, institution, course] = values as string[];
  try {
    await ensureTable();
    await getSql()`
      INSERT INTO lecturer_interest_leads (first_name, last_name, email, phone, institution, course)
      VALUES (${firstName.trim()}, ${lastName.trim()}, ${email.trim().toLowerCase()}, ${phone.trim()}, ${institution.trim()}, ${course.trim()})
    `;
    try {
      await sendRequestNotification();
    } catch (error) {
      console.error("Lecturer request was saved, but the email notification failed", error);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save lecturer interest lead", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
