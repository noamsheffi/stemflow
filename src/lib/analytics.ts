export type CourseEventName =
  | "course_open"
  | "lesson_open"
  | "slide_view"
  | "formula_open"
  | "concept_open"
  | "simulation_interaction";

export type AnalyticsContext = {
  workspace_id?: string;
  course_id?: string;
  lesson_id?: string;
  slide_id?: string;
  concept_id?: string;
  formula_id?: string;
  resource_id?: string;
};

export type CourseEventProperties = AnalyticsContext;

// Deliberately provider-agnostic and no-op in Phase 1. A later analytics adapter can
// send these stable IDs to the chosen service without changing educational components.
export function trackEvent(_eventName: CourseEventName, _properties: CourseEventProperties) {}
