"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { LecturerSessionInsight } from "../../../../lib/lecturer-session-insights";
import styles from "./review-workspace.module.css";

type MarkType = "PASS" | "HARD" | "DEEPEN" | "REVISIT";
type ReviewSlide = {
  slideId: string;
  slideNumber: number;
  idSource: string;
  title: string;
  eyebrow: string;
  chapter: string;
  chapterId: number | null;
  section: boolean;
  plannedDurationMs: number | null;
  actualActiveDurationMs: number;
  mark: MarkType | null;
  anonymousReturned: number;
  returnViews: number;
};

const MARKS: Array<{ key: MarkType; label: string; short: string; glyph: string; color: string; soft: string }> = [
  { key: "PASS", label: "עבר טוב", short: "עבר טוב", glyph: "✓", color: "#137A86", soft: "#E8F4F5" },
  { key: "HARD", label: "דרש יותר הסבר", short: "דרש הסבר", glyph: "!", color: "#D9731F", soft: "#FDF3EA" },
  { key: "DEEPEN", label: "צריך להעמיק", short: "להעמיק", glyph: "★", color: "#B8860B", soft: "#FBF4DF" },
  { key: "REVISIT", label: "לשנות בפעם הבאה", short: "לשנות", glyph: "↻", color: "#3B5BA9", soft: "#ECF0FA" },
];
const MARK = Object.fromEntries(MARKS.map((item) => [item.key, item])) as Record<MarkType, (typeof MARKS)[number]>;
const numericMs = (value: number | string | null) => {
  if (value === null || (typeof value === "string" && value.trim() === "")) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const fmt = (value: number | string | null) => {
  const ms = numericMs(value);
  return ms === null ? "לא נמדד" : `${Math.floor(ms / 60_000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
};
const date = (value: string) => new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));

function priority(slide: ReviewSlide) {
  const over = slide.plannedDurationMs !== null && slide.plannedDurationMs > 0 && slide.actualActiveDurationMs > slide.plannedDurationMs * 1.25;
  return (slide.mark === "HARD" || slide.mark === "REVISIT" ? 3 : 0)
    + (over ? 2 : 0)
    + (slide.anonymousReturned >= 3 ? 1.5 : 0);
}

function MarkPicker({ value, onChange, busy, size = "small" }: { value: MarkType | null; onChange: (mark: MarkType | null) => void; busy?: boolean; size?: "small" | "large" }) {
  return <div className={`${styles.markPicker} ${size === "large" ? styles.markPickerLarge : ""}`} role="group" aria-label="סימון מרצה">
    {MARKS.map((mark) => <button key={mark.key} type="button" disabled={busy} aria-label={`${mark.label}${value === mark.key ? ", מסומן, לחיצה להסרה" : ""}`} aria-pressed={value === mark.key} title={mark.label} className={value === mark.key ? styles.markSelected : ""} style={{ "--mark-color": mark.color, "--mark-soft": mark.soft } as CSSProperties} onClick={(event) => { event.stopPropagation(); onChange(value === mark.key ? null : mark.key); }}><span>{mark.glyph}</span>{size === "large" && <b>{mark.label}</b>}</button>)}
  </div>;
}

function TimeBars({ actual, planned }: { actual: number | string | null; planned: number | null }) {
  if (planned === null || planned <= 0) return <span className={styles.notMeasured}>שקף מעבר</span>;
  const actualMs = numericMs(actual);
  if (actualMs === null) return <span className={styles.notMeasured}>לא נמדד</span>;
  const max = Math.max(actualMs, planned, 1);
  const delta = actualMs - planned;
  return <div className={styles.timeCell}>
    <div className={styles.timeBars}><i className={styles.planBar} style={{ width: `${planned / max * 100}%` }} /><i className={`${styles.actualBar} ${actualMs > planned * 1.25 ? styles.actualOver : ""}`} style={{ width: `${actualMs / max * 100}%` }} /></div>
    <div className={styles.timeText}><bdi dir="ltr">{fmt(actualMs)} / {fmt(planned)}</bdi><span className={delta > planned * 0.25 ? styles.deltaOver : delta < -planned * 0.2 ? styles.deltaUnder : ""}>{delta > 0 ? "+" : delta < 0 ? "−" : "±"}{fmt(Math.abs(delta))}</span></div>
  </div>;
}

function Metric({ label, value, detail, onClick, active, tone = "" }: { label: string; value: string; detail: string; onClick?: () => void; active?: boolean; tone?: string }) {
  const content = <><small>{label}</small><bdi className={styles.metricValue} dir="ltr">{value}</bdi><span>{detail}</span></>;
  return onClick ? <button type="button" className={`${styles.metric} ${tone ? styles[tone] : ""} ${active ? styles.metricActive : ""}`} onClick={onClick}>{content}</button> : <div className={`${styles.metric} ${tone ? styles[tone] : ""}`}>{content}</div>;
}

export default function LecturerReviewWorkspace({
  session,
  slides: initialSlides,
  insights,
  totalDurationMs,
  syncedAt,
  anonymousBrowsers,
  deckVersionMatched,
  reflectionContent,
}: {
  session: { sessionId: string; courseId: string; lessonId: string; startedAt: string; endedAt: string | null };
  slides: ReviewSlide[];
  insights: LecturerSessionInsight[];
  totalDurationMs: number;
  syncedAt: string;
  anonymousBrowsers: number;
  deckVersionMatched: boolean;
  reflectionContent: ReactNode;
}) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [fullScreen, setFullScreen] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(true);
  const [selected, setSelected] = useState<number | null>(initialSlides.find((slide) => !slide.section)?.slideNumber ?? null);
  const [tab, setTab] = useState<"slides" | "reflection">("slides");
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  const [sort, setSort] = useState("order");
  const [preset, setPreset] = useState("all");
  const [selectedMarks, setSelectedMarks] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [savingSlide, setSavingSlide] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const instructionalSlides = useMemo(() => slides.filter((slide) => !slide.section), [slides]);
  const markCounts = useMemo(() => Object.fromEntries(MARKS.map((mark) => [mark.key, instructionalSlides.filter((slide) => slide.mark === mark.key).length])) as Record<MarkType, number>, [instructionalSlides]);
  const markedCount = instructionalSlides.filter((slide) => slide.mark !== null).length;
  const unmarkedCount = Math.max(0, instructionalSlides.length - markedCount);
  const timedSlides = instructionalSlides.filter((slide) => slide.actualActiveDurationMs > 0 && slide.plannedDurationMs !== null && slide.plannedDurationMs > 0);
  const measuredActualMs = timedSlides.reduce((sum, slide) => sum + slide.actualActiveDurationMs, 0);
  const measuredPlanMs = timedSlides.reduce((sum, slide) => sum + (slide.plannedDurationMs ?? 0), 0);
  const returnedSlides = instructionalSlides.filter((slide) => slide.anonymousReturned > 0).length;
  const selectedSlide = instructionalSlides.find((slide) => slide.slideNumber === selected) ?? instructionalSlides[0] ?? null;
  const chapters = [...new Map(instructionalSlides.map((slide) => [String(slide.chapterId ?? slide.chapter), { id: String(slide.chapterId ?? slide.chapter), title: slide.chapter || "שקפים" }])).values()];

  useEffect(() => {
    const update = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const scored = useMemo(() => instructionalSlides.map((slide) => ({ slide, score: priority(slide) })), [instructionalSlides]);
  const topSlides = scored.filter((item) => item.score >= 2.5).sort((a, b) => b.score - a.score).slice(0, 3);
  const filteredSlides = useMemo(() => {
    const filtered = instructionalSlides.filter((slide) => {
      const score = priority(slide);
      const over = slide.plannedDurationMs !== null && slide.plannedDurationMs > 0 && slide.actualActiveDurationMs > slide.plannedDurationMs * 1.25;
      const text = `${slide.title} ${slide.eyebrow} ${slide.chapter}`.toLocaleLowerCase("he");
      if (preset === "action" && score < 2.5) return false;
      if (preset === "kept" && (slide.mark !== "PASS" || over)) return false;
      if (selectedMarks.length && !selectedMarks.some((key) => key === "none" ? !slide.mark : slide.mark === key)) return false;
      if (flags.includes("over") && !over) return false;
      if (flags.includes("returned") && !slide.anonymousReturned) return false;
      if (chapter !== "all" && String(slide.chapterId ?? slide.chapter) !== chapter) return false;
      if (query && !text.includes(query.toLocaleLowerCase("he"))) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "priority") return priority(b) - priority(a) || a.slideNumber - b.slideNumber;
      if (sort === "over") return ((b.actualActiveDurationMs || 0) - (b.plannedDurationMs || 0)) - ((a.actualActiveDurationMs || 0) - (a.plannedDurationMs || 0)) || a.slideNumber - b.slideNumber;
      if (sort === "returned") return b.anonymousReturned - a.anonymousReturned || a.slideNumber - b.slideNumber;
      return a.slideNumber - b.slideNumber;
    });
  }, [instructionalSlides, preset, selectedMarks, flags, chapter, query, sort]);
  const groupedSlides = sort === "order" ? chapters.map((group) => ({ ...group, slides: filteredSlides.filter((slide) => String(slide.chapterId ?? slide.chapter) === group.id) })).filter((group) => group.slides.length) : [];

  async function updateMark(slideNumber: number, mark: MarkType | null) {
    const current = slides.find((slide) => slide.slideNumber === slideNumber);
    if (!current || savingSlide !== null) return;
    const next = current.mark === mark ? null : mark;
    setSavingSlide(slideNumber);
    setSaveError("");
    setSlides((value) => value.map((slide) => slide.slideNumber === slideNumber ? { ...slide, mark: next } : slide));
    try {
      const response = await fetch(`/api/lecturer/sessions/${session.sessionId}/marks`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slideNumber, mark: next }) });
      if (!response.ok) throw new Error("הסימון לא נשמר. נסו שוב.");
      router.refresh();
    } catch (error) {
      setSlides((value) => value.map((slide) => slide.slideNumber === slideNumber ? { ...slide, mark: current.mark } : slide));
      setSaveError(error instanceof Error ? error.message : "לא ניתן לשמור את הסימון.");
    } finally { setSavingSlide(null); }
  }

  function toggleMarkFilter(key: string) { setSelectedMarks((values) => values.includes(key) ? values.filter((value) => value !== key) : [...values, key]); setPreset("all"); }
  function toggleFlag(key: string) { setFlags((values) => values.includes(key) ? values.filter((value) => value !== key) : [...values, key]); setPreset("all"); }
  function resetFilters() { setPreset("all"); setSelectedMarks([]); setFlags([]); setChapter("all"); setQuery(""); }

  function exportJson() {
    const body = { course: session.courseId, lesson: session.lessonId, sessionId: session.sessionId, at: new Date().toISOString(), slides: instructionalSlides.map((slide) => ({ n: slide.slideNumber, title: slide.title, plannedMs: slide.plannedDurationMs, actualMs: slide.actualActiveDurationMs, mark: slide.mark, anonymousReturned: slide.anonymousReturned })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `syllo-${session.lessonId}-${session.sessionId}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  function chooseRow(slide: ReviewSlide) { setSelected(slide.slideNumber); setDetailOpen(true); }
  function rowKey(event: KeyboardEvent<HTMLDivElement>, slide: ReviewSlide) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseRow(slide); } }
  function setCardFilter(kind: "none" | "returned" | "over") {
    setPreset("all"); setSelectedMarks(kind === "none" ? (selectedMarks.includes("none") ? [] : ["none"]) : []);
    setFlags(kind === "none" ? [] : (flags.includes(kind) ? [] : [kind]));
  }

  const renderRow = (slide: ReviewSlide) => {
    const over = slide.plannedDurationMs !== null && slide.plannedDurationMs > 0 && slide.actualActiveDurationMs > slide.plannedDurationMs * 1.25;
    return <div key={slide.slideNumber} className={`${styles.tableRow} ${selected === slide.slideNumber ? styles.rowSelected : ""} ${slide.actualActiveDurationMs > 0 ? "" : styles.rowUnseen}`} role="button" tabIndex={0} aria-pressed={selected === slide.slideNumber} onClick={() => chooseRow(slide)} onKeyDown={(event) => rowKey(event, slide)}>
      <span className={styles.slideCell}><bdi className={styles.slideNumber} dir="ltr">{String(slide.slideNumber).padStart(2, "0")}</bdi><span><b>{slide.title}</b><small>{slide.eyebrow || slide.chapter}</small></span></span>
      <span className={styles.markCell} onClick={(event) => event.stopPropagation()}><MarkPicker value={slide.mark} onChange={(mark) => void updateMark(slide.slideNumber, mark)} busy={savingSlide === slide.slideNumber} /></span>
      <TimeBars actual={slide.actualActiveDurationMs > 0 ? slide.actualActiveDurationMs : null} planned={slide.plannedDurationMs} />
      <span className={styles.returnCell}>{deckVersionMatched && slide.anonymousReturned > 0 ? <><i><b style={{ width: anonymousBrowsers ? `${Math.min(100, slide.anonymousReturned / anonymousBrowsers * 100)}%` : "0%" }} /></i><bdi dir="ltr">{slide.anonymousReturned}</bdi></> : <i>—</i>}</span>
    </div>;
  };

  const mainBody = tab === "reflection" ? reflectionContent : <>
    <section className={styles.metricGrid} aria-label="מדדי מפגש">
      <Metric label="זמן הוראה פעיל" value={fmt(totalDurationMs)} detail={measuredPlanMs > 0 ? `${fmt(measuredActualMs)} / ${fmt(measuredPlanMs)} בשקפים שנמדדו` : `${timedSlides.length} שקפים עם תכנון ומדידה`} tone="metricNavy" />
      <Metric label="הסימונים שלך" value={`${markedCount}/${instructionalSlides.length}`} detail="שקפי תוכן שסומנו" tone="metricAccent" onClick={() => { setSelectedMarks([]); setFlags([]); setPreset("all"); }} />
      <Metric label="ללא סימון" value={String(unmarkedCount)} detail={`מתוך ${instructionalSlides.length} שקפי תוכן`} active={selectedMarks.includes("none")} onClick={() => setCardFilter("none")} />
      <Metric label="חזרו לשקפים" value={String(returnedSlides)} detail={deckVersionMatched ? `${anonymousBrowsers} דפדפנים אנונימיים · בחלון שאחרי השיעור` : "גרסת השקפים אינה תואמת למדידה"} active={flags.includes("returned")} onClick={() => setCardFilter("returned")} />
    </section>

    {insights.length > 0 && <section className={styles.insightSection} aria-labelledby="insights-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>נקודות לבדיקה</p><h2 id="insights-title">מה כדאי לקחת למפגש הבא</h2></div><span>הצעות על בסיס הנתונים הזמינים</span></div><div className={styles.insightGrid}>{insights.map((insight, index) => <article key={`${insight.title}-${index}`} className={`${styles.insightCard} ${insight.kind === "action" ? styles.insightAction : insight.kind === "strength" ? styles.insightStrength : styles.insightCheck}`}><small>{insight.kind === "action" ? "המלצה" : insight.kind === "strength" ? "לשימור" : "כדאי לבדוק"}</small><h3>{insight.title}</h3><p>{insight.evidence}</p><b>צעד מוצע</b><p>{insight.recommendation}</p></article>)}</div><p className={styles.disclaimer}>זמן צפייה, סימון או צפייה חוזרת הם אותות לבדיקה — לא קביעה על רמת ההבנה של הלומדים.</p></section>}

    <section className={styles.timelineCard} aria-labelledby="timeline-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>רצף ומקצב</p><h2 id="timeline-title">מהלך השיעור</h2></div><span>גובה = זמן פעיל · מסגרת = זמן מתוכנן · צבע = סימון</span></div><div className={styles.timelineScroll}><div className={styles.timeline}>{chapters.map((group) => { const groupSlides = instructionalSlides.filter((slide) => String(slide.chapterId ?? slide.chapter) === group.id); return <div className={styles.timelineChapter} key={group.id} style={{ flexGrow: groupSlides.length }}><div className={styles.timelineBars}>{groupSlides.map((slide) => { const max = Math.max(slide.plannedDurationMs ?? 0, slide.actualActiveDurationMs, 60_000); const mark = slide.mark ? MARK[slide.mark] : null; return <button type="button" key={slide.slideNumber} title={`שקף ${slide.slideNumber} · ${slide.title}`} aria-label={`בחירת שקף ${slide.slideNumber}: ${slide.title}`} aria-pressed={selected === slide.slideNumber} className={`${styles.timelineBar} ${selected === slide.slideNumber ? styles.timelineSelected : ""}`} onClick={() => chooseRow(slide)}><i className={styles.timelinePlan} style={{ height: `${Math.max(3, (slide.plannedDurationMs ?? 0) / max * 100)}%` }} /><i className={styles.timelineActual} style={{ height: `${slide.actualActiveDurationMs ? Math.max(4, slide.actualActiveDurationMs / max * 100) : 0}%`, background: mark?.color ?? "#94a3b8" }} /></button>; })}</div><small><bdi dir="ltr">{group.id}</bdi> · {group.title}</small></div>; })}</div></div></section>

    <div className={styles.midGrid}>
      <section className={styles.card}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>עדיפות לבדיקה</p><h2>איפה להתחיל</h2></div><button type="button" className={styles.textButton} onClick={() => { setPreset("action"); setSort("priority"); }}>כל השקפים לטיפול</button></div>{topSlides.length ? topSlides.map(({ slide, score }, index) => <button type="button" className={styles.priorityRow} key={slide.slideNumber} onClick={() => chooseRow(slide)}><bdi className={styles.priorityRank} dir="ltr">{index + 1}</bdi><span><b>שקף {String(slide.slideNumber).padStart(2, "0")} · {slide.title}</b><small>{[slide.mark && MARK[slide.mark].label, slide.anonymousReturned >= 3 && `${slide.anonymousReturned} דפדפנים חזרו`, slide.plannedDurationMs && slide.actualActiveDurationMs > slide.plannedDurationMs * 1.25 && "חריגה מהזמן המתוכנן"].filter(Boolean).join(" · ")}</small></span><bdi className={styles.priorityScore} dir="ltr">{score.toFixed(1)}</bdi></button>) : <p className={styles.empty}>אין כרגע שקפים עם כמה אותות לבדיקה.</p>}<p className={styles.disclaimer}>אלה נקודות לבדיקה, לא אבחנה. זמן ארוך או צפייה חוזרת לבדם אינם מוכיחים קושי.</p></section>
      <section className={`${styles.card} ${styles.markBreakdown}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>תמונת סימונים</p><h2>הסימונים במפגש</h2></div><span>{markedCount} מתוך {instructionalSlides.length}</span></div><div className={styles.markDistribution}>{MARKS.map((mark) => <span key={mark.key} style={{ flexGrow: markCounts[mark.key] || 0, background: mark.color }} title={`${mark.label}: ${markCounts[mark.key]}`} />)}{unmarkedCount > 0 && <span className={styles.unmarkedSegment} style={{ flexGrow: unmarkedCount }} title={`ללא סימון: ${unmarkedCount}`} />}</div><div className={styles.markLegend}>{MARKS.map((mark) => <button type="button" key={mark.key} onClick={() => toggleMarkFilter(mark.key)}><i style={{ background: mark.color }} />{mark.short}<bdi dir="ltr">{markCounts[mark.key]}</bdi></button>)}<button type="button" onClick={() => toggleMarkFilter("none")}><i className={styles.unmarkedLegend} />ללא סימון<bdi dir="ltr">{unmarkedCount}</bdi></button></div></section>
    </div>

    <section className={styles.slideSection} aria-labelledby="slides-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>סקירת מפגש</p><h2 id="slides-title">לפי שקף</h2></div><button type="button" className={styles.exportButton} onClick={exportJson}>ייצוא JSON</button></div>
      <div className={styles.filters}>
        <div className={styles.presetBar}>{[["all", "כל השקפים"], ["action", "דורש בדיקה"], ["kept", "לשמור כמו שזה"]].map(([key, label]) => <button key={key} type="button" className={preset === key ? styles.presetActive : ""} onClick={() => { setPreset(key); if (key !== "all") { setSelectedMarks([]); setFlags([]); } }}>{label}</button>)}</div>
        <div className={styles.filterRow}><input className={styles.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש שקף, נושא או פרק" aria-label="חיפוש שקף"/><select value={chapter} onChange={(event) => setChapter(event.target.value)} aria-label="סינון לפי פרק"><option value="all">כל הפרקים</option>{chapters.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="מיון שקפים"><option value="order">סדר השקפים</option><option value="priority">עדיפות לבדיקה</option><option value="over">חריגה בזמן</option><option value="returned">חזרות אנונימיות</option></select></div>
        <div className={styles.chipFilters}><span>סימון</span>{MARKS.map((mark) => <button type="button" key={mark.key} className={selectedMarks.includes(mark.key) ? styles.chipActive : ""} style={{ "--chip-color": mark.color, "--chip-soft": mark.soft } as CSSProperties} onClick={() => toggleMarkFilter(mark.key)}>{mark.glyph} {mark.short}</button>)}<button type="button" className={selectedMarks.includes("none") ? styles.chipActive : ""} onClick={() => toggleMarkFilter("none")}>ללא סימון</button><i />{[["over", "חריגה בזמן"], ["returned", "חזרה אחרי שיעור"]].map(([key, label]) => <button type="button" key={key} className={flags.includes(key) ? styles.chipActive : ""} onClick={() => toggleFlag(key)}>{label}</button>)}</div>
        <div className={styles.filterCount}><span><bdi dir="ltr">{filteredSlides.length}</bdi> מתוך {instructionalSlides.length} שקפי תוכן</span>{(preset !== "all" || selectedMarks.length || flags.length || chapter !== "all" || query) && <button type="button" onClick={resetFilters}>ניקוי סינון</button>}</div>
      </div>
      <div className={styles.tableWrap}><div className={styles.tableHead}><span>שקף</span><span>סימון המרצה</span><span>זמן · בפועל / מתוכנן</span><span>חזרו אחרי השיעור</span></div>{!filteredSlides.length ? <div className={styles.empty}>אין שקפים שמתאימים לסינון. נסו להסיר אחד מהמסננים.</div> : sort === "order" ? groupedSlides.map((group) => <section key={group.id}><div className={styles.groupHeading}><bdi dir="ltr">{group.id}</bdi><b>{group.title}</b><span>{group.slides.length} שקפים</span></div>{group.slides.map(renderRow)}</section>) : filteredSlides.map(renderRow)}</div>
      {saveError && <p className={styles.error} role="alert">{saveError}</p>}
    </section>
    <p className={styles.syncLine}>סונכרן מהתוסף · {date(syncedAt)} · {timedSlides.length} שקפים עם מדידת זמן אמינה</p>
  </>;

  const detailNode = detailOpen && selectedSlide ? <aside className={styles.detailPanel} aria-label="פרטי השקף הנבחר">
    <header className={styles.detailHeader}><div><small>שקף {String(selectedSlide.slideNumber).padStart(2, "0")} · {selectedSlide.chapter}</small><h2>{selectedSlide.title}</h2></div><button type="button" aria-label="סגירת פרטי שקף" onClick={() => setDetailOpen(false)}>×</button></header>
    <div className={styles.detailBody}><div className={styles.slideIdentity}><bdi dir="ltr">{String(selectedSlide.slideNumber).padStart(2, "0")}</bdi><div><b>{selectedSlide.eyebrow || selectedSlide.chapter}</b><span>{selectedSlide.section ? "שקף מעבר" : selectedSlide.mark ? MARK[selectedSlide.mark].label : "ללא סימון"}</span></div></div>
      <h3>הסימון שלך</h3><MarkPicker value={selectedSlide.mark} onChange={(mark) => void updateMark(selectedSlide.slideNumber, mark)} busy={savingSlide === selectedSlide.slideNumber} size="large" />
      <h3>זמן</h3><TimeBars actual={selectedSlide.actualActiveDurationMs > 0 ? selectedSlide.actualActiveDurationMs : null} planned={selectedSlide.plannedDurationMs} />
      {deckVersionMatched && selectedSlide.anonymousReturned > 0 && <p className={styles.returnNote}><bdi dir="ltr">{selectedSlide.anonymousReturned}</bdi> דפדפנים אנונימיים חזרו לשקף בחלון שאחרי השיעור.</p>}
      <p className={styles.detailCaveat}>צפייה חוזרת אינה מעידה בפני עצמה על קושי או על הבנה.</p>
      <a className={styles.openLesson} href={`/lecturer/lessons/${session.lessonId}/slides`}>פתיחת מערך השיעור ↗</a>
    </div>
  </aside> : null;

  return <div className={styles.app} dir="rtl">
    {navOpen && <aside className={styles.nav}><Link className={styles.logo} href="/lecturer/sessions"><span>∞</span><b>Syllo</b><small>מרצה</small></Link><div className={styles.courseCard}><span className={styles.courseBadge}>מת</span><div><b>מערכות תקשורת</b><small>{session.courseId}</small></div></div><nav className={styles.navLinks} aria-label="ניווט מרצה"><Link className={styles.navActive} href="/lecturer/sessions">מפגשי הוראה</Link><Link href="/lecturer/sessions#lessons">מערכי שיעור</Link><Link href={`/course/${session.courseId}/formulas`}>נוסחאון</Link><Link href={`/course/${session.courseId}/concepts`}>מפת מושגים</Link><Link href={`/lecturer/lessons/${session.lessonId}/slides`}>מערך השיעור</Link></nav><div className={styles.navFooter}><span className={styles.avatar}>מ</span><span><b>סביבת מרצה</b><small>נתוני הוראה אישיים</small></span><Link href="/api/auth/logout" aria-label="יציאה מהמערכת">↪</Link></div></aside>}
    <main className={styles.main}>
      <header className={styles.topbar}><button type="button" onClick={() => setNavOpen(!navOpen)} aria-label="הצגת או הסתרת ניווט" aria-pressed={navOpen}>☰</button><div className={styles.breadcrumbs}><Link href="/lecturer/sessions">מפגשי הוראה</Link><span>›</span><b>שיעור {session.lessonId.replace("lesson-", "")} · {session.lessonId === "lesson-04" ? "אפנון תנופה AM" : session.lessonId}</b></div><button type="button" onClick={() => setDetailOpen(!detailOpen)} aria-label="הצגת או הסתרת פרטי שקף" aria-pressed={detailOpen}>▣</button></header>
      <div className={styles.page}><header className={styles.pageHeader}><div><p className={styles.eyebrow}>שיעור {session.lessonId.replace("lesson-", "")} · מפגש הוראה</p><h1>{session.lessonId === "lesson-04" ? "אפנון תנופה AM ומשדר" : session.lessonId}</h1><div className={styles.sessionMeta}><span>{date(session.startedAt)}</span><span className={styles.statusPill}>{session.endedAt ? "השיעור הסתיים" : "המפגש עדיין פתוח"}</span><span>סונכרן · {date(syncedAt)}</span></div></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" className={styles.secondaryButton} onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.(); }}>{fullScreen ? "יציאה ממסך מלא" : "מסך מלא"}</button><button type="button" className={styles.secondaryButton} onClick={exportJson}>ייצוא סיכום</button></div></header>
        <div className={styles.tabs} role="tablist" aria-label="תוכן סיכום המפגש"><button type="button" role="tab" aria-selected={tab === "slides"} className={tab === "slides" ? styles.tabActive : ""} onClick={() => setTab("slides")}>לפי שקף</button><button type="button" role="tab" aria-selected={tab === "reflection"} className={tab === "reflection" ? styles.tabActive : ""} onClick={() => setTab("reflection")}>רפלקציה שלי</button></div>
        {mainBody}
      </div>
    </main>
    {detailNode}
  </div>;
}
