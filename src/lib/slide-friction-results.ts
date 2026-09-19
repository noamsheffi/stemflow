import "server-only";

import { getSql } from "./db";
import {
  difficultyReasonOptions,
  lessonSlides,
  preferredInterventionOptions,
  recoveryTriggerOptions,
  SLIDE_FRICTION_EXPERIMENT_ID,
} from "./slide-friction";

type SubmissionRow = {
  difficult_slide_ids: string[];
  no_significant_difficulty: boolean;
  difficulty_reasons: string[];
  lecturer_awareness: string | null;
  preferred_intervention: string | null;
  live_feedback_likelihood: number;
  live_feedback_concern: string;
  recovery_trigger: string | null;
  submitted_at: string;
};

export type Distribution = { label: string; count: number };

export type SlideFrictionResults = {
  totalResponses: number;
  slideHeatmap: Array<{ id: string; number: number; count: number; percentage: number }>;
  topDifficultSlides: Array<{ id: string; number: number; count: number; percentage: number }>;
  difficultyReasons: Distribution[];
  silentConfusion: { count: number; denominator: number; percentage: number };
  preferredInterventions: Distribution[];
  liveFeedbackLikelihood: Distribution[];
  recoveryTriggers: Distribution[];
  comments: Array<{ submittedAt: string; comment: string }>;
};

function distribution(options: readonly string[], values: string[]): Distribution[] {
  return options.map((label) => ({ label, count: values.filter((value) => value === label).length }));
}

function percentage(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export async function getSlideFrictionResults(): Promise<SlideFrictionResults> {
  const rows = await getSql()`
    SELECT difficult_slide_ids, no_significant_difficulty, difficulty_reasons,
      lecturer_awareness, preferred_intervention, live_feedback_likelihood,
      live_feedback_concern, recovery_trigger, submitted_at
    FROM slide_friction_submissions
    WHERE experiment_id = ${SLIDE_FRICTION_EXPERIMENT_ID}
    ORDER BY submitted_at DESC
  ` as unknown as SubmissionRow[];

  const slideHeatmap = lessonSlides.map((slide) => {
    const count = rows.filter((row) => row.difficult_slide_ids.includes(slide.id)).length;
    return { ...slide, count, percentage: percentage(count, rows.length) };
  });
  const struggledRows = rows.filter((row) => !row.no_significant_difficulty);
  const silentConfusionCount = struggledRows.filter((row) => row.lecturer_awareness === "כנראה שלא" || row.lecturer_awareness === "לא").length;

  return {
    totalResponses: rows.length,
    slideHeatmap,
    topDifficultSlides: [...slideHeatmap]
      .filter((slide) => slide.count > 0)
      .sort((a, b) => b.count - a.count || a.number - b.number)
      .slice(0, 3),
    difficultyReasons: distribution(difficultyReasonOptions, rows.flatMap((row) => row.difficulty_reasons)),
    silentConfusion: {
      count: silentConfusionCount,
      denominator: struggledRows.length,
      percentage: percentage(silentConfusionCount, struggledRows.length),
    },
    preferredInterventions: distribution(preferredInterventionOptions, rows.flatMap((row) => row.preferred_intervention ? [row.preferred_intervention] : [])),
    liveFeedbackLikelihood: distribution(["1", "2", "3", "4", "5"], rows.map((row) => String(row.live_feedback_likelihood))),
    recoveryTriggers: distribution(recoveryTriggerOptions, rows.flatMap((row) => row.recovery_trigger ? [row.recovery_trigger] : [])),
    comments: rows
      .filter((row) => row.live_feedback_concern.trim().length > 0)
      .map((row) => ({ submittedAt: row.submitted_at, comment: row.live_feedback_concern })),
  };
}
