# Lecturer reflection MVP

Load this folder as an unpacked Chromium extension (Extensions → Developer mode → Load unpacked). Opening a supported Syllo presentation URL (`/courses/communication-systems/lesson-*`, or the in-app player under `/course/communication-systems/lessons/*/slides`) starts a session automatically; client-side navigation from the course lessons page is also detected. The compact floating panel expands to show slide timing, marks, notes, and the session timeline. Click **סקירת מפגש** to review, export, finish, or sync. Student feedback summaries are hidden until a read API is available. Auto-start is limited to the communication-systems course on `localhost:3000` and the configured Syllo domains. After updating this extension's files, click Reload on its card in `chrome://extensions`, then reload the presentation tab. Enable file URL access in extension settings if opening local HTML files; local files still need a click on the extension action.

The compact panel defaults to the visual left edge. Expand it to switch sides, view the current slide and chapter, add a note, and navigate with the mini timeline. Drag the header vertically. The keyboard shortcuts are `1`–`4` for marks, `E` to expand/collapse, and `R` to review; arrow keys and Space remain available to the slide deck. A mark is a toggle, so pressing the selected mark again clears it. The panel's state resumes for the same lesson URL in this browser.

Open **סקירת מפגש** to filter and edit marks, navigate to slides, inspect per-slide time, export the requested JSON shape, end the lesson, or sync. Sync still uses the existing `/api/lecturer/sessions` endpoint and short-lived token from the extension's Options page. Timing, marks, notes and the current slide are saved locally. Notes are included in local state and the JSON export; the current lecturer-session API does not accept or store them. Student feedback summaries stay hidden because the student-feedback API has no read endpoint yet.

Timing uses `performance.now()` and observes active-slide changes without replacing the deck's navigation functions. It supports the legacy `.slide.lesson-slide` decks, the new React Lesson 04 player, and iframe-hosted decks. Only visible active-slide time counts; a paused timer and the review panel stop timing. Revisits accumulate on the same slide. The local mark is one toggle per slide; server sync maps it to the existing `PASS`, `HARD`, `DEEPEN`, and `REVISIT` annotation types. Planned time comes from authored slide metadata; missing values remain unavailable, and zero is a valid plan.

## Template metadata

Add these attributes in new lesson templates:

```html
<body data-course-id="communication-systems" data-lesson-id="lesson-04" data-deck-version="your-version">
<section class="slide" data-slide-id="lesson-04-slide-01" data-minutes="2">…</section>
```

Existing repository decks use /lesson-metadata.js to generate missing slide IDs on load. scripts/lesson-metadata.mjs runs before dev/build, adds body course/lesson attributes and the loader once, and generates a deterministic content hash as deck version. Existing authored slide IDs and all data-minutes values are preserved. New templates should keep authored IDs unchanged when slides are moved. Generated IDs are explicitly marked index-fallback: they are temporary positional identities, not stable across reordering. Compare fallback IDs only within the same deck version. Unknown external paths fall back to the pathname as lesson identity; add explicit metadata for reliable cross-deck identification.

The current checked-in decks have no data-minutes, so their planned duration remains unavailable. Lecturer notes remain untouched. No inference model or post-class reflection intelligence is implemented.

For Syllo sync deployment and required server variables, see [the project guide](/Users/noam.sheffi/EDX/docs/lecturer-extension.md).

## Verification

Run npm run typecheck. For the browser regression test, serve public on port 8765 and run scripts/test-lecturer-reflection.cjs with Playwright available in NODE_PATH and Chrome installed. The test injects the actual tracker with a mock chrome.storage.local; packaged-extension installation and storage permissions still require a manual smoke test after loading unpacked. It covers timing boundaries, visibility, revisits, multiple marks, missing plans, highlighting, end, duplicate activation, and navigation clearance.
