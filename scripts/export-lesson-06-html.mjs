import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourcePath = resolve("src/decks/lesson-06/Lesson06_AM_FM_Final_v8.html");
const htmlPath = resolve("public/courses/communication-systems/lesson-06/lesson.html");
const catalogPath = resolve("src/decks/lesson-06/published-catalog.json");
const html = await readFile(sourcePath, "utf8");

const decodeEntities = (value) => value
  .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
  .replace(/&#x([\da-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
  .replace(/&nbsp;/gi, "\u00a0")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&apos;/gi, "'");

const plainText = (value) => decodeEntities(value.replace(/<[^>]*>/g, " "))
  .replace(/\s+/g, " ")
  .trim();
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
const slideBlocks = [...html.matchAll(/<section\b(?=[^>]*\bclass="[^"]*\bslide-page\b[^"]*")[^>]*>([\s\S]*?)<\/section>/gi)];
if (slideBlocks.length !== 56) throw new Error(`Expected 56 authored slides; found ${slideBlocks.length}.`);

const hash = createHash("sha256").update(html).digest("hex").slice(0, 16);
const rawSlides = slideBlocks.map((match, index) => {
  const startTag = match[0].slice(0, match[0].indexOf(">") + 1);
  const id = attribute(startTag, "id");
  const content = match[1];
  const title = plainText(content.match(/class="sl-h"[\s\S]*?<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "");
  const chapter = plainText(content.match(/class="sl-f"[\s\S]*?<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
  const kind = attribute(startTag, "data-kind");
  if (!id || !title || !chapter) throw new Error(`Slide ${index + 1} is missing an authored id, title, or chapter.`);
  return { id, title, chapter, kind, number: index + 1, section: id === "sBR" || id === "sAPX", minutes: null };
});

if (rawSlides[44]?.id !== "s28" || rawSlides[45]?.id !== "sAPX") {
  throw new Error("The authored deck must contain 45 required slides followed by its appendix divider.");
}
const chapterNames = [];
for (const slide of rawSlides) {
  if (chapterNames.at(-1) !== slide.chapter) chapterNames.push(slide.chapter);
  slide.chapterId = chapterNames.length - 1;
  slide.slideId = `lesson-06-${slide.id}`;
}
const catalog = {
  source: "Lesson06_AM_FM_Final_v8.html",
  deckVersion: `lesson-06-final-v8-${hash}`,
  mainSlideCount: 45,
  totalMinutes: 135,
  slides: rawSlides,
  chapters: chapterNames.map((title, id) => ({ id, title, start: rawSlides.find((slide) => slide.chapterId === id).number })),
};

await mkdir(dirname(htmlPath), { recursive: true });
await mkdir(dirname(catalogPath), { recursive: true });
await writeFile(htmlPath, html);
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Lesson 06 copied unchanged: ${rawSlides.length} authored slides (${catalog.mainSlideCount} required, ${rawSlides.length - catalog.mainSlideCount} appendix), version ${catalog.deckVersion}.`);
