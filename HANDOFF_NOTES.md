# Syllo student workspace handoff notes

## Implemented from the supplied screen specification

- Added a shared RTL student workspace with course rail, expandable lesson tree, breadcrumbs, a page-scrolling main area, and a collapsible context panel.
- Added phase routes for lesson materials, practice, and reflection drafts.
- Reused the repository's lesson files, formula dataset, concept map, and supporting PDF links.
- Context notes and reflection drafts are saved in the current browser's local storage and are not sent to the server.
- Used neutral phase indicators where the application has no completion data; availability of a lesson resource is not represented as student progress.

## Backend data and API gaps

- `CourseLesson` does not currently define lesson dates, phase completion states, progress percentages, slide counts, or question counts. Its `slides` arrays are empty. The UI therefore does not show dates, counts, locks, or completion claims from the prototype mock data.
- `/api/learning-events` accepts `lesson_started`, `slide_viewed`, and `lesson_ended` events. It has no practice completion or per-phase student progress model.
- There is no API for saving a student's per-lesson reflection. The existing `002-post-class-behavior` endpoint stores a separate research questionnaire; it is not used for lesson reflections.
- The current course registry has one populated course. New courses can be registered, but course-specific lessons, formulas, concepts, and materials must be added to the registry/data sources before they can appear in the tree.
- The formula and concept source files contain lesson 5 entries while the registered lesson list currently ends at lesson 4. Those entries remain visible in their library views, without a fabricated lesson link.

## Follow-up work

- Add a per-course and per-lesson phase progress model with read/write APIs before showing completion status or locked lessons.
- Decide whether reflection drafts should stay private/local or be submitted anonymously to a new API, including retention and privacy behavior.
- Register lesson 5 and associate its existing formulas and concepts with actual course material when that content is ready.
- Add slide identifiers/counts and practice question metadata only when those values are supplied by the source lesson files or backend.
