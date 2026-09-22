# Syllo GA4 analytics audit

Audit scope: repository inspection only. No source code, event definitions, or deployment configuration was changed by this audit.

## 1. Current analytics architecture

The GA4 adapter is `src/lib/analytics.ts`. It accepts a fixed union of six custom event names, filters properties to string values, and calls `window.gtag("event", ...)` when `NEXT_PUBLIC_GA_ID` is present. If the Google tag has not installed yet, it queues the command in `window.dataLayer`. All GA4 calls are client-side; there is no server-side GA4 Measurement Protocol integration.

The root App Router layout (`src/app/layout.tsx`) loads `gtag.js` and configures the measurement ID with `{ send_page_view: false }`. `src/components/analytics-page-view.tsx` sends a custom `page_view` after hydration and whenever `usePathname()` changes. The application therefore owns page-view dispatch rather than relying on the GA4 config's automatic initial page view.

`src/components/analytics-event-tracker.tsx` is a client-only, once-per-mounted-component wrapper used for page-entry events. `src/components/lesson-open-link.tsx` is a client-only click handler that can emit one, two, or three custom events for a single click.

There is a separate first-party learning telemetry path in `public/lesson-metadata.js` and `/api/learning-events`. It sends `lesson_started`, `slide_viewed`, and `lesson_ended` to the Syllo database with an anonymous local-storage UUID. Those are not GA4 events and are excluded from the GA4 event count below, but they are relevant to the product-question gap analysis.

## 2. Complete event inventory

`NEXT_PUBLIC_GA_ID` must be configured for any of these calls to reach Google. Without it, the functions return without sending.

| Event | Trigger | File / component | Route or page | Properties sent | Stable IDs included | Possible duplicate / noise risk | Client-only? | Enhanced Measurement overlap | Product meaning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `page_view` | `useEffect` after hydration; repeats when `usePathname()` changes | [src/components/analytics-page-view.tsx](/Users/noam.sheffi/EDX/src/components/analytics-page-view.tsx:7), [src/lib/analytics.ts](/Users/noam.sheffi/EDX/src/lib/analytics.ts:47) | Every Next.js App Router page using the root layout; pathname excludes query string | `page_path` | None beyond pathname | One per pathname effect is expected. No ref guard exists, so a remount can send another view; reloads naturally send a new view. | Yes | Config-level automatic page view is disabled. GA4 Enhanced Measurement is a separate property setting and, if enabled, may duplicate this custom event. | Route/page traffic. |
| `course_open` | Once-per-mounted `AnalyticsEventTracker` effect | [src/app/course/communication-systems/page.tsx](/Users/noam.sheffi/EDX/src/app/course/communication-systems/page.tsx:13) | `/course/communication-systems` | `workspace_id`, `course_id` | `syllo-workspace`, `communication-systems` | Re-entry, reload, or remount sends again; ref protects only one mounted instance. | Yes | None | Course workspace entry. |
| `lesson_open` | User clicks a `LessonOpenLink` anchor | [src/components/lesson-open-link.tsx](/Users/noam.sheffi/EDX/src/components/lesson-open-link.tsx:20), used by [src/app/lessons/[lessonId]/page.tsx](/Users/noam.sheffi/EDX/src/app/lessons/[lessonId]/page.tsx:13), [src/components/course-content.tsx](/Users/noam.sheffi/EDX/src/components/course-content.tsx:22), and the course-home latest-lesson link | Course home and lesson/resource cards; click usually navigates to `/courses/...` static content | `workspace_id`, `course_id`, `lesson_id`, `resource_id` | Workspace, course, lesson, resource registry IDs | Fires on every click, including repeated clicks or failed navigation. It is intent, not confirmation that the destination loaded. One click also emits `resource_open` and sometimes `simulation_start`. | Yes | None | Lesson/resource entry and a proxy for return behavior. |
| `resource_open` | Same `LessonOpenLink` click as `lesson_open` | [src/components/lesson-open-link.tsx](/Users/noam.sheffi/EDX/src/components/lesson-open-link.tsx:23) | Same routes as `lesson_open` | `workspace_id`, `course_id`, `resource_id` | Workspace, course, resource registry IDs | Deliberately co-fires with every `lesson_open`; overlapping volume. Repeated clicks are unbounded. Omits `lesson_id`. | Yes | None | Generic registered-resource use. |
| `simulation_start` | Same click, only when `resourceKind === "simulation"` | [src/components/lesson-open-link.tsx](/Users/noam.sheffi/EDX/src/components/lesson-open-link.tsx:24) | Any `LessonOpenLink` registered as a simulation | `workspace_id`, `course_id`, `lesson_id`, `resource_id` | Workspace, course, lesson, resource registry IDs | No current registry resource has kind `simulation` (`src/lib/course-data.ts:106-197`), so it has no reachable trigger today. If added later, it measures clicks, not actual interaction. | Yes | None | Intended simulation launch signal; currently unfired. |
| `formula_open` | Once-per-mounted `AnalyticsEventTracker` effect | [src/app/formulas/[formulaId]/page.tsx](/Users/noam.sheffi/EDX/src/app/formulas/[formulaId]/page.tsx:14), re-exported by [src/app/course/communication-systems/formulas/[formulaId]/page.tsx](/Users/noam.sheffi/EDX/src/app/course/communication-systems/formulas/[formulaId]/page.tsx:1) | Formula detail pages | `workspace_id`, `course_id`, `formula_id`, `lesson_id: formula.lessonIds[0]` | Workspace, course, formula; first related lesson | Reload/re-entry sends again. `lesson_id` is inferred from only the first related lesson. | Yes | None | Formula detail interest. |
| `concept_open` | Once-per-mounted `AnalyticsEventTracker` effect | [src/app/concepts/[conceptId]/page.tsx](/Users/noam.sheffi/EDX/src/app/concepts/[conceptId]/page.tsx:14), re-exported by [src/app/course/communication-systems/concepts/[conceptId]/page.tsx](/Users/noam.sheffi/EDX/src/app/course/communication-systems/concepts/[conceptId]/page.tsx:1) | Concept detail pages | `workspace_id`, `course_id`, `concept_id`, `lesson_id: registryConcept?.lessonIds[0]` | Workspace, course, concept; first related lesson when present | Reload/re-entry sends again. `lesson_id` is inferred and can be undefined. | Yes | None | Concept detail interest. |

### Expected-event verification

| Expected event | Exists? | Reachable now? | Finding |
| --- | --- | --- | --- |
| `course_open` | Yes | Yes, course home after hydration | Implemented. |
| `lesson_open` | Yes | Yes, registered lesson/resource link clicks | Implemented; static lesson documents do not emit it themselves. |
| `formula_open` | Yes | Yes, formula detail routes | Implemented. |
| `concept_open` | Yes | Yes, concept detail routes | Implemented. |
| `simulation_start` | Yes | No current `CourseResource` has `kind: "simulation"` | Defined but currently zero-trigger/unverified. |
| `resource_open` | Yes | Yes, paired with every `LessonOpenLink` click | Implemented. |

## 3. Page-view audit

- `src/app/layout.tsx` sets `send_page_view: false`, so the config's automatic initial page view is disabled.
- `AnalyticsPageView` is mounted in the root layout and sends after hydration. `usePathname()` changes on App Router client transitions, so Next route transitions are covered.
- The custom value is pathname only; query strings are excluded, avoiding search/free-text query collection.
- Enhanced Measurement is a GA4 property-level setting not represented in this repository. If its Page views setting is enabled, GA4 may generate an additional page view for the same navigation. This is the primary duplicate-page-view risk.
- There is no explicit ref guard on the page-view component. A remount or unusual lifecycle can repeat a view for the same pathname.
- Static lesson/resource HTML under `/courses/...` is public content, not wrapped by the Next root layout, and contains no `gtag`/Google tag. Entering the actual lesson document therefore does not itself produce a GA4 page view; only the preceding app click can emit the open events.

## 4. Metadata and context audit

| Identifier | Current status | Notes |
| --- | --- | --- |
| `workspace_id` | Present on all custom GA4 events | Registry value `syllo-workspace`. |
| `course_id` | Present on all custom GA4 events | Registry value `communication-systems`. |
| `lesson_id` | Present on `lesson_open` and `simulation_start`; present conditionally on formula/concept; absent from `course_open` and `resource_open` | Formula/concept values use only the first association; missing associations are omitted by the string filter. `resource_open` requires inference from resource ID. |
| `slide_id` | Type declared but never sent by GA4 | Separate internal learning API sends slide IDs. |
| `formula_id` | Only on `formula_open` | Stable formula registry ID. |
| `concept_id` | Only on `concept_open` | Stable concept-map/registry ID. |
| `resource_id` | On `lesson_open`, `simulation_start`, `resource_open` | Registry IDs are stable. Course-home fallback uses `lesson-main-html`, inconsistent with registered `lesson-XX-main-html` IDs. |
| `deck_version` | Missing from all GA4 events | Exists in internal lesson and lecturer-session data, not GA4. |

No GA4 event includes an anonymous internal learning session ID, so GA4 cannot be joined to the internal slide/session stream.

## 5. Product-question coverage

| Product question | Classification | Why |
| --- | --- | --- |
| A. Do students return to course material after class? | PARTIALLY SUPPORTED | Open clicks can repeat, but GA4 has no learner/session bridge, no post-class cohort dimension, and static lesson entry has no GA page view. Internal telemetry has anonymous lesson sessions, but is not GA4. |
| B. Which lessons do they return to? | PARTIALLY SUPPORTED | `lesson_open` has `lesson_id`; `resource_open` does not, and no explicit revisit semantics or cross-session identity exists. |
| C. Which formulas are opened? | SUPPORTED | `formula_open` carries stable `formula_id`. |
| D. Which concepts are revisited? | PARTIALLY SUPPORTED | `concept_open` carries `concept_id`, but no explicit revisit classification or learner continuity exists. |
| E. Which simulations are actually used? | NOT SUPPORTED | `simulation_start` has no current registry trigger and would only indicate a click, not actual interaction. |
| F. Which exercises or solutions are opened? | PARTIALLY SUPPORTED | Exercise links use generic open events with resource IDs; no exercise-attempt or solution-reveal signal exists. |
| G. Where do students repeatedly revisit content? | PARTIALLY SUPPORTED | Internal `slide_viewed` telemetry has slide-level views/duration, but GA4 has no `slide_id`. |
| H. Can student behavior later be correlated with lecturer annotations? | NOT SUPPORTED in GA4 | Internal student and lecturer streams share some course/lesson/deck/slide fields, but GA4 is not joined and omits `deck_version`/`slide_id`. |

## 6. Duplicate, noise, and weak-signal findings

1. `lesson_open` and `resource_open` are emitted for the same click, creating overlapping volume and two definitions of “opened.”
2. `simulation_start` is currently unreachable and, if enabled, would be a click proxy rather than confirmed use.
3. `lesson_open` fires before navigation and can record failed or repeated clicks.
4. Generic `resource_open` omits `lesson_id`, weakening lesson analysis.
5. Formula/concept events distinguish mounts, not first open versus revisit.
6. No slider-specific GA4 event was found. The public interactive materials have controls but do not call GA4; adding raw per-change events would create noise and is not recommended.
7. Internal `slide_viewed` telemetry is higher-volume server-side learning data, not duplicate GA4 traffic.

## 7. Missing high-value signals (recommendations only)

- `slide_view` (or an aggregated equivalent): needed for G and meaningful A/B content granularity. Include stable `lesson_id`, `slide_id`, `deck_version`, and bounded active duration. The internal API already captures much of this; parallel GA4 traffic should be considered carefully.
- `slide_revisit`: needed to distinguish first exposure from meaningful return (G/A). Emit once per threshold, not per navigation tick.
- `exercise_attempt`: needed for F and to distinguish opening an exercise from using it. One event per submitted/meaningful attempt, not every input change.
- `solution_reveal`: needed for F where solutions are gated. One event per reveal.

`simulation_interaction` is not a current priority because no simulation surface is registered. `student_feedback_submitted` is not recommended from the current product questions and would require separate free-text privacy handling.

## 8. Privacy review

The GA4 adapter sends only registry-style string properties: workspace, course, lesson, slide (unused), concept, formula, and resource IDs. No GA4 call sends student names, emails, Google account data, free text, student IDs, or IP as an application property. `page_path` excludes query strings. The public learning telemetry uses a random anonymous UUID and no names/email.

The Google tag may collect standard platform metadata according to the GA property configuration; that is outside application properties and cannot be fully audited here. No application-level PII issue was found.

## 9. Recommended event priorities (do not implement as part of this audit)

### P0 — minimum post-class learning signal

- `slide_view` (preferably standardize/reuse the existing internal slide-view telemetry rather than creating parallel high-volume GA4 traffic).
- `slide_revisit`, with a meaningful threshold rather than every transition.

These are the minimum semantic signals for what post-class content learners return to and where repeated revisits occur. They require stable `slide_id` and `deck_version`.

### P1 — practice engagement

- `exercise_attempt` for meaningful submissions.
- `solution_reveal` where solutions are gated.

These answer exercise-use questions without logging free-text answers or keystrokes.

### P2 — conditional instrumentation

- `simulation_interaction` only after a real simulation is registered and its meaningful-use boundary is defined.
- Decide whether generic `resource_open` or lesson-specific `lesson_open` is the canonical open metric; the current pair is overlapping.

## 10. Audit totals and exact firing locations

- Total custom GA4 event names found: **6** (`course_open`, `lesson_open`, `formula_open`, `concept_open`, `simulation_start`, `resource_open`). `page_view` is counted separately.
- Events that currently answer product questions directly: **`course_open`, `lesson_open`, `formula_open`, `concept_open`, and `resource_open`**, with limitations above. `simulation_start` does not currently fire from the registry.
- Duplicate risks: **two primary risks** — custom `page_view` versus Enhanced Measurement page views, and paired `lesson_open` + `resource_open` on every resource click. Reload/re-entry and repeated clicks add repeat risk.
- Missing P0 signals: **stable slide-view/revisit semantics with `slide_id` and `deck_version`**, or an explicit decision to use internal learning telemetry as the canonical source.
- Exact files where GA4 analytics currently fires or is dispatched:
  - [src/lib/analytics.ts](/Users/noam.sheffi/EDX/src/lib/analytics.ts:30)
  - [src/components/analytics-page-view.tsx](/Users/noam.sheffi/EDX/src/components/analytics-page-view.tsx:10)
  - [src/components/analytics-event-tracker.tsx](/Users/noam.sheffi/EDX/src/components/analytics-event-tracker.tsx:9)
  - [src/components/lesson-open-link.tsx](/Users/noam.sheffi/EDX/src/components/lesson-open-link.tsx:20)
  - [src/app/layout.tsx](/Users/noam.sheffi/EDX/src/app/layout.tsx:16)
  - [src/app/course/communication-systems/page.tsx](/Users/noam.sheffi/EDX/src/app/course/communication-systems/page.tsx:13)
  - [src/app/formulas/[formulaId]/page.tsx](/Users/noam.sheffi/EDX/src/app/formulas/[formulaId]/page.tsx:14)
  - [src/app/concepts/[conceptId]/page.tsx](/Users/noam.sheffi/EDX/src/app/concepts/[conceptId]/page.tsx:14)

The course-scoped formula/concept re-export files do not send independently; they render the same instrumented page components.

