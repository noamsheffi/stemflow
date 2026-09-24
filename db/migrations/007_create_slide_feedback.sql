CREATE TABLE IF NOT EXISTS student_slide_feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_client_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  slide_id TEXT NOT NULL,
  slide_number INTEGER NOT NULL CHECK (slide_number > 0),
  deck_version TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('NOT_UNDERSTOOD', 'NEED_EXAMPLE', 'QUESTION', 'POSSIBLE_ERROR')),
  optional_comment TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL,
  page_url TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (anonymous_client_id, idempotency_key)
);
