import catalog from "../decks/lesson-08/published-catalog.json";

export type Lesson08Chapter = { id: number; title: string; start: number };
export type Lesson08Slide = {
  n: number;
  slideId: string;
  sourceId: string;
  displayLabel: string;
  kind: string;
  ch: number;
  sec: boolean;
  min: number;
  eb: string;
  h: string;
  tk: string;
  notes: string;
  body: string;
};

type Catalog = {
  deckVersion: string;
  mainSlideCount: number;
  appendixCount: number;
  totalMinutes: number;
  slides: Array<{
    id: string;
    slideId: string;
    title: string;
    chapter: string;
    chapterId: number;
    kind: string;
    number: number;
    section: boolean;
    minutes: number | null;
    note: string;
    takeaway: string;
  }>;
  chapters: Lesson08Chapter[];
};

const deck = catalog as Catalog;
export const lesson08DeckVersion = deck.deckVersion;
export const lesson08MainSlideCount = deck.mainSlideCount;
export const lesson08AppendixCount = deck.appendixCount;
export const lesson08TotalMinutes = deck.totalMinutes;
export const lesson08Chapters = deck.chapters;
export const lesson08Slides: Lesson08Slide[] = deck.slides.map((slide) => ({
  n: slide.number,
  slideId: slide.slideId,
  sourceId: slide.id,
  displayLabel: String(slide.number),
  kind: slide.kind,
  ch: slide.chapterId,
  sec: slide.section,
  min: slide.minutes ?? 0,
  eb: slide.chapter,
  h: slide.title,
  tk: slide.takeaway,
  notes: slide.note,
  body: "",
}));
