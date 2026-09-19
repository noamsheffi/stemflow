# Lecturer reflection MVP

Load this folder as an unpacked Chromium extension (Extensions → Developer mode → Load unpacked). Opening a supported Syllo lesson URL starts a session automatically; the small timer pill confirms it is active. Click the extension action again to open review. Auto-start is limited to `localhost:3000` and the configured Syllo Vercel domain, never every website. Enable file URL access in extension settings if opening local HTML files; local files still need a click on the extension action.

The upper-right toolbar opens as a small timer pill. Click it for PASS (עבר טוב), HARD (דרש יותר הסבר), DEEPEN (צריך להעמיק), REVISIT (לחזור לזה), and review. Hover for labels; use the grip to drag it. After a mark, it returns to compact mode in about 1.5 seconds. The default position was visually checked on lesson 3 at 1440×900 and clears its help, navigation, and counter. If projecting or sharing this window, the overlay is visible to viewers too; activation is lecturer-only, not a separate projector display.

Click ☷ for review, then End class to stop timing permanently. The review then offers Sync to Syllo; it never blocks ending the session. Open the extension's Options page to issue a short-lived Syllo sync token, review saved sessions, retry sync, or export JSON. Sessions are local to this browser first. Reloading creates a separate session; this MVP does not merge them. Local saves checkpoint every five seconds and on transitions, annotations, visibility changes, and page exit; an abrupt browser crash can lose the last interval. Save failures are shown in the review.

Timing uses performance.now() and MutationObserver on each .slide's class within .deck. It does not wrap or modify show(), #counter, notes, or existing timing values. Only visible active-slide time counts; review dialogs also pause timing. Revisits accumulate into the same slide's total. Annotations are append-only timestamped events. Over-planned time is highlighted independently of HARD/DEEPEN/REVISIT, without inferring difficulty. Missing, empty, negative, or invalid data-minutes is unavailable rather than zero. Zero is a valid authored plan.

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
