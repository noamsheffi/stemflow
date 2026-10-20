import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [lesson, source, attached, catalogText, player, studentPage, lecturerPage, eventsApi, fmData, fmPlayer, fmDeck, courseData, fmHtml] = await Promise.all([
  read("../public/courses/communication-systems/lesson-05/lesson.html"),
  read("../src/decks/lesson-05/genspark-source.html"),
  read("../lesson05_improved.html"),
  read("../src/decks/lesson-05/published-catalog.json"),
  read("../src/components/lesson-05-player.tsx"),
  read("../src/components/lesson-phase.tsx"),
  read("../src/app/lecturer/lessons/[lessonId]/[phase]/page.tsx"),
  read("../src/app/api/learning-events/route.ts"),
  read("../src/components/lesson-06-data.ts"),
  read("../src/components/lesson-06-player.tsx"),
  read("../src/components/lesson-06-deck.tsx"),
  read("../src/lib/course-data.ts"),
  read("../public/courses/communication-systems/lesson-06/lesson.html"),
]);
const catalog = JSON.parse(catalogText);
const slides = [...lesson.matchAll(/<section class="slide-page[^>]*\bid="(s\d+)"/g)].map((match) => match[1]);
const sourceSlides = [...source.matchAll(/<section class="slide-page[^>]*\bid="(s\d+)"/g)].map((match) => match[1]);
const attachedSlides = [...attached.matchAll(/<section class="slide-page[^>]*\bid="(s\d+)"/g)].map((match) => match[1]);
const slideHtml = (document, id) => {
  const start = document.indexOf(`<section class="slide-page" id="${id}"`);
  if (start < 0) return "";
  const end = document.indexOf("</section>", start);
  return end < 0 ? "" : document.slice(start, end);
};
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
check(source === attached && slides.join("|") === sourceSlides.join("|") && slides.join("|") === attachedSlides.join("|"), "The deployed export, canonical source, and supplied Genspark file must contain the same authored slides in the same order.");
check(slides.length === 34 && catalog.length === 34, `Expected 34 slides in HTML and catalog; found ${slides.length} and ${catalog.length}.`);
check(new Set(slides).size === slides.length && new Set(catalog.map((slide) => slide.slideId)).size === catalog.length, "Slide IDs must be unique.");
check(catalog.every((slide, index) => slide.id === slides[index] && slide.number === index + 1 && slide.title && slide.chapter && slide.takeaway), "Catalog slide metadata must align with the authored HTML order and include title, chapter, and takeaway.");
check(catalog.reduce((total, slide) => total + slide.minutes, 0) === 135, "The published slide plan must total 135 minutes, including the break.");
check((lesson.match(/channel:'syllo-lesson-05'/g) ?? []).length >= 1 && lesson.includes("event.source !== window.parent"), "The embedded lesson must retain its source-checked navigation bridge.");
check(player.includes('src="/courses/communication-systems/lesson-05/lesson.html"') && player.includes('publishedCatalog.map'), "The student and lecturer player must use the published HTML and its matching catalog.");
check(player.includes('data-deck-version={deckVersion}') && player.includes('const deckVersion = "lesson-05-genspark-v3"'), "The player must publish the new deck version to lecturer and student analytics.");
check(catalog.findIndex((slide) => slide.id === "s33") < catalog.findIndex((slide) => slide.id === "s04"), "The AM prerequisite/formula review must appear before the spectrum simulator uses its symbols.");
check(catalog.findIndex((slide) => slide.id === "s17") < catalog.findIndex((slide) => slide.id === "s15"), "The mixer simulator must follow the image-frequency definition and derivation.");
check(catalog.findIndex((slide) => slide.id === "s20") < catalog.findIndex((slide) => slide.id === "s23"), "The break must follow the core image-frequency exercise.");
check(catalog.findIndex((slide) => slide.id === "s34") === catalog.findIndex((slide) => slide.id === "s18") + 1, "The guided LO-range calculation and guided image-frequency calculation must be separate consecutive slides.");
const openingAnswer = slideHtml(source, "s06").match(/<div class="steps"><div class="step">(.*?)<\/div>/s)?.[1] ?? "";
check(openingAnswer && !openingAnswer.includes("IF"), "The opening exercise must not reveal the undefined IF term before the receiver architecture introduces it.");
const stageSlide = slideHtml(source, "s12");
check(stageSlide.includes("קדם־מסנן RF</b> דוחה בבואה") && stageSlide.includes("ערבל + LO</b> יוצרים הפרש") && stageSlide.includes("מסנן IF</b> בוחר ערוץ") && source.includes("L5.sims.stages = function(root)") && source.slice(source.indexOf("L5.sims.stages = function(root)"), source.indexOf("/* ---------- FFT ---------- */")).includes("sel('rf')"), "The long stage-map interaction must have a visible RF → mixer → IF route and start on RF preselection.");
const mixerPhenomenon = slideHtml(source, "s13");
check(mixerPhenomenon.includes("455 kHz") && mixerPhenomenon.includes("2455 kHz") && !mixerPhenomenon.includes("DFT") && !mixerPhenomenon.includes("Hann"), "The mixer demonstration must foreground its physical sum/difference result rather than implementation details.");
const mixerDerivation = slideHtml(source, "s14");
check(mixerDerivation.includes("איך מכפלת שני אותות יוצרת סכום והפרש?") && mixerDerivation.includes("הן משרעות האותות") && mixerDerivation.includes("α=2πf"), "The mixer derivation must define the symbols and connect the trigonometric identity to RF and LO.");
const imageExercise = slideHtml(source, "s20");
check(imageExercise.indexOf("class=\"formulaRef\"") >= 0 && imageExercise.indexOf("class=\"formulaRef\"") < imageExercise.indexOf("class=\"tasks\"") && imageExercise.includes("Q<sub>RF</sub>") && imageExercise.includes("f<sub>IM</sub>") && imageExercise.includes("A<sub>dB</sub>") && imageExercise.includes("x — היסט תדר יחסי"), "The image-frequency exercise must show and define its LO, image, RF-filter, and dB equations before the task.");
const mixerSimulator = slideHtml(source, "s15");
check(mixerSimulator.includes("הדגימו בסדר:") && mixerSimulator.includes("RF=1000") && mixerSimulator.includes("1910 kHz"), "The mixer simulator must include a bounded, teachable walkthrough of the hardest interaction.");
check(player.includes('fetch("/api/learning-events"') && ["lesson_started", "slide_viewed", "lesson_ended"].every((event) => player.includes(`"${event}"`)), "The student player must send start, slide-view, and completion events.");
check(studentPage.includes("<Lesson05Player />") && lecturerPage.includes("<Lesson05Player lecturerMode />"), "Both student and lecturer panels must render the same lesson player.");
check(eventsApi.includes("parseStudentLearningEvent") && eventsApi.includes("INSERT INTO student_lesson_events"), "Learning events must be stored by the analytics API.");
const fmSlides = [...fmData.matchAll(/\{ n: (\d+), ch: (\d+), sec: (true|false), min: (\d+)/g)];
check(fmSlides.length === 24 && new Set(fmSlides.map((slide) => slide[1])).size === 24, "FM lesson must have 23 authored content slides plus one break divider, with unique stable numbers.");
check(fmSlides.reduce((total, slide) => total + Number(slide[4]), 0) === 135 && fmSlides.filter((slide) => slide[3] === "true").length === 1, "FM lesson timings must include one break and total 135 minutes.");
check(fmData.includes("β′=nβ") && fmData.includes("fₘ נשאר קבוע") && fmData.includes("כלל קרסון"), "FM lesson must explain multiplier behavior and Carson's rule.");
check(fmData.includes("רעש תדר, קליטה חלשה והפרעות עדיין עלולים לפגוע") && fmData.includes("נצילות המשדר תלויה גם בתכנון"), "FM lesson must avoid claiming noise immunity or equating constant envelope with total transmitter efficiency.");
check(fmData.includes("fmax=90.09 MHz") && fmData.includes("=200 kHz") && fmData.includes("=4 W") && fmData.includes("xFM(t)="), "FM guided solution must include the carrier deviation, signal expression, bandwidth, and power result.");
check(fmPlayer.includes("lesson-06-fm-v1") && fmPlayer.includes("lesson-06-fm-${pad2(slide.n)}") && fmDeck.includes("function Reveal") && courseData.includes('lessonId: "lesson-06"'), "FM lesson must use stable analytics IDs, staged answer reveals, and course registration.");
check(fmHtml.includes("const slides=") && fmHtml.includes("function render()") && fmHtml.includes("10 דקות הפסקה"), "FM standalone HTML must be exported from the lesson data and include its navigation renderer.");
check(studentPage.includes("<Lesson06Player />") && lecturerPage.includes("<Lesson06Player lecturerMode />"), "FM lesson must share the same player in the student and lecturer paths.");
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Lesson validation passed: lesson 05 (${catalog.length} slides) and lesson 06 (23 content slides + break, 135 minutes).`);
}
