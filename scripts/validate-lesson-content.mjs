import { readFile } from "node:fs/promises";

const deckPath = new URL("../src/components/lesson-05-player.tsx", import.meta.url);
const lesson4DeckPath = new URL("../src/components/lesson-04-player.tsx", import.meta.url);
const conceptPath = new URL("../src/lib/concept-map-data.json", import.meta.url);
const studentWorkspacePath = new URL("../src/components/student-workspace.tsx", import.meta.url);
const feedbackApiPath = new URL("../src/app/api/student/slide-feedback/route.ts", import.meta.url);
const extensionManifestPath = new URL("../extensions/lecturer-reflection/manifest.json", import.meta.url);
const exportedHtmlPath = new URL("../public/courses/communication-systems/lesson-05/lesson.html", import.meta.url);
const [deck, lesson4Deck, conceptJson, studentWorkspace, feedbackApi, extensionManifestText, exportedHtml] = await Promise.all([
  readFile(deckPath, "utf8"),
  readFile(lesson4DeckPath, "utf8"),
  readFile(conceptPath, "utf8"),
  readFile(studentWorkspacePath, "utf8"),
  readFile(feedbackApiPath, "utf8"),
  readFile(extensionManifestPath, "utf8"),
  readFile(exportedHtmlPath, "utf8"),
]);
const extensionManifest = JSON.parse(extensionManifestText);
const concepts = JSON.parse(conceptJson);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

const dataBlock = deck.match(/const data: DeckSlide\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const slides = dataBlock.split("\n").filter((line) => /^\s*\{ chapter:/.test(line));
check(slides.length >= 30, `Expected a complete lesson 5 deck; found ${slides.length} slide records.`);
check(slides.every((line) => line.includes("title:") && line.includes("minutes:") && line.includes("takeaway:") && line.includes("notes:") && line.includes("content:")), "Every slide record must include a title, planned duration, takeaway, teaching notes, and student content.");
const plannedMinutes = slides.reduce((sum, line) => sum + Number(line.match(/minutes: (\d+)/)?.[1] ?? 0), 0);
check(plannedMinutes === 135, `Expected the source lesson plan duration of 135 minutes including break; found ${plannedMinutes}.`);

check(!/\bf(?:LO|RF|IF|IM)\b/.test(dataBlock), "A frequency symbol uses inline fLO/fRF/fIF/fIM notation; use f with a subscript or KaTeX braces.");
check(!/\{slide\.minutes\}\s*דקות|timeLeft|דק׳ לסיום|דקות בסך הכול|דקות כולל הפסקה/.test(deck), "Slide timing is rendered in the student-facing player; timing should remain planning metadata only.");
check(dataBlock.includes("משדר AM בשיעור 4: ממקור המידע לאנטנה") && ["מיקרופון", "מסנן שמע", "אפנן AM", "מגבר הספק", "אנטנה"].every((term) => dataBlock.includes(term)), "The lesson 4 bridge must be a separate slide showing the transmitter path from source to antenna.");
check(dataBlock.includes("שאלת פתיחה: איך בוחרים תחנה אחת?") && dataBlock.includes("מה יש בתוך אות AM? נושא ושני פסי צד"), "The opening question and the AM spectrum teaching slide must be distinct from the lesson 4 recap.");
check(dataBlock.includes("<AMSpectrum />") && deck.includes("פס צד תחתון") && deck.includes("פס צד עליון") && deck.includes("f<tspan") && deck.includes(">משרעת</text>") && deck.includes(">תדר</text>") && deck.includes("התרשים איכותי"), "The AM spectrum plot must label both axes, the carrier, both sidebands, and clarify that the drawn heights are qualitative.");
check(dataBlock.includes("מקדם איכות") && dataBlock.includes("רוחב הפס") && dataBlock.includes("Tuned Radio Frequency"), "Define Q, bandwidth, and TRF before asking students to use them.");
const trfIntro = slides.find((line) => line.includes('title: "מקלט ישיר TRF')) ?? "";
const bandwidthDefinition = slides.find((line) => line.includes('title: "רוחב פס המסנן')) ?? "";
check(Boolean(trfIntro && !trfIntro.includes("BW=")), "The TRF overview slide should not combine the receiver definition with the bandwidth formula.");
check(Boolean(bandwidthDefinition && bandwidthDefinition.includes("<TRFResponseGraph />") && !bandwidthDefinition.includes("formula(")), "The bandwidth explanation must present its formula through the response graph caption without crowding the graph with a second equation panel.");
const responseGraph = deck.match(/function TRFResponseGraph\(\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
check(Boolean(bandwidthDefinition && bandwidthDefinition.includes("<TRFResponseGraph />")), "The TRF bandwidth definition slide must include a response-versus-frequency graph.");
check(responseGraph.includes("תדר תהודה") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"17\">0</tspan>") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"13\">L</tspan>") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"13\">H</tspan>"), "The TRF graph must label the resonance peak and both passband edges f₀, fL, and fH.");
check(responseGraph.includes("C300 292 380 280 445 215") && responseGraph.includes("C760 280 840 292 970 298") && responseGraph.includes("C460 290 500 280 530 215") && responseGraph.includes("C640 280 680 290 760 298"), "The low- and high-Q curves must intersect the −3 dB threshold at their labeled passband boundaries.");
check(responseGraph.includes("Q נמוך · פס רחב") && responseGraph.includes("Q גבוה · פס צר") && responseGraph.includes("−3 dB") && responseGraph.includes("העקומות איכותיות"), "The TRF graph must compare high and low Q at a half-power threshold and identify its curves as qualitative.");
check(responseGraph.includes("Q=f<sub>0</sub>/BW") && responseGraph.includes("חסר יחידות") && responseGraph.includes("BW=f<sub>H</sub>−f<sub>L</sub>") && responseGraph.includes("חצי־הספק"), "The TRF graph caption must define bandwidth at the half-power threshold and the dimensionless quality factor.");

const flows = [...dataBlock.matchAll(/<div className=\{styles\.flow\}>([\s\S]*?)<\/div>/g)].map((match) => match[1]);
check(flows.length > 0, "The deck should include its authored signal-flow diagrams.");
check(flows.every((flow) => !flow.includes("→")), "A right-pointing arrow appears in a right-to-left signal-flow diagram.");
const architectureComparison = slides.find((line) => line.includes('title: "TRF או סופר־הטרודיין?')) ?? "";
check(Boolean(architectureComparison && architectureComparison.includes("שתי ארכיטקטורות") && architectureComparison.includes("אין המרת תדר") && architectureComparison.includes("מתנד מקומי") && architectureComparison.includes("מסנן IF קבוע")), "TRF and superheterodyne need an explicit contrast that explains their relationship and signal paths.");
const comparisonPosition = slides.indexOf(architectureComparison);
const receiverMapPosition = slides.findIndex((line) => line.includes('title: "מפת מקלט הסופר־הטרודיין'));
check(comparisonPosition >= 0 && receiverMapPosition === comparisonPosition + 1, "The TRF comparison must lead directly into the superheterodyne block diagram.");
check(deck.includes("const extensionSlideCatalog = JSON.stringify(data.map") && (deck.match(/data-slides=\{extensionSlideCatalog\}/g) ?? []).length >= 3, "Lesson 5 must expose its full slide catalog to the lecturer Chrome extension in preview, player, and presentation mode.");
check(deck.includes("syllo:lesson-player-open") && deck.includes("syllo:lesson-player-exit") && deck.includes("syllo:lesson-feedback-update"), "Lesson 5 must emit the lifecycle and feedback events used by the lecturer and student panels.");
check(studentWorkspace.includes('selectedLesson?.lessonId === "lesson-04" || selectedLesson?.lessonId === "lesson-05"') && studentWorkspace.includes("lesson05Slides[slideNumber - 1]?.title"), "The student workspace feedback tab must display and link to lesson 5 feedback by slide.");
check(feedbackApi.includes("lesson-(04|05)"), "The student slide-feedback API must support deleting lesson 5 feedback as well as lesson 4.");
check(extensionManifest.content_scripts[0].matches.some((url) => url.includes("/lecturer/lessons/*")), "The lecturer extension must match lecturer lesson routes.");
check(deck.includes("function bidiQuantities") && deck.includes("{bidiQuantities(slide.takeaway)}") && architectureComparison.includes("<bdi dir=\"ltr\">455 kHz</bdi>"), "Visible values with units must stay in value-then-unit order in RTL slides and diagrams.");
check(exportedHtml.includes('class="cover"') && exportedHtml.includes('class="architectureCompare"') && exportedHtml.includes('<bdi dir="ltr">455 kHz</bdi>'), "The standalone lesson HTML must retain its slide-specific CSS classes and isolated value-unit direction.");
check(exportedHtml.includes('class="responseGraph"') && exportedHtml.includes('id="trf-response-title"') && exportedHtml.includes("Q גבוה · פס צר") && exportedHtml.includes("Q נמוך · פס רחב"), "The standalone lesson HTML must include the resonance response graph and both Q comparison labels.");
const exportedBandwidthSlide = exportedHtml.match(/<section class="slide-page[^>]*id="lesson-05-slide-06"[\s\S]*?<\/section>/)?.[0] ?? "";
check(exportedBandwidthSlide.includes('class="responseGraph"') && exportedBandwidthSlide.includes("חצי־הספק") && !exportedBandwidthSlide.includes("sl-fx"), "The exported bandwidth slide must fit the graph explanation without a redundant equation panel.");
check(deck.includes('useLessonState(stateKey + ":index", 0)') && deck.includes('useLessonState<number[]>(stateKey + ":seen", [])') && deck.includes('useLessonState(stateKey + ":outline", true)') && deck.includes('useLessonState(stateKey + ":context", false)'), "Lesson 5 must persist its slide position, viewed-slide statistics, outline visibility, and context visibility like lesson 4.");
check(deck.includes("{seen.length}/{data.length} שקפים נצפו") && deck.includes("chapterSeen / chapterSlides.length") && deck.includes("chapterFeedback > 0") && deck.includes("feedbackMarker"), "Lesson 5 must show overall and chapter viewing progress plus per-chapter/per-slide feedback markers.");
check(deck.includes("aria-expanded={Boolean(openChapters[chapter])}") && deck.includes("setOpenChapters") && deck.includes("onClick={() => go(slideIndex)}"), "Lesson 5 outline controls must expand/collapse chapters and navigate to slides.");
check(deck.includes("currentFeedback && !feedbackEditing") && deck.includes('window.localStorage.setItem("syllo:student:lesson:lesson-05:feedback"') && deck.includes('method: "POST"') && deck.includes('method: "DELETE"'), "Lesson 5 feedback must restore saved submissions, show their status, and support create/update/delete operations.");
check(["#D9731F", "#137A86", "#3B5BA9", "#C0392B"].every((color) => deck.includes(color) && lesson4Deck.includes(color)), "Lesson 5 feedback categories must reuse the four lesson 4 colors.");
check(deck.includes('event.key === "Escape"') && deck.includes("exitPresentation()") && deck.includes("requestFullscreen()"), "Lesson 5 presentation controls must enter fullscreen and let Escape exit it.");

const lesson5Concepts = concepts.filter((concept) => concept.lesson === "שיעור 5");
check(lesson5Concepts.length >= 6, `Expected at least 6 lesson 5 glossary concepts; found ${lesson5Concepts.length}.`);
for (const concept of lesson5Concepts) {
  check(Boolean(concept.title && concept.summary && concept.details), `Concept ${concept.id} needs a title, summary, and explanation.`);
  for (const relatedId of concept.connections ?? []) {
    check(concepts.some((candidate) => candidate.id === relatedId), `Concept ${concept.id} links to missing concept ${relatedId}.`);
  }
}

if (errors.length) {
  console.error("Lesson content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Lesson content validation passed: ${slides.length} slide records / ${plannedMinutes} planned minutes, ${lesson5Concepts.length} lesson 5 glossary entries, and checked learning sequence, bridge, AM spectrum, TRF resonance/Q response graph, notation, unit direction, feedback panels, persistence, progress statistics, controls, lecturer extension catalog, and flow direction.`);
}
