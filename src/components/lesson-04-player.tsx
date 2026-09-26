"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { concepts, formulas } from "../lib/course-data";
import { L4_CHAPTERS, L4_LINKS, L4_SLIDES, Slide, Tex } from "./lesson-04-deck";
import styles from "./lesson-04-player.module.css";

const courseId = "communication-systems";
const lessonId = "lesson-04";
const formulaAliases: Record<string, string> = {
  f1: "lambda", f3: "monopole", f7: "barkhausen_steady", f8: "am_time_domain",
  f9: "am_mod_index", f10: "am_bandwidth", f11: "am_power_total",
  f12: "am_spectrum_components", f13: "am_power_carrier", f14: "am_efficiency", f15: "am_envelope",
};
const conceptAliases: Record<string, string> = {
  c2: "modulation-need", c3: "modulation-need", c5: "spectrum-am", c7: "carrier-wave",
  c8: "carrier-wave", c9: "modulation-need", c10: "modulation-am",
  c11: "power-efficiency-am", c12: "envelope-ma",
};
const pad2 = (value: number) => String(value).padStart(2, "0");
const extensionSlideCatalog = JSON.stringify(L4_SLIDES.map((item) => ({ slideId: `lesson-04-am-${pad2(item.n)}`, slideNumber: item.n, minutes: item.min, title: item.h, chapter: L4_CHAPTERS.find((chapter) => chapter.id === item.ch)?.title ?? "", section: item.sec })));
const feedbackTypes = [
  { key: "unclear", label: "לא הבנתי", hint: "משהו בשקף לא ברור", color: "#D9731F", soft: "#FDF3EA" },
  { key: "example", label: "צריך עוד דוגמה", hint: "הבנתי חלקית, עוד דוגמה תעזור", color: "#137A86", soft: "#E8F4F5" },
  { key: "question", label: "יש לי שאלה", hint: "אכתוב אותה למטה", color: "#3B5BA9", soft: "#ECF0FA" },
  { key: "mistake", label: "נראה שיש טעות", hint: "בנוסחה, במספר או בטקסט", color: "#C0392B", soft: "#FCEDEB" },
] as const;
type FeedbackType = (typeof feedbackTypes)[number]["key"];
type SlideFeedbackValue = { t: FeedbackType; text: string; ts: number };
type FeedbackMap = Record<number, SlideFeedbackValue>;
const feedbackType = (key: FeedbackType) => feedbackTypes.find((item) => item.key === key)!;

function useLessonState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch { /* Player state is optional when browser storage is unavailable. */ }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Keep the player interactive when browser storage is unavailable. */ }
  }, [key, ready, value]);
  return [value, setValue] as const;
}

function Chevron({ back = false }: { back?: boolean }) {
  return <svg className={back ? styles.previousIcon : undefined} viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>;
}

function ScaledSlide({ slide, className }: { slide: (typeof L4_SLIDES)[number]; className: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) setScale(Math.min(rect.width / 1600, rect.height / 900));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={className}>
    <div className={styles.stageBox} style={{ width: 1600 * scale, height: 900 * scale }}>
      <div className={styles.slideCanvas} data-current-slide="true" data-slide-id={`lesson-04-am-${pad2(slide.n)}`} data-slide-id-source="authored" data-slide-number={slide.n} data-minutes={slide.min} style={{ transform: "scale(" + scale + ")" }}><Slide s={slide} key={slide.n} /></div>
    </div>
  </div>;
}

function FeedbackIcon({ type, size = 20 }: { type: FeedbackType | "syllo"; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    unclear: <><circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></>,
    example: <><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></>,
    question: <><path d="m4 20 1.2-4.2L15.6 5.4a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z"/><path d="m13.8 7.2 3 3"/></>,
    mistake: <><path d="m12 3.5 9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/></>,
    syllo: <path d="M7 8a4 4 0 1 0 0 8c3.2 0 6.8-8 10-8a4 4 0 1 1 0 8c-3.2 0-6.8-8-10-8z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function Outline({ index, go, feedback, seen, onClose }: { index: number; go: (index: number) => void; feedback: FeedbackMap; seen: number[]; onClose: () => void }) {
  const current = L4_SLIDES[index];
  const [open, setOpen] = useState<Record<number, boolean>>({ [current.ch]: true });
  useEffect(() => setOpen((value) => ({ ...value, [current.ch]: true })), [current.ch]);
  return <aside className={styles.outline} aria-label="מבנה השיעור">
    <header className={styles.outlineHeader}>
      <Link href={"/course/" + courseId + "/lessons"} className={styles.backLink}><Chevron back />מערכות תקשורת</Link>
      <span className={styles.eyebrow}>שיעור 04 · 11.9004</span><h2>אפנון תנופה AM ומשדר</h2>
      <button type="button" className={styles.closePanel} onClick={onClose}>סגירה</button>
    </header>
    <nav className={styles.outlineScroll} aria-label="פרקי השיעור">
      {L4_CHAPTERS.map((chapter) => {
        const items = L4_SLIDES.filter((slide) => slide.ch === chapter.id && !slide.sec);
        const count = items.filter((slide) => seen.includes(slide.n)).length;
        const marked = items.filter((slide) => feedback[slide.n]).length;
        return <section className={styles.chapter} key={chapter.id}>
          <button type="button" className={[styles.chapterButton, current.ch === chapter.id ? styles.chapterActive : ""].join(" ")} aria-expanded={Boolean(open[chapter.id])} onClick={() => setOpen((value) => ({ ...value, [chapter.id]: !value[chapter.id] }))}>
            <span className={styles.chapterNumber} dir="ltr">{chapter.id > 0 && chapter.id < 6 ? pad2(chapter.id) : "·"}</span><span className={styles.chapterTitle}>{chapter.title}</span>
            {marked > 0 && <span className={styles.flagCount} style={{ "--feedback-count": feedbackType("unclear").color, "--feedback-count-soft": feedbackType("unclear").soft } as React.CSSProperties}>{marked}</span>}
            <span className={styles.progressRing} style={{ "--progress": items.length ? count / items.length : 0 } as React.CSSProperties} aria-label={count + " מתוך " + items.length + " שקפים נצפו"} />
          </button>
          {open[chapter.id] && <div className={styles.chapterSlides}>{items.map((slide) => <button type="button" key={slide.n} className={[styles.slideLink, current.n === slide.n ? styles.slideActive : "", seen.includes(slide.n) ? styles.slideSeen : ""].join(" ")} onClick={() => go(slide.n - 1)} aria-current={slide.n === current.n ? "step" : undefined}>
            <span className={styles.slideNumber} dir="ltr">{pad2(slide.n)}</span><span className={styles.slideTitle}>{slide.h}</span>
            {feedback[slide.n] && <span className={styles.feedbackMarker} style={{ color: feedbackType(feedback[slide.n].t).color }} title={feedbackType(feedback[slide.n].t).label}><FeedbackIcon type={feedback[slide.n].t} size={13} /></span>}
            {[5, 22, 27].includes(slide.n) && <span className={styles.interactiveMark} title="שקף אינטראקטיבי">◆</span>}
          </button>)}</div>}
        </section>;
      })}
    </nav>
  </aside>;
}

function FeedbackPopover({ slide, feedback, open, setOpen, onSave, onDelete, busy, error, dark = false }: { slide: (typeof L4_SLIDES)[number]; feedback: FeedbackMap; open: boolean; setOpen: (value: boolean) => void; onSave: (value: SlideFeedbackValue) => Promise<boolean>; onDelete: () => Promise<void>; busy: boolean; error: string; dark?: boolean }) {
  const current = feedback[slide.n];
  const [pick, setPick] = useState<FeedbackType | null>(current?.t ?? null);
  const [text, setText] = useState(current?.text ?? "");
  const [editing, setEditing] = useState(!current);
  const textArea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setPick(current?.t ?? null); setText(current?.text ?? ""); setEditing(!current); }, [slide.n, current]);
  useEffect(() => { if (open && pick === "question") textArea.current?.focus(); }, [open, pick]);
  const send = async () => { if (!pick || (pick === "question" && !text.trim())) return; if (await onSave({ t: pick, text: text.trim(), ts: Date.now() })) { setEditing(false); setOpen(false); } };
  const type = current ? feedbackType(current.t) : undefined;
  return <div className={[styles.feedback, dark ? styles.feedbackDark : ""].join(" ")} style={{ "--feedback-error": feedbackType("mistake").color } as React.CSSProperties}>
    {open && <section className={styles.feedbackPopover} role="dialog" aria-label="משוב על השקף" aria-modal="false">
      <header className={styles.feedbackHeader}><div><b>משוב על השקף</b><span><i dir="ltr">{pad2(slide.n)}</i> · {slide.h}</span></div><button type="button" onClick={() => setOpen(false)} aria-label="סגירת משוב">×</button></header>
      {current && !editing ? <div className={styles.feedbackSent}><div className={styles.feedbackSentCard} style={{ "--feedback-color": type!.color, "--feedback-soft": type!.soft } as React.CSSProperties}><span><FeedbackIcon type={type!.key} size={18} /></span><div><b>{type!.label}</b>{current.text && <p>“{current.text}”</p>}<small>נשלח · אנונימי למרצה</small></div></div>{error && <p className={styles.feedbackError} role="alert">{error}</p>}<div className={styles.feedbackActions}><button type="button" onClick={() => setEditing(true)}>עריכה</button><button type="button" disabled={busy} onClick={() => void onDelete()}>{busy ? "מבטל…" : "ביטול המשוב"}</button></div></div> : <div className={styles.feedbackBody}>
        <b>מה תרצו לשתף?</b><div className={styles.feedbackOptions}>{feedbackTypes.map((item) => <button type="button" key={item.key} aria-pressed={pick === item.key} className={pick === item.key ? styles.feedbackOptionSelected : ""} style={{ "--feedback-color": item.color, "--feedback-soft": item.soft } as React.CSSProperties} onClick={() => setPick(item.key)}><span><FeedbackIcon type={item.key} size={18} /></span><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}</div>
        <textarea ref={textArea} rows={3} maxLength={800} value={text} onChange={(event) => setText(event.target.value)} placeholder={pick === "question" ? "מה השאלה?" : pick === "mistake" ? "איפה הטעות?" : "אפשר להוסיף כמה מילים (אופציונלי)"} />
        {error && <p className={styles.feedbackError} role="alert">{error}</p>}<footer><button type="button" disabled={!pick || (pick === "question" && !text.trim()) || busy} onClick={send}>{busy ? "שולח…" : current ? "עדכון" : "שליחה"}</button><small>נשמר לשקף הזה · אנונימי למרצה</small></footer>
      </div>}
    </section>}
    <button type="button" className={[styles.feedbackFab, current ? styles.feedbackFabSet : "", open ? styles.feedbackFabOpen : ""].join(" ")} style={type ? { background: type.color } : undefined} onClick={() => setOpen(!open)} aria-label={open ? "סגירת חלונית המשוב" : type ? `עריכת משוב: ${type.label}` : "משוב על השקף (F)"} aria-expanded={open}>{open ? "×" : <FeedbackIcon type={current?.t ?? "syllo"} size={current ? 24 : 27} />}</button>
    {!open && type && <span className={styles.feedbackTag} style={{ color: type.color }}>{type.label}</span>}
  </div>;
}

function SlideContext({ slide, feedback, openFeedback, notes, setNotes, onClose }: { slide: (typeof L4_SLIDES)[number]; feedback: FeedbackMap; openFeedback: () => void; notes: Record<number, string>; setNotes: (value: Record<number, string>) => void; onClose: () => void }) {
  const links = (L4_LINKS as Record<number, { f?: string[]; c?: string[] }>)[slide.n] ?? {};
  const formulaIds = (links.f ?? []).map((id: string) => formulaAliases[id]).filter(Boolean);
  const conceptIds = (links.c ?? []).map((id: string) => conceptAliases[id]).filter(Boolean);
  const slideFormulas = formulas.filter((item) => formulaIds.includes(item.formulaId));
  const slideConcepts = concepts.filter((item) => conceptIds.includes(item.conceptId));
  const currentFeedback = feedback[slide.n];
  const currentFeedbackType = currentFeedback ? feedbackType(currentFeedback.t) : undefined;
  return <aside className={styles.slideContext} aria-label="מידע והערות לשקף">
    <header className={styles.contextHeader}><span>בשקף הזה</span><b dir="ltr">{pad2(slide.n)}</b><button type="button" className={styles.closePanel} onClick={onClose}>סגירה</button></header>
    <div className={styles.contextBody}>
      <button type="button" className={[styles.flagButton, currentFeedback ? styles.flagged : ""].join(" ")} style={currentFeedbackType ? { "--feedback-color": currentFeedbackType.color, "--feedback-soft": currentFeedbackType.soft } as React.CSSProperties : undefined} onClick={openFeedback}>
        <span className={styles.flagIcon}><FeedbackIcon type={currentFeedback?.t ?? "syllo"} size={18} /></span><span><b>{currentFeedbackType?.label ?? "משוב על השקף"}</b><small>{currentFeedback?.text ? `“${currentFeedback.text}”` : currentFeedback ? "נשלח · לחצו לעריכה" : "לא הבנתי, דוגמה, שאלה או טעות"}</small></span>
      </button>
      {slide.tk && <div className={styles.takeaway}><small>העיקר</small>{slide.tk}</div>}
      {slideFormulas.length > 0 && <section className={styles.contextSection}><h3>נוסחאות <span dir="ltr">{slideFormulas.length}</span></h3>
        {slideFormulas.map((item) => <article className={styles.formulaCard} key={item.formulaId}><b>{item.name}</b><div dir="ltr"><Tex tex={item.expression} /></div></article>)}
        <Link href={"/course/" + courseId + "/formulas"} className={styles.contextMore}>לנוסחאון המלא ←</Link>
      </section>}
      {slideConcepts.length > 0 && <section className={styles.contextSection}><h3>מושגים <span dir="ltr">{slideConcepts.length}</span></h3>
        {slideConcepts.map((item) => <article className={styles.conceptCard} key={item.conceptId}><b>{item.name}</b></article>)}
        <Link href={"/course/" + courseId + "/concepts"} className={styles.contextMore}>למפת המושגים ←</Link>
      </section>}
      <label className={styles.noteLabel}><span>הערה שלי</span><textarea value={notes[slide.n] ?? ""} maxLength={2000} placeholder="הערה אישית לשקף הזה…" onChange={(event) => setNotes({ ...notes, [slide.n]: event.target.value })} /></label>
      <p className={styles.localNote}>הערות והתקדמות נשמרות בדפדפן הזה בלבד.</p>
    </div>
  </aside>;
}

function ChapterBar({ index, go, feedback }: { index: number; go: (index: number) => void; feedback: FeedbackMap }) {
  return <nav className={styles.chapterBar} aria-label="התקדמות בין פרקי השיעור">{L4_CHAPTERS.map((chapter, i) => {
    const start = chapter.start - 1;
    const end = L4_CHAPTERS[i + 1] ? L4_CHAPTERS[i + 1].start - 1 : L4_SLIDES.length;
    const count = end - start;
    const progress = Math.max(0, Math.min(1, (index + 1 - start) / count));
    return <button type="button" key={chapter.id} className={[styles.chapterSegment, index >= start && index < end ? styles.segmentActive : ""].join(" ")} style={{ flex: count }} onClick={() => go(start)} title={chapter.title} aria-label={"מעבר לפרק: " + chapter.title}>
      <i style={{ width: (progress * 100) + "%" }} />
      {L4_SLIDES.slice(start, end).map((slide, slideIndex) => feedback[slide.n] ? <em key={slide.n} style={{ insetInlineStart: ((slideIndex + 0.5) / count * 100) + "%", background: feedbackType(feedback[slide.n].t).color }} /> : null)}
    </button>;
  })}</nav>;
}

export default function Lesson04Player() {
  const stateKey = "syllo:student:lesson:" + lessonId;
  const [index, setIndex] = useLessonState(stateKey + ":index", 0);
  const [flags, setFlags] = useLessonState<number[]>(stateKey + ":flags", []);
  const [seen, setSeen] = useLessonState<number[]>(stateKey + ":seen", []);
  const [notes, setNotes] = useLessonState<Record<number, string>>(stateKey + ":notes", {});
  const [feedback, setFeedback] = useLessonState<FeedbackMap>(stateKey + ":feedback", {});
  const [outlineOpen, setOutlineOpen] = useLessonState(stateKey + ":outline", true);
  const [contextOpen, setContextOpen] = useLessonState(stateKey + ":context", true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [compact, setCompact] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const wasCompact = useRef(false);
  const [present, setPresent] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const slide = L4_SLIDES[index];
  const chapter = L4_CHAPTERS.find((item) => item.id === slide.ch)!;
  const minutesRemaining = useMemo(() => L4_SLIDES.slice(index).reduce((sum, item) => sum + item.min, 0), [index]);
  const go = useCallback((next: number) => setIndex(Math.max(0, Math.min(L4_SLIDES.length - 1, next))), [setIndex]);
  useEffect(() => { setSeen((value) => value.includes(slide.n) ? value : [...value, slide.n]); }, [setSeen, slide.n]);
  useEffect(() => {
    const handleLecturerNavigation = (event: Event) => {
      const slideNumber = (event as CustomEvent<number>).detail;
      if (Number.isInteger(slideNumber)) go(slideNumber - 1);
    };
    window.addEventListener("syllo:lecturer-goto-slide", handleLecturerNavigation);
    return () => window.removeEventListener("syllo:lecturer-goto-slide", handleLecturerNavigation);
  }, [go]);
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const nextCompact = entry.contentRect.width <= 1100;
      setCompact(nextCompact);
      if (nextCompact && !wasCompact.current) {
        setOutlineOpen(false);
        setContextOpen(false);
      }
      wasCompact.current = nextCompact;
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, [opened]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      if (event.key === " " && target.closest("button")) return;
      if (["ArrowLeft", "PageDown", " "].includes(event.key)) { event.preventDefault(); go(index + 1); }
      else if (["ArrowRight", "PageUp"].includes(event.key)) { event.preventDefault(); go(index - 1); }
      else if (event.key === "Escape") { if (feedbackOpen) setFeedbackOpen(false); else { setPresent(false); setShowSpeakerNotes(false); } }
      else if (event.key.toLowerCase() === "p") setPresent((value) => !value);
      else if (event.key.toLowerCase() === "n") setShowSpeakerNotes((value) => !value);
      else if (event.key.toLowerCase() === "f") setFeedbackOpen((value) => !value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedbackOpen, go, index]);

  const saveFeedback = async (value: SlideFeedbackValue): Promise<boolean> => {
    setFeedbackError("");
    setFeedbackBusy(true);
    try {
      const clientKey = "syllo:anonymous-client-id";
      let anonymousClientId = window.localStorage.getItem(clientKey);
      if (!anonymousClientId) { anonymousClientId = window.crypto.randomUUID(); window.localStorage.setItem(clientKey, anonymousClientId); }
      const apiTypes: Record<FeedbackType, string> = { unclear: "NOT_UNDERSTOOD", example: "NEED_EXAMPLE", question: "QUESTION", mistake: "POSSIBLE_ERROR" };
      const response = await fetch("/api/student/slide-feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anonymousClientId, courseId, lessonId, slideId: `lesson-04-am-${pad2(slide.n)}`, slideNumber: slide.n, deckVersion: "lesson-04-am-v1", feedbackType: apiTypes[value.t], optionalComment: value.text, submittedAt: new Date(value.ts).toISOString(), pageUrl: window.location.href, idempotencyKey: `${courseId}:${lessonId}:slide-${pad2(slide.n)}` }) });
      if (!response.ok) throw new Error("לא הצלחנו לשמור את המשוב. נסו שוב.");
      setFeedback((previous) => ({ ...previous, [slide.n]: value }));
      setFlags((previous) => value.t === "unclear" ? previous.includes(slide.n) ? previous : [...previous, slide.n] : previous.filter((n) => n !== slide.n));
      setFeedbackOpen(false);
      return true;
    } catch (error) { setFeedbackError(error instanceof Error ? error.message : "לא הצלחנו לשמור את המשוב. נסו שוב."); return false; }
    finally { setFeedbackBusy(false); }
  };
  const deleteFeedback = async () => {
    setFeedbackBusy(true);
    setFeedbackError("");
    try {
      const clientId = window.localStorage.getItem("syllo:anonymous-client-id");
      if (clientId) {
        const response = await fetch("/api/student/slide-feedback", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anonymousClientId: clientId, courseId, lessonId, slideId: `lesson-04-am-${pad2(slide.n)}` }) });
        if (!response.ok) throw new Error("לא הצלחנו לבטל את המשוב. נסו שוב.");
      }
      setFeedback((previous) => { const next = { ...previous }; delete next[slide.n]; return next; });
      setFlags((previous) => previous.filter((n) => n !== slide.n));
    } catch (error) { setFeedbackError(error instanceof Error ? error.message : "לא הצלחנו לבטל את המשוב. נסו שוב."); }
    finally { setFeedbackBusy(false); }
  };

  useEffect(() => { setFeedbackError(""); }, [slide.n]);

  if (!opened) return <section className={styles.preview} aria-label="תצוגה מקדימה של מערך השיעור" data-lesson-player="true" data-course-id={courseId} data-lesson-id={lessonId} data-deck-version="lesson-04-am-v1" data-slides={extensionSlideCatalog}>
    <div className={styles.previewStage}><ScaledSlide slide={slide} className={styles.stage} /></div>
    <footer className={styles.previewFooter}><div><strong>מערך שיעור 04 · אפנון תנופה AM ומשדר</strong><span>{L4_SLIDES.length} שקפים · כ־{L4_SLIDES.reduce((sum, item) => sum + item.min, 0)} דקות</span></div><button type="button" className={styles.openLessonButton} onClick={() => setOpened(true)}>פתיחת מערך השיעור <span aria-hidden="true">←</span></button></footer>
  </section>;

  if (present) return <div className={[styles.present, "l4-player", "syllo-student-app"].join(" ")} data-lesson-player="true" data-course-id={courseId} data-lesson-id={lessonId} data-deck-version="lesson-04-am-v1" data-slides={extensionSlideCatalog} role="dialog" aria-label="הצגת שקף">
    <ScaledSlide slide={slide} className={styles.presentStage} />
    <FeedbackPopover slide={slide} feedback={feedback} open={feedbackOpen} setOpen={setFeedbackOpen} onSave={saveFeedback} onDelete={deleteFeedback} busy={feedbackBusy} error={feedbackError} dark />
    {showSpeakerNotes && slide.notes && <aside className={styles.speakerNotes}><b>הערות מרצה</b><p>{slide.notes}</p></aside>}
    <div className={styles.presentControls}>
      <button type="button" onClick={() => go(index - 1)}>הקודם</button><span dir="ltr">{pad2(slide.n)} / {L4_SLIDES.length}</span>
      <button type="button" onClick={() => go(index + 1)}>הבא</button><button type="button" aria-pressed={showSpeakerNotes} onClick={() => setShowSpeakerNotes((value) => !value)}>הערות מרצה · N</button>
      <button type="button" onClick={() => setPresent(false)}>יציאה · Esc</button>
    </div>
    <ChapterBar index={index} go={go} feedback={feedback} />
  </div>;

  return <div ref={playerRef} className={["l4-player", "syllo-student-app", styles.player, outlineOpen ? styles.withOutline : "", contextOpen ? styles.withContext : ""].join(" ")} data-lesson-player="true" data-course-id={courseId} data-lesson-id={lessonId} data-deck-version="lesson-04-am-v1" data-slides={extensionSlideCatalog}>
    {outlineOpen && <Outline index={index} go={go} feedback={feedback} seen={seen} onClose={() => setOutlineOpen(false)} />}
    <main className={styles.playerMain} aria-label="נגן שיעור 04">
      <header className={styles.playerToolbar}>
        <nav className={styles.loopPhases} aria-label="שלבי הלמידה">
          <Link aria-current="page" className={styles.phaseActive} href={`/course/${courseId}/lessons/${lessonId}/slides`}><span dir="ltr">01</span>בכיתה</Link>
          <Link href={`/course/${courseId}/lessons/${lessonId}/practice`}><span dir="ltr">02</span>אחרי השיעור</Link>
          <Link href={`/course/${courseId}/lessons/${lessonId}/summary`}><span dir="ltr">03</span>לקראת השיעור הבא</Link>
        </nav>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.toolbarButton} aria-pressed={outlineOpen} aria-label="מבנה השיעור" title="מבנה השיעור" onClick={() => { const next = !outlineOpen; setOutlineOpen(next); if (compact && next) setContextOpen(false); }}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg></button>
          <button type="button" className={styles.toolbarButton} aria-pressed={contextOpen} aria-label="הקשר לשקף" title="הקשר לשקף" onClick={() => { const next = !contextOpen; setContextOpen(next); if (compact && next) setOutlineOpen(false); }}><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="1.5"/><path d="M13 3v14"/></svg></button>
          <button type="button" className={styles.presentButton} onClick={() => setPresent(true)}>הצגה</button>
        </div>
      </header>
      <div className={styles.stageWrap}><ScaledSlide slide={slide} className={styles.stage} /><FeedbackPopover slide={slide} feedback={feedback} open={feedbackOpen} setOpen={setFeedbackOpen} onSave={saveFeedback} onDelete={deleteFeedback} busy={feedbackBusy} error={feedbackError} /></div>
      <footer className={styles.playerFooter}>
        <ChapterBar index={index} go={go} feedback={feedback} />
        <div className={styles.slideNav}>
          <button type="button" className={styles.navButton} aria-label="לשקף הקודם" onClick={() => go(index - 1)}><Chevron back /></button>
          <span className={styles.slideCount} dir="ltr">{pad2(slide.n)} / {L4_SLIDES.length}</span>
          <button type="button" className={styles.navButton} aria-label="לשקף הבא" onClick={() => go(index + 1)}><Chevron /></button>
          <span className={styles.chapterLabel}>{chapter.title}</span><span className={styles.timeLeft}>כ־{minutesRemaining} דק׳ לסיום</span>
          {index === L4_SLIDES.length - 1 && <Link className={styles.practiceLink} href={"/course/" + courseId + "/lessons/" + lessonId + "/practice"}>לתרגול האינטראקטיבי ←</Link>}
        </div>
      </footer>
    </main>
    {contextOpen && <SlideContext slide={slide} feedback={feedback} openFeedback={() => setFeedbackOpen(true)} notes={notes} setNotes={setNotes} onClose={() => setContextOpen(false)} />}
  </div>;
}
