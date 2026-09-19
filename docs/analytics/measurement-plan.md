# Syllo GA4 measurement plan

Syllo sends only stable registry IDs. It never sends names, emails, search text, free text, or student identity to GA4.

## Common context

Use only the identifiers relevant to the event: `workspace_id`, `course_id`, `lesson_id`, `slide_id`, `concept_id`, `formula_id`, and `resource_id`.

## Events

### `course_open`

- **When it fires:** A learner opens the Communication Systems course home.
- **Properties:** `workspace_id`, `course_id`.
- **Product question:** Are learners entering the course workspace?

### `lesson_open`

- **When it fires:** A learner opens lesson material.
- **Properties:** `workspace_id`, `course_id`, `lesson_id`, `resource_id`.
- **Product question:** Do students return to lesson material after class?

### `formula_open`

- **When it fires:** A learner opens an individual formula detail page.
- **Properties:** `workspace_id`, `course_id`, `formula_id`, and `lesson_id` when the formula belongs to a lesson.
- **Product question:** Is the Formula Hub becoming a useful student hook?

### `concept_open`

- **When it fires:** A learner opens an individual concept detail page from the Concept Map.
- **Properties:** `workspace_id`, `course_id`, `concept_id`, and `lesson_id` when the concept belongs to a lesson.
- **Product question:** Do students use the Concept Map to navigate course knowledge?

### `simulation_start`

- **When it fires:** A resource registered as a simulation is opened.
- **Properties:** `workspace_id`, `course_id`, `lesson_id`, `resource_id`.
- **Product question:** Which simulations are used to support learning?

### `resource_open`

- **When it fires:** A registered lesson resource is opened.
- **Properties:** `workspace_id`, `course_id`, `resource_id`.
- **Product question:** Which course resources are useful to learners?

## Page views

`page_view` is sent after client hydration on each application route change. Query strings are intentionally excluded to avoid collecting user-provided search text.

## Setup

Set `NEXT_PUBLIC_GA_ID` in Vercel for the Production environment to the GA4 Measurement ID. The root layout loads the Google tag only when the variable is present. The initial Google configuration disables its automatic page view so Syllo sends exactly one client-side page view per route.
