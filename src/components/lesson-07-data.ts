import catalog from "../decks/lesson-07/published-catalog.json";

export type Lesson07Chapter = { id: number; title: string; start: number };
export type Lesson07Slide = {
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
  chapters: Lesson07Chapter[];
};

const deck = catalog as Catalog;
export const lesson07DeckVersion = deck.deckVersion;
export const lesson07MainSlideCount = deck.mainSlideCount;
export const lesson07AppendixCount = deck.appendixCount;
export const lesson07TotalMinutes = deck.totalMinutes;
export const lesson07Chapters = deck.chapters;
export const lesson07Slides: Lesson07Slide[] = deck.slides.map((slide) => ({
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
