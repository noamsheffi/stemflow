CREATE TABLE IF NOT EXISTS lecturer_interest_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  course TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lecturer_interest_leads_submitted_at_idx
  ON lecturer_interest_leads (submitted_at DESC);

CREATE INDEX IF NOT EXISTS lecturer_interest_leads_email_idx
  ON lecturer_interest_leads (email);
