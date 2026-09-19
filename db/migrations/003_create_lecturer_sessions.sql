-- Lecturer reflection sessions. These records contain lecturer-generated data only.
CREATE TABLE IF NOT EXISTS lecturer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  workspace_id TEXT,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  deck_version TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_duration_ms BIGINT NOT NULL DEFAULT 0 CHECK (total_duration_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lecturer_slide_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_session_id UUID NOT NULL REFERENCES lecturer_sessions(id) ON DELETE CASCADE,
  slide_id TEXT NOT NULL,
  id_source TEXT NOT NULL CHECK (id_source IN ('authored', 'index-fallback')),
  slide_number INTEGER NOT NULL CHECK (slide_number > 0),
  planned_duration_minutes NUMERIC,
  actual_active_duration_ms BIGINT NOT NULL CHECK (actual_active_duration_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lecturer_session_id, slide_number)
);

CREATE TABLE IF NOT EXISTS lecturer_annotation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_slide_observation_id UUID NOT NULL REFERENCES lecturer_slide_observations(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('PASS', 'HARD', 'DEEPEN', 'REVISIT')),
  annotation_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lecturer_slide_observation_id, annotation_type, annotation_timestamp)
);

CREATE INDEX IF NOT EXISTS lecturer_sessions_started_at_idx ON lecturer_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS lecturer_slide_observations_session_idx ON lecturer_slide_observations (lecturer_session_id);
CREATE INDEX IF NOT EXISTS lecturer_annotation_events_observation_idx ON lecturer_annotation_events (lecturer_slide_observation_id);
