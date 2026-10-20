import catalog from "../decks/lesson-06/published-catalog.json";

export type Lesson06Chapter = { id: number; title: string; start: number };
export type Lesson06Slide = {
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
  }>;
  chapters: Lesson06Chapter[];
};

const deck = catalog as Catalog;

export const lesson06DeckVersion = deck.deckVersion;
export const lesson06MainSlideCount = deck.mainSlideCount;
export const lesson06AppendixCount = deck.appendixCount;
export const lesson06TotalMinutes = deck.totalMinutes;
export const lesson06Chapters = deck.chapters;
export const lesson06Slides: Lesson06Slide[] = deck.slides.map((slide) => ({
  n: slide.number,
  slideId: slide.slideId,
  sourceId: slide.id,
  displayLabel: slide.number <= deck.mainSlideCount ? String(slide.number) : `נספח ${slide.number - deck.mainSlideCount}`,
  kind: slide.kind,
  ch: slide.chapterId,
  sec: slide.section,
  // The source gives a 135-minute session total but does not assign a plan to each slide.
  min: slide.minutes ?? 0,
  eb: slide.chapter,
  h: slide.title,
  tk: "",
  notes: "",
  body: "",
}));
