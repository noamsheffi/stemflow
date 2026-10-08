import { readFile } from "node:fs/promises";

const deckPath = new URL("../src/components/lesson-05-player.tsx", import.meta.url);
const conceptPath = new URL("../src/lib/concept-map-data.json", import.meta.url);
const [deck, conceptJson] = await Promise.all([
  readFile(deckPath, "utf8"),
  readFile(conceptPath, "utf8"),
]);
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
check(Boolean(bandwidthDefinition && bandwidthDefinition.includes("BW=") && bandwidthDefinition.includes("f_0")), "Bandwidth formula and its terms need a dedicated explanation slide before the calculation example.");

const flows = [...dataBlock.matchAll(/<div className=\{styles\.flow\}>([\s\S]*?)<\/div>/g)].map((match) => match[1]);
check(flows.length > 0, "The deck should include its authored signal-flow diagrams.");
check(flows.every((flow) => !flow.includes("→")), "A right-pointing arrow appears in a right-to-left signal-flow diagram.");

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
  console.log(`Lesson content validation passed: ${slides.length} slide records / ${plannedMinutes} planned minutes, ${lesson5Concepts.length} lesson 5 glossary entries, and checked bridge, spectrum, notation, and flow direction.`);
}
