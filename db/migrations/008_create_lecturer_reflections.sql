-- Structured lecturer reflection for the post-class teaching loop.
CREATE TABLE IF NOT EXISTS lecturer_session_reflections (
  session_id UUID PRIMARY KEY REFERENCES lecturer_sessions(session_id) ON DELETE CASCADE,
  what_worked TEXT NOT NULL CHECK (char_length(what_worked) BETWEEN 1 AND 1000),
  what_was_difficult TEXT NOT NULL CHECK (char_length(what_was_difficult) BETWEEN 1 AND 1000),
  what_will_change TEXT NOT NULL CHECK (char_length(what_will_change) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
