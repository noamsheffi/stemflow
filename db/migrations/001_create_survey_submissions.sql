-- Product Lab #01: anonymous responses only.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS survey_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anonymous_client_id UUID NOT NULL,
  first_place TEXT NOT NULL,
  stuck_response TEXT NOT NULL,
  friction TEXT NOT NULL,
  find_help_ease TEXT NOT NULL,
  wish TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  CONSTRAINT survey_submissions_experiment_client_unique
    UNIQUE (experiment_id, anonymous_client_id),
  CONSTRAINT survey_submissions_find_help_ease_check
    CHECK (find_help_ease IN ('קל מאוד', 'די קל', 'לא קל ולא קשה', 'די קשה', 'קשה מאוד')),
  CONSTRAINT survey_submissions_problem_type_check
    CHECK (problem_type IN ('תוכן', 'מציאת חומר', 'הבנה', 'תרגול', 'כלי הלמידה'))
);

CREATE INDEX IF NOT EXISTS survey_submissions_experiment_submitted_at_idx
  ON survey_submissions (experiment_id, submitted_at DESC);
