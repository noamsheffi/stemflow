-- Product Lab #02: anonymous slide-level friction research only.
CREATE TABLE IF NOT EXISTS slide_friction_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anonymous_client_id UUID NOT NULL,
  difficult_slide_ids TEXT[] NOT NULL,
  no_significant_difficulty BOOLEAN NOT NULL DEFAULT FALSE,
  most_difficult_slide_id TEXT,
  difficulty_reasons TEXT[] NOT NULL,
  recovery_behaviors TEXT[] NOT NULL,
  lecturer_awareness TEXT,
  not_signaling_reasons TEXT[] NOT NULL,
  preferred_intervention TEXT,
  live_feedback_likelihood SMALLINT NOT NULL,
  live_feedback_concern TEXT NOT NULL DEFAULT '',
  recovery_success TEXT NOT NULL,
  recovery_trigger TEXT,
  CONSTRAINT slide_friction_experiment_client_unique UNIQUE (experiment_id, anonymous_client_id),
  CONSTRAINT slide_friction_likelihood_check CHECK (live_feedback_likelihood BETWEEN 1 AND 5),
  CONSTRAINT slide_friction_recovery_success_check CHECK (recovery_success IN ('כן', 'לא'))
);

CREATE INDEX IF NOT EXISTS slide_friction_submissions_experiment_submitted_at_idx
  ON slide_friction_submissions (experiment_id, submitted_at DESC);
