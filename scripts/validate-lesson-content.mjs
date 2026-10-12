import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [lesson, source, attached, catalogText, player, studentPage, lecturerPage, eventsApi] = await Promise.all([
  read("../public/courses/communication-systems/lesson-05/lesson.html"),
  read("../src/decks/lesson-05/genspark-source.html"),
  read("../lesson05_improved.html"),
  read("../src/decks/lesson-05/published-catalog.json"),
  read("../src/components/lesson-05-player.tsx"),
  read("../src/components/lesson-phase.tsx"),
  read("../src/app/lecturer/lessons/[lessonId]/[phase]/page.tsx"),
  read("../src/app/api/learning-events/route.ts"),
]);
const catalog = JSON.parse(catalogText);
const slides = [...lesson.matchAll(/<section class="slide-page[^>]*\bid="(s\d+)"/g)].map((match) => match[1]);
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
check(lesson === source && lesson === attached, "The deployed lesson, canonical source, and supplied Genspark file must match exactly.");
check(slides.length === 32 && catalog.length === 32, `Expected 32 slides in HTML and catalog; found ${slides.length} and ${catalog.length}.`);
check(new Set(slides).size === slides.length && new Set(catalog.map((slide) => slide.slideId)).size === catalog.length, "Slide IDs must be unique.");
check(catalog.every((slide, index) => slide.id === slides[index] && slide.number === index + 1 && slide.title && slide.chapter && slide.takeaway), "Catalog slide metadata must align with the authored HTML order and include title, chapter, and takeaway.");
check(catalog.reduce((total, slide) => total + slide.minutes, 0) === 135, "The published slide plan must total 135 minutes, including the break.");
check((lesson.match(/channel:'syllo-lesson-05'/g) ?? []).length >= 1 && lesson.includes("event.source !== window.parent"), "The embedded lesson must retain its source-checked navigation bridge.");
check(player.includes('src="/courses/communication-systems/lesson-05/lesson.html"') && player.includes('publishedCatalog.map'), "The student and lecturer player must use the published HTML and its matching catalog.");
check(player.includes('data-deck-version={deckVersion}') && player.includes('const deckVersion = "lesson-05-genspark-v2"'), "The player must publish the new deck version to lecturer and student analytics.");
check(player.includes('fetch("/api/learning-events"') && ["lesson_started", "slide_viewed", "lesson_ended"].every((event) => player.includes(`"${event}"`)), "The student player must send start, slide-view, and completion events.");
check(studentPage.includes("<Lesson05Player />") && lecturerPage.includes("<Lesson05Player lecturerMode />"), "Both student and lecturer panels must render the same lesson player.");
check(eventsApi.includes("parseStudentLearningEvent") && eventsApi.includes("INSERT INTO student_lesson_events"), "Learning events must be stored by the analytics API.");
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Lesson 05 validation passed: ${catalog.length} slides, 135 planned minutes, shared student/lecturer player, and analytics event wiring.`);
}
