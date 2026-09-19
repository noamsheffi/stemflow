export type CourseEventName =
  | "course_open"
  | "lesson_open"
  | "slide_view"
  | "formula_open"
  | "concept_open"
  | "simulation_interaction";

export type CourseEventProperties = {
  courseId: string;
  lessonId?: string;
  slideId?: string;
  formulaId?: string;
  conceptId?: string;
  resourceId?: string;
};

// Deliberately provider-agnostic and no-op in Phase 1. A later analytics adapter can
// send these stable IDs to the chosen service without changing educational components.
export function trackEvent(_eventName: CourseEventName, _properties: CourseEventProperties) {}
