import "server-only";
import { getSql } from "./db";

let learningSchema: Promise<void> | undefined;
let lecturerSchema: Promise<void> | undefined;
let lecturerReflectionSchema: Promise<void> | undefined;

export function ensureLearningSchema() {
  return learningSchema ??= (async () => {
    const sql = getSql();
    await sql.query(`CREATE TABLE IF NOT EXISTS student_lesson_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_client_id UUID NOT NULL, session_id UUID NOT NULL, course_id TEXT NOT NULL, lesson_id TEXT NOT NULL, deck_version TEXT, event_type TEXT NOT NULL CHECK (event_type IN ('lesson_started', 'slide_viewed', 'lesson_ended')), slide_id TEXT, slide_number INTEGER CHECK (slide_number IS NULL OR slide_number > 0), active_duration_ms BIGINT CHECK (active_duration_ms IS NULL OR active_duration_ms BETWEEN 0 AND 3600000), occurred_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await sql.query(`CREATE INDEX IF NOT EXISTS student_lesson_events_lesson_idx ON student_lesson_events (course_id, lesson_id, occurred_at DESC)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS student_lesson_events_slide_idx ON student_lesson_events (lesson_id, slide_number, occurred_at DESC) WHERE event_type = 'slide_viewed'`);
  })();
}

export function ensureLecturerSessionSchema() {
  return lecturerSchema ??= (async () => {
    const sql = getSql();
    await sql.query(`CREATE TABLE IF NOT EXISTS lecturer_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL UNIQUE, workspace_id TEXT, course_id TEXT NOT NULL, lesson_id TEXT NOT NULL, deck_version TEXT, started_at TIMESTAMPTZ NOT NULL, ended_at TIMESTAMPTZ, total_duration_ms BIGINT NOT NULL DEFAULT 0 CHECK (total_duration_ms >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await sql.query(`CREATE TABLE IF NOT EXISTS lecturer_slide_observations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lecturer_session_id UUID NOT NULL REFERENCES lecturer_sessions(id) ON DELETE CASCADE, slide_id TEXT NOT NULL, id_source TEXT NOT NULL CHECK (id_source IN ('authored', 'index-fallback')), slide_number INTEGER NOT NULL CHECK (slide_number > 0), planned_duration_minutes NUMERIC, actual_active_duration_ms BIGINT NOT NULL CHECK (actual_active_duration_ms >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (lecturer_session_id, slide_number))`);
    await sql.query(`CREATE TABLE IF NOT EXISTS lecturer_annotation_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lecturer_slide_observation_id UUID NOT NULL REFERENCES lecturer_slide_observations(id) ON DELETE CASCADE, annotation_type TEXT NOT NULL CHECK (annotation_type IN ('PASS', 'HARD', 'DEEPEN', 'REVISIT')), annotation_timestamp TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (lecturer_slide_observation_id, annotation_type, annotation_timestamp))`);
  })();
}

export function ensureLecturerReflectionSchema() {
  return lecturerReflectionSchema ??= (async () => {
    const sql = getSql();
    await sql.query(`CREATE TABLE IF NOT EXISTS lecturer_session_reflections (
      session_id UUID PRIMARY KEY REFERENCES lecturer_sessions(session_id) ON DELETE CASCADE,
      what_worked TEXT NOT NULL CHECK (char_length(what_worked) BETWEEN 1 AND 1000),
      what_was_difficult TEXT NOT NULL CHECK (char_length(what_was_difficult) BETWEEN 1 AND 1000),
      what_will_change TEXT NOT NULL CHECK (char_length(what_will_change) BETWEEN 1 AND 1000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  })();
}
