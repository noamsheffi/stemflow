import { conceptMap, conceptFormulaIds } from "./concept-map";
import formulaSheet from "./formula-sheet-data.json";

export type ResourceKind = "lesson-html" | "simulation" | "exercise" | "supporting-material";

export type CourseResource = {
  resourceId: string;
  kind: ResourceKind;
  title: string;
  href: string;
};

export type SupportingMaterial = {
  materialId: string;
  title: string;
  description: string;
  href: string;
  kind: "book" | "syllabus" | "formula-sheet";
};

export const resourceKindLabels: Record<ResourceKind, string> = {
  "lesson-html": "מערך שיעור",
  simulation: "סימולציה",
  exercise: "תרגול",
  "supporting-material": "חומר עזר",
};

export type CourseSlide = {
  slideId: string;
  number: number;
  title?: string;
};

export type CourseLesson = {
  lessonId: string;
  number: number;
  title: string;
  url: string;
  topics: string[];
  formulaIds: string[];
  conceptIds: string[];
  slides: CourseSlide[];
  resources: CourseResource[];
};

export type CourseFormula = {
  formulaId: string;
  name: string;
  expression: string;
  variables: Array<{ symbol: string; meaning: string; unit: string }>;
  physicalMeaning: string;
  lessonIds: string[];
  conceptIds: string[];
};

export type CourseConcept = {
  conceptId: string;
  name: string;
  description: string;
  relatedConceptIds: string[];
  lessonIds: string[];
  formulaIds: string[];
};

export type CourseSectionId = "lessons" | "materials" | "formulas" | "concepts";

export type Course = {
  workspaceId: string;
  courseId: string;
  title: string;
  courseNumber: string;
  lecturer: string;
  status: "active" | "archived";
  sections: CourseSectionId[];
  lessonIds: string[];
  formulaIds: string[];
  conceptIds: string[];
};

export type Workspace = {
  workspaceId: string;
  title: string;
  courses: Course[];
};

// Product registry: a workspace owns courses; every educational item belongs to a course.
// More courses can be appended here without changing Syllo-level components.
export const course: Course = {
  workspaceId: "syllo-workspace",
  courseId: "communication-systems",
  title: "מערכות תקשורת",
  courseNumber: "11.9004",
  lecturer: "נועם שפי",
  status: "active",
  sections: ["lessons", "materials", "formulas", "concepts"],
  lessonIds: [],
  formulaIds: [],
  conceptIds: [],
};

export const workspace: Workspace = {
  workspaceId: "syllo-workspace",
  title: "Syllo",
  courses: [course],
};

export const courseAppPath = (section = "") => `/course/${course.courseId}${section ? `/${section}` : ""}`;

export const supportingMaterials: SupportingMaterial[] = [
  { materialId: "communication-systems-book", title: "תקשורת תקבילית וספרתית", description: "ספר הקורס לעיון ולהעמקה בנושאי תקשורת אנלוגית וספרתית.", href: "/course-resources/communication-systems/analog-digital-communications.pdf", kind: "book" },
  { materialId: "communication-systems-syllabus-2025", title: "תוכנית לימודים במערכות תקשורת", description: "הסילבוס המעודכן למסלול י״ג, יולי 2025.", href: "/course-resources/communication-systems/syllabus-2025.pdf", kind: "syllabus" },
  { materialId: "communication-systems-formula-sheet", title: "נוסחאון מערכות תקשורת", description: "דף נוסחאות מרוכז לשימוש בזמן הלמידה והתרגול.", href: "/course-resources/communication-systems/formula-sheet.pdf", kind: "formula-sheet" },
];

// Register each hosted item here instead of duplicating course structure across pages.
export const lessons: CourseLesson[] = [
  {
    lessonId: "lesson-01",
    number: 1,
    title: "מבוא והתפשטות גלים",
    url: "/courses/communication-systems/lesson-01/",
    topics: ["מבוא", "התפשטות גלים"],
    formulaIds: [],
    conceptIds: [],
    slides: [],
    resources: [
      {
        resourceId: "lesson-01-main-html",
        kind: "lesson-html",
        title: "מערך שיעור",
        href: "/courses/communication-systems/lesson-01/",
      },
      {
        resourceId: "lesson-01-self-practice",
        kind: "exercise",
        title: "תרגול עצמי",
        href: "/courses/communication-systems/lesson-01/practice.html",
      },
    ],
  },
  {
    lessonId: "lesson-02",
    number: 2,
    title: "אפיון אותות, אפנון ורוחב פס",
    url: "/courses/communication-systems/lesson-02/",
    topics: ["אותות", "Wi‑Fi", "אפנון", "רוחב פס"],
    formulaIds: [],
    conceptIds: [],
    slides: [],
    resources: [
      {
        resourceId: "lesson-02-main-html",
        kind: "lesson-html",
        title: "אותות, Wi‑Fi ורוחב פס",
        href: "/courses/communication-systems/lesson-02/",
      },
      {
        resourceId: "lesson-02-self-practice",
        kind: "exercise",
        title: "מעבדת אותות — תרגול עצמי",
        href: "/courses/communication-systems/lesson-02/practice.html",
      },
    ],
  },
  {
    lessonId: "lesson-03",
    number: 3,
    title: "מתנדים, משוב ותהודה",
    url: "/courses/communication-systems/lesson-03/",
    topics: ["מתנדים", "משוב", "תהודה", "ברקהאוזן"],
    formulaIds: [],
    conceptIds: [],
    slides: [],
    resources: [
      {
        resourceId: "lesson-03-main-html",
        kind: "lesson-html",
        title: "מתנדים, משוב ותהודה",
        href: "/courses/communication-systems/lesson-03/",
      },
      {
        resourceId: "lesson-03-self-practice",
        kind: "exercise",
        title: "מעבדת מתנדים — למידה עצמאית",
        href: "/courses/communication-systems/lesson-03/practice.html",
      },
      {
        resourceId: "lesson-03-interactive-html",
        kind: "supporting-material",
        title: "שיעור אינטראקטיבי נוסף",
        href: "/courses/communication-systems/lesson-03/interactive.html",
      },
    ],
  },
  {
    lessonId: "lesson-04",
    number: 4,
    title: "אפנון תנופה AM",
    url: "/course/communication-systems/lessons/lesson-04/slides",
    topics: ["אפנון", "AM", "מעטפת", "פסי צד", "רוחב פס"],
    formulaIds: [],
    conceptIds: [],
    slides: [],
    resources: [
      {
        resourceId: "lesson-04-main-html",
        kind: "lesson-html",
        title: "מערך שיעור — אפנון תנופה AM",
        href: "/course/communication-systems/lessons/lesson-04/slides",
      },
      {
        resourceId: "lesson-04-self-practice",
        kind: "exercise",
        title: "תרגול אינטראקטיבי לבית — אפנון תנופה AM",
        href: "/courses/communication-systems/lesson-04/practice.html",
      },
    ],
  },
];
export const formulas: CourseFormula[] = formulaSheet.map((item) => ({
  formulaId: item.id,
  name: item.name,
  expression: item.formula_latex,
  variables: item.params.map((param) => ({ symbol: param.symbol, meaning: param.name, unit: param.unit })),
  physicalMeaning: item.usage,
  lessonIds: lessons.filter((lesson) => lesson.number === Number(item.lesson)).map((lesson) => lesson.lessonId),
  conceptIds: [],
}));

for (const lesson of lessons) {
  lesson.formulaIds = formulas.filter((formula) => formula.lessonIds.includes(lesson.lessonId)).map((formula) => formula.formulaId);
}
export const concepts: CourseConcept[] = conceptMap.map((item) => ({
  conceptId: item.id,
  name: item.title,
  description: item.summary,
  relatedConceptIds: item.connections,
  lessonIds: lessons.filter((lesson) => `שיעור ${lesson.number}` === item.lesson).map((lesson) => lesson.lessonId),
  formulaIds: conceptFormulaIds[item.id] ?? [],
}));
for (const lesson of lessons) {
  lesson.conceptIds = concepts.filter((concept) => concept.lessonIds.includes(lesson.lessonId)).map((concept) => concept.conceptId);
}
for (const formula of formulas) {
  formula.conceptIds = concepts.filter((concept) => concept.formulaIds.includes(formula.formulaId)).map((concept) => concept.conceptId);
}

course.lessonIds = lessons.map((lesson) => lesson.lessonId);
course.formulaIds = formulas.map((formula) => formula.formulaId);
course.conceptIds = concepts.map((concept) => concept.conceptId);

export function getCourse(courseId: string) {
  return workspace.courses.find((item) => item.courseId === courseId);
}

export function getLesson(lessonId: string) {
  return lessons.find((lesson) => lesson.lessonId === lessonId);
}

export function getFormula(formulaId: string) {
  return formulas.find((formula) => formula.formulaId === formulaId);
}

export function getConcept(conceptId: string) {
  return concepts.find((concept) => concept.conceptId === conceptId);
}

export function lessonHref(lesson: CourseLesson) {
  return lesson.url;
}
