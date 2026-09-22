# Syllo analytics measurement plan

Syllo keeps three analytics streams separate:

- **GA4 = Product Usage Analytics**: navigation and product-surface usage.
- **Syllo Backend = Learning Telemetry**: detailed student lesson/session behavior.
- **Lecturer Extension = Lecturer Telemetry**: lecturer timing and annotations.

These streams are not merged. GA4 receives no slide-level learning telemetry.

## GA4 contract

Syllo sends only stable registry IDs. It never sends names, emails, search text, free text, or student identity to GA4.

### Canonical custom events

| Event | When it fires | Properties | Product question |
| --- | --- | --- | --- |
| `course_open` | Course home is opened | `workspace_id`, `course_id` | Are learners entering the course workspace? |
| `lesson_open` | A registered lesson resource (`kind: "lesson-html"`) is clicked | `workspace_id`, `course_id`, `lesson_id`, `resource_id` | Do students return to lesson material after class? |
| `resource_open` | A registered non-lesson resource (exercise, supporting material, or other non-lesson kind) is clicked | `workspace_id`, `course_id`, `resource_id` | Which non-lesson resources are used? |
| `formula_open` | Formula detail page is mounted | `workspace_id`, `course_id`, `formula_id`, related `lesson_id` when available | Which formulas are opened? |
| `concept_open` | Concept detail page is mounted | `workspace_id`, `course_id`, `concept_id`, related `lesson_id` when available | Which concepts are opened? |
| `simulation_start` | A resource registered as `kind: "simulation"` is clicked | `workspace_id`, `course_id`, `lesson_id`, `resource_id` | Candidate simulation-launch signal only; not a valid product metric until a real simulation is registered. |

A lesson click emits **only** `lesson_open`. A non-lesson resource click emits **only** `resource_open`, with `simulation_start` additionally allowed for a registered simulation. `lesson_open` and `resource_open` are mutually exclusive.

### Page views

The application uses one manual strategy:

- `src/app/layout.tsx` configures `send_page_view: false`.
- `src/components/analytics-page-view.tsx` dispatches `page_view` after hydration and on App Router pathname changes.
- `src/lib/analytics.ts` suppresses repeated dispatches for the same pathname during a client runtime.

**GA4 administration requirement:** disable Enhanced Measurement → Page views for this property. Enabling it would create a second page-view source and violate the one-strategy contract. Query strings are intentionally excluded from the manual `page_path`.

## Syllo Backend learning telemetry

The backend is the canonical source for lesson/session behavior, slide IDs, deck versions, active duration, and revisits. It is not copied into GA4.

Current implementation:

- `public/lesson-metadata.js` creates an anonymous persistent `anonymous_client_id` and per-visit `session_id`.
- `lesson_started`, `slide_viewed`, and `lesson_ended` are POSTed to `/api/learning-events`.
- `student_lesson_events` contains `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `slide_id`, `deck_version`, `active_duration_ms`, and `occurred_at`.
- `occurred_at` is the canonical event timestamp: for `lesson_started` it is the lesson entry time (`entered_at` semantic); for `slide_viewed` it is the view-close time (`viewed_at` semantic). The stored `active_duration_ms` is the active time for the viewed slide.
- `slide_viewed` is produced when a slide is left or visibility changes, so repeated rows for the same slide represent revisits/returns. The schema indexes lesson and slide views for this analysis.
- The backend respects Do Not Track and does not receive names, emails, free text, or GA4 identifiers.

The schema uses the single normalized `occurred_at` timestamp rather than separate `entered_at` and `viewed_at` columns. The semantic mapping above is intentional and preserves the existing telemetry without duplicating it into GA4.

## Lecturer telemetry

The Lecturer Extension is the canonical source for lecturer timing and annotations. It stores lecturer session IDs, `course_id`, `lesson_id`, `deck_version`, slide IDs, active duration, and annotation events. It remains separate from both GA4 and student learning telemetry until an explicit joining design is approved.

## Signal matrix

| Signal | Source | Canonical system | Entity IDs | Product question |
| --- | --- | --- | --- | --- |
| Course/workspace entry | `course_open` | GA4 | `workspace_id`, `course_id` | Are learners entering the course? |
| Lesson/resource navigation | `lesson_open` | GA4 | `workspace_id`, `course_id`, `lesson_id`, `resource_id` | Do students return to lessons? |
| Non-lesson resource navigation | `resource_open` | GA4 | `workspace_id`, `course_id`, `resource_id` | Which exercises/supporting resources are opened? |
| Formula detail navigation | `formula_open` | GA4 | `workspace_id`, `course_id`, `formula_id` | Which formulas are opened? |
| Concept detail navigation | `concept_open` | GA4 | `workspace_id`, `course_id`, `concept_id` | Which concepts are opened? |
| Lesson/session start | `lesson_started` | Syllo Backend | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `deck_version`, `occurred_at` | Which lessons are actually entered and for how many sessions? |
| Slide exposure/duration | `slide_viewed` | Syllo Backend | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `slide_id`, `deck_version`, `occurred_at`, `active_duration_ms` | Which slides are viewed, revisited, and for how long? |
| Lesson/session end | `lesson_ended` | Syllo Backend | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `deck_version`, `occurred_at` | How do lesson sessions end? |
| Lecturer slide timing | Lecturer Extension | Lecturer telemetry | `session_id`, `course_id`, `lesson_id`, `deck_version`, `slide_id` | Where did the lecturer spend time? |
| Lecturer annotation | Lecturer Extension | Lecturer telemetry | lecturer session/slide IDs, annotation timestamp/type | Which slides were marked PASS/HARD/DEEPEN/REVISIT? |

## Telemetry event contract (definition only)

These candidates are intentionally documented without implementation. They must not be sent to GA4 as slide/session telemetry.

| Event | Trigger | Required properties | Product question | Deduplication rule |
| --- | --- | --- | --- | --- |
| `exercise_attempt` | Learner submits a meaningful exercise attempt or completes a defined check | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `resource_id`, `attempt_id` or attempt sequence, `occurred_at`, `result` (coarse enum only) | Which exercises are actually used and attempted? | One row per submitted attempt; never emit on every keystroke or slider change. |
| `solution_reveal` | Learner reveals a gated solution | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `resource_id`, `solution_id`, `occurred_at` | Which solutions are sought after practice? | One event per solution reveal per session; repeated hide/show toggles do not create new events. |
| `simulation_meaningful_interaction` | Learner completes a defined meaningful simulation action | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `resource_id`, `interaction_id`, `occurred_at` | Which simulations are actually used, beyond opening them? | Emit once per meaningful interaction milestone; aggregate continuous control changes. |
| `student_feedback_submitted` | Learner submits a structured feedback response | `anonymous_client_id`, `session_id`, `course_id`, `lesson_id`, `resource_id` when relevant, `feedback_type` enum, `occurred_at` | Which learning surfaces generate actionable feedback? | One event per submitted form; do not include free-text content or identify the learner. |

These contracts stay in the backend learning telemetry stream if implemented. They are not part of the current GA4 canonical event list.

## Setup and governance

Set `NEXT_PUBLIC_GA_ID` in the Production environment to the GA4 Measurement ID. Keep Enhanced Measurement Page views disabled because manual App Router page views are canonical. Review the three streams independently; do not merge GA4 product usage, student learning telemetry, and lecturer telemetry until a documented privacy and identity design exists.
