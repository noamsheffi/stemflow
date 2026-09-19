-- Anonymous learning signals from lesson decks. No names, accounts, answers, or free text.
CREATE TABLE IF NOT EXISTS student_lesson_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_client_id UUID NOT NULL,
  session_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  deck_version TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('lesson_started', 'slide_viewed', 'lesson_ended')),
  slide_id TEXT,
  slide_number INTEGER CHECK (slide_number IS NULL OR slide_number > 0),
  active_duration_ms BIGINT CHECK (active_duration_ms IS NULL OR active_duration_ms BETWEEN 0 AND 3600000),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS student_lesson_events_lesson_idx
  ON student_lesson_events (course_id, lesson_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS student_lesson_events_slide_idx
  ON student_lesson_events (lesson_id, slide_number, occurred_at DESC)
  WHERE event_type = 'slide_viewed';
