"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { concepts } from "../lib/course-data";
import styles from "./lesson-05-player.module.css";
import playerStyles from "./lesson-04-player.module.css";
import publishedCatalog from "../decks/lesson-05/published-catalog.json";

type DeckSlide = { chapter: string; title: string; minutes: number; takeaway: string; notes: string[]; interactive: boolean; platformSlideId: string };
const chapters = [...new Set(publishedCatalog.map((slide) => slide.chapter))];
const bidiTokenPattern = /(\d+(?:[.,]\d+)?\s?(?:MHz|kHz|Hz|μs|ms|nF|pF|kΩ|Ω|mV|V|dB)|\b(?:TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF)\b)/g;
function bidiQuantities(text: string) {
  return text.split(bidiTokenPattern).map((part, index) => /^(?:\d+(?:[.,]\d+)?\s?(?:MHz|kHz|Hz|μs|ms|nF|pF|kΩ|Ω|mV|V|dB)|TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF)$/.test(part)
    ? <bdi key={index} dir="ltr">{part}</bdi>
    : part);
}
const feedbackTypes = [
  { key: "unclear", label: "לא הבנתי", hint: "משהו בשקף לא ברור", color: "#D9731F", soft: "#FDF3EA" },
  { key: "example", label: "צריך עוד דוגמה", hint: "הבנתי חלקית, עוד דוגמה תעזור", color: "#137A86", soft: "#E8F4F5" },
  { key: "question", label: "יש לי שאלה", hint: "אכתוב אותה למטה", color: "#3B5BA9", soft: "#ECF0FA" },
  { key: "mistake", label: "נראה שיש טעות", hint: "בנוסחה, במספר או בטקסט", color: "#C0392B", soft: "#FCEDEB" },
] as const;
function useLessonState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch { /* Continue when browser storage is unavailable. */ }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Keep the lesson interactive when browser storage is unavailable. */ }
  }, [key, ready, value]);
  return [value, setValue] as const;
}
function FeedbackIcon({ type, size = 20 }: { type: (typeof feedbackTypes)[number]["key"] | "syllo"; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    unclear: <><circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></>,
    example: <><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></>,
    question: <><path d="m4 20 1.2-4.2L15.6 5.4a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z"/><path d="m13.8 7.2 3 3"/></>,
    mistake: <><path d="m12 3.5 9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/></>,
    syllo: <path d="M7 8a4 4 0 1 0 0 8c3.2 0 6.8-8 10-8a4 4 0 1 1 0 8c-3.2 0-6.8-8-10-8z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}
// The catalog is generated from the published Genspark HTML so navigation,
// lecturer notes, student feedback, and analytics share the same slide identity.
const deckSlides: DeckSlide[] = publishedCatalog.map((entry) => ({
  chapter: entry.chapter,
  title: entry.title,
  minutes: entry.minutes,
  takeaway: entry.takeaway,
  notes: [entry.takeaway],
  interactive: entry.interactive,
  platformSlideId: entry.slideId,
}));
const deckVersion = "lesson-05-genspark-v3";
const extensionSlideCatalog = JSON.stringify(deckSlides.map((slide, index) => ({ slideId: slide.platformSlideId, slideNumber: index + 1, minutes: slide.minutes, title: slide.title, chapter: slide.chapter, section: false, interactive: Boolean(slide.interactive) })));
export { deckSlides as lesson05Slides };

function ScaledSlide({ slide, index, hostClass }: { slide: DeckSlide; index: number; hostClass: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.channel !== "syllo-lesson-05" || event.data?.type !== "slide-change") return;
      const nextIndex = Number(event.data.index);
      if (Number.isInteger(nextIndex) && nextIndex >= 0 && nextIndex < deckSlides.length) {
        window.dispatchEvent(new CustomEvent("syllo:lesson-05-slide-change", { detail: { index: nextIndex } }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ channel: "syllo-lesson-05", type: "navigate", index }, "*");
  }, [index]);
  return <div className={hostClass} data-current-slide="true" data-slide-id={slide.platformSlideId} data-slide-id-source="authored" data-slide-number={index + 1} data-minutes={slide.minutes}>
    <iframe ref={frame} title={`שקף ${index + 1}: ${slide.title}`} src="/courses/communication-systems/lesson-05/lesson.html" sandbox="allow-scripts" className={styles.gensparkFrame} onLoad={() => frame.current?.contentWindow?.postMessage({ channel: "syllo-lesson-05", type: "navigate", index }, "*")} />
  </div>;
}

export default function Lesson05Player({ lecturerMode = false }: { lecturerMode?: boolean }) {
  const stateKey = "syllo:student:lesson:lesson-05:genspark-v3";
  const [index, setIndex] = useLessonState(stateKey + ":index", 0);
  const [seen, setSeen] = useLessonState<number[]>(stateKey + ":seen", []);
  const [outlineOpen, setOutlineOpen] = useLessonState(stateKey + ":outline", true);
  const [notesOpen, setNotesOpen] = useLessonState(stateKey + ":context", false);
  const [opened, setOpened] = useState(false);
  const [present, setPresent] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<"unclear" | "example" | "question" | "mistake" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackEditing, setFeedbackEditing] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackBySlide, setFeedbackBySlide] = useState<Record<number, { t: "unclear" | "example" | "question" | "mistake"; text: string; ts: number }>>({});
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({ [chapters[0]]: true });
  const playerRef = useRef<HTMLDivElement>(null);
  const slide = deckSlides[index];
  const currentFeedback = feedbackBySlide[index + 1];
  useEffect(() => {
    try {
      const current = window.localStorage.getItem("syllo:student:lesson:lesson-05:genspark-v3:feedback");
      if (current) setFeedbackBySlide(JSON.parse(current) as typeof feedbackBySlide);
    } catch { /* Feedback remains usable when browser storage is unavailable. */ }
    setFeedbackReady(true);
  }, []);
  useEffect(() => {
    if (!feedbackReady) return;
    try { window.localStorage.setItem("syllo:student:lesson:lesson-05:genspark-v3:feedback", JSON.stringify(feedbackBySlide)); }
    catch { /* The panel still updates for this visit if storage is disabled. */ }
  }, [feedbackBySlide, feedbackReady]);
  const notifyLecturer = (eventName: "open" | "exit") => window.dispatchEvent(new CustomEvent(eventName === "open" ? "syllo:lesson-player-open" : "syllo:lesson-player-exit"));
  const enterPresentation = () => {
    setPresent(true);
    if (document.fullscreenEnabled && !document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => {});
  };
  const exitPresentation = () => {
    setPresent(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };
  useEffect(() => {
    setSeen((value) => value.includes(index + 1) ? value : [...value, index + 1]);
    setOpenChapters((value) => ({ ...value, [slide.chapter]: true }));
  }, [index, setSeen, slide.chapter]);
  useEffect(() => {
    setFeedbackError("");
    setFeedbackEditing(false);
    setFeedbackChoice(currentFeedback?.t ?? null);
    setFeedbackComment(currentFeedback?.text ?? "");
  }, [index, feedbackReady, currentFeedback?.t, currentFeedback?.text]);
  const visibleConceptIds = index < 4
    ? ["carrier-wave", "modulation-am", "spectrum-am", "receiver", "radio-frequency"]
    : index < 10
      ? ["receiver", "radio-frequency", "trf-receiver", "filters"]
      : index < 34
        ? ["receiver", "radio-frequency", "mixer", "local-oscillator", "intermediate-frequency", "image-frequency", "filters"]
        : ["receiver", "intermediate-frequency", "envelope-detector", "agc"];
  const previewSlide = deckSlides[0];
  const go = (next: number) => setIndex(Math.max(0, Math.min(deckSlides.length - 1, next)));
  useEffect(() => {
    const onDeckSlide = (event: Event) => go((event as CustomEvent<{ index: number }>).detail.index);
    window.addEventListener("syllo:lesson-05-slide-change", onDeckSlide);
    return () => window.removeEventListener("syllo:lesson-05-slide-change", onDeckSlide);
  }, []);
  const studentTelemetry = useRef({ sessionId: "", anonymousClientId: "", slideIndex: 0, slideStartedAt: 0, started: false });
  useEffect(() => {
    if (lecturerMode) return;
    const state = studentTelemetry.current;
    const send = (eventType: "lesson_started" | "slide_viewed" | "lesson_ended", slideIndex: number | null = null, activeDurationMs: number | null = null) => {
      if (!state.sessionId || !state.anonymousClientId) return;
      const slideForEvent = slideIndex === null ? null : deckSlides[slideIndex];
      void fetch("/api/learning-events", {
        method: "POST", keepalive: true, headers: { "content-type": "application/json" },
        body: JSON.stringify({
          anonymous_client_id: state.anonymousClientId, session_id: state.sessionId,
          course_id: "communication-systems", lesson_id: "lesson-05", deck_version: deckVersion,
          event_type: eventType, slide_id: slideForEvent?.platformSlideId ?? null,
          slide_number: slideForEvent ? slideIndex! + 1 : null, active_duration_ms: activeDurationMs,
          occurred_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    };
    if (!opened) {
      if (state.started) {
        send("slide_viewed", state.slideIndex, Math.max(0, Math.min(3_600_000, Date.now() - state.slideStartedAt)));
        send("lesson_ended");
        state.started = false;
      }
      return;
    }
    if (!state.started) {
      const clientKey = "syllo:anonymous-client-id";
      let clientId = window.localStorage.getItem(clientKey);
      if (!clientId) { clientId = window.crypto.randomUUID(); window.localStorage.setItem(clientKey, clientId); }
      state.anonymousClientId = clientId;
      state.sessionId = window.crypto.randomUUID();
      state.slideIndex = index;
      state.slideStartedAt = Date.now();
      state.started = true;
      send("lesson_started");
    } else if (state.slideIndex !== index) {
      send("slide_viewed", state.slideIndex, Math.max(0, Math.min(3_600_000, Date.now() - state.slideStartedAt)));
      state.slideIndex = index;
      state.slideStartedAt = Date.now();
    }
  }, [opened, index, lecturerMode]);
  const sendFeedback = async () => {
    if (!feedbackChoice || feedbackBusy) return;
    setFeedbackBusy(true);
    setFeedbackError("");
    try {
      const idKey = "syllo:anonymous-client-id";
      let anonymousClientId = window.localStorage.getItem(idKey);
      if (!anonymousClientId) {
        anonymousClientId = window.crypto.randomUUID();
        window.localStorage.setItem(idKey, anonymousClientId);
      }
      const stableSlideId = slide.platformSlideId!;
      const suffix = stableSlideId.replace("lesson-05-genspark-", "");
      const response = await fetch("/api/student/slide-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          anonymousClientId,
          courseId: "communication-systems",
          lessonId: "lesson-05",
          slideId: stableSlideId,
          slideNumber: index + 1,
          deckVersion,
          feedbackType: { unclear: "NOT_UNDERSTOOD", example: "NEED_EXAMPLE", question: "QUESTION", mistake: "POSSIBLE_ERROR" }[feedbackChoice],
          optionalComment: feedbackComment.trim(),
          submittedAt: new Date().toISOString(),
          pageUrl: window.location.href,
          idempotencyKey: `communication-systems:lesson-05:genspark-v3:slide-${suffix}`,
        }),
      });
      if (!response.ok) throw new Error("שליחת המשוב נכשלה. נסו שוב.");
      const savedFeedback = { t: feedbackChoice, text: feedbackComment.trim(), ts: Date.now() };
      const nextFeedback = { ...feedbackBySlide, [index + 1]: savedFeedback };
      setFeedbackBySlide(nextFeedback);
      window.dispatchEvent(new CustomEvent("syllo:lesson-feedback-update", { detail: { lessonId: "lesson-05", feedback: nextFeedback } }));
      setFeedbackEditing(false);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "שליחת המשוב נכשלה. נסו שוב.");
    } finally {
      setFeedbackBusy(false);
    }
  };
  const deleteFeedback = async () => {
    setFeedbackBusy(true);
    setFeedbackError("");
    try {
      const anonymousClientId = window.localStorage.getItem("syllo:anonymous-client-id");
      if (anonymousClientId) {
        const stableSlideId = slide.platformSlideId!;
        const response = await fetch("/api/student/slide-feedback", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ anonymousClientId, courseId: "communication-systems", lessonId: "lesson-05", slideId: stableSlideId }),
        });
        if (!response.ok) throw new Error("ביטול המשוב נכשל. נסו שוב.");
      }
      const nextFeedback = { ...feedbackBySlide };
      delete nextFeedback[index + 1];
      setFeedbackBySlide(nextFeedback);
      window.dispatchEvent(new CustomEvent("syllo:lesson-feedback-update", { detail: { lessonId: "lesson-05", feedback: nextFeedback } }));
      setFeedbackEditing(false);
      setFeedbackChoice(null);
      setFeedbackComment("");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "ביטול המשוב נכשל. נסו שוב.");
    } finally {
      setFeedbackBusy(false);
    }
  };
  const selectedFeedbackType = feedbackTypes.find((item) => item.key === (currentFeedback?.t ?? feedbackChoice));
  const studentFeedback = <div className={`${playerStyles.feedback} ${present ? playerStyles.feedbackDark : ""}`}>
    {feedbackOpen && <section className={playerStyles.feedbackPopover} role="dialog" aria-label="משוב על השקף" aria-modal="false">
      <header className={playerStyles.feedbackHeader}><div><b>משוב על השקף</b><span><i dir="ltr">{String(index + 1).padStart(2, "0")}</i> · {slide.title}</span></div><button type="button" aria-label="סגירת משוב" onClick={() => setFeedbackOpen(false)}>×</button></header>
      {currentFeedback && !feedbackEditing ? <div className={playerStyles.feedbackSent}><div className={playerStyles.feedbackSentCard} style={{ "--feedback-color": selectedFeedbackType?.color, "--feedback-soft": selectedFeedbackType?.soft } as React.CSSProperties}><span><FeedbackIcon type={currentFeedback.t} size={18}/></span><div><b>{selectedFeedbackType?.label}</b>{currentFeedback.text && <p>“{currentFeedback.text}”</p>}<small>נשלח · אנונימי למרצה</small></div></div>{feedbackError && <p className={playerStyles.feedbackError} role="alert">{feedbackError}</p>}<div className={playerStyles.feedbackActions}><button type="button" onClick={() => setFeedbackOpen(false)}>סגירה</button><button type="button" onClick={() => { setFeedbackChoice(currentFeedback.t); setFeedbackComment(currentFeedback.text); setFeedbackEditing(true); }}>עריכה</button><button type="button" disabled={feedbackBusy} onClick={() => void deleteFeedback()}>{feedbackBusy ? "מבטל…" : "ביטול המשוב"}</button></div></div> : <div className={playerStyles.feedbackBody}><b>מה תרצו לשתף?</b><div className={playerStyles.feedbackOptions}>{feedbackTypes.map((item) => <button type="button" key={item.key} aria-pressed={feedbackChoice === item.key} className={feedbackChoice === item.key ? playerStyles.feedbackOptionSelected : ""} style={{ "--feedback-color": item.color, "--feedback-soft": item.soft } as React.CSSProperties} onClick={() => setFeedbackChoice(item.key)}><span><FeedbackIcon type={item.key} size={18}/></span><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}</div><textarea rows={3} maxLength={800} value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder={feedbackChoice === "question" ? "מה השאלה?" : feedbackChoice === "mistake" ? "איפה הטעות?" : "אפשר להוסיף כמה מילים (אופציונלי)"} />{feedbackError && <p className={playerStyles.feedbackError} role="alert">{feedbackError}</p>}<footer><button type="button" disabled={!feedbackChoice || feedbackBusy || (feedbackChoice === "question" && !feedbackComment.trim())} onClick={() => void sendFeedback()}>{feedbackBusy ? "שולח…" : currentFeedback ? "עדכון" : "שליחה"}</button><small>נשמר לשקף הזה · אנונימי למרצה</small></footer></div>}
    </section>}
    <button type="button" className={`${playerStyles.feedbackFab} ${currentFeedback ? playerStyles.feedbackFabSet : ""} ${feedbackOpen ? playerStyles.feedbackFabOpen : ""}`} style={currentFeedback ? { background: selectedFeedbackType?.color } : undefined} aria-label={feedbackOpen ? "סגירת חלונית המשוב" : currentFeedback ? `עריכת משוב: ${selectedFeedbackType?.label}` : "משוב על השקף (F)"} title={currentFeedback ? `המשוב לשקף: ${selectedFeedbackType?.label}` : "משוב על השקף"} aria-expanded={feedbackOpen} onClick={() => setFeedbackOpen((value) => !value)}>{feedbackOpen ? "×" : <FeedbackIcon type={currentFeedback?.t ?? "syllo"} size={currentFeedback ? 24 : 27}/>}</button>
    {!feedbackOpen && currentFeedback && selectedFeedbackType && <span className={playerStyles.feedbackTag} style={{ color: selectedFeedbackType.color }}>{selectedFeedbackType.label}</span>}
  </div>;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === " " && target instanceof HTMLElement && target.closest("button")) return;
      if (["ArrowLeft", "PageDown", " "].includes(event.key)) { event.preventDefault(); go(index + 1); }
      if (["ArrowRight", "PageUp"].includes(event.key)) { event.preventDefault(); go(index - 1); }
      if (event.key === "Escape") { if (feedbackOpen) setFeedbackOpen(false); else if (present) exitPresentation(); else if (notesOpen) setNotesOpen(false); else if (outlineOpen) setOutlineOpen(false); else { notifyLecturer("exit"); setOpened(false); } }
      if (event.key.toLowerCase() === "n") setNotesOpen((value) => !value);
      if (event.key.toLowerCase() === "p") present ? exitPresentation() : enterPresentation();
      if (!lecturerMode && event.key.toLowerCase() === "f") setFeedbackOpen((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedbackOpen, index, lecturerMode, notesOpen, outlineOpen, present]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < 1192) setNotesOpen(false);
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  if (!opened) return <section className={`l4-player ${playerStyles.preview}`} aria-label="תצוגה מקדימה של מערך השיעור" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version={deckVersion} data-slides={extensionSlideCatalog}>
    <div className={playerStyles.previewStage}><ScaledSlide slide={previewSlide} index={0} hostClass={playerStyles.stage}/></div>
    <footer className={playerStyles.previewFooter}><div><strong>מערך שיעור 05 · מקלט AM — סופר־הטרודיין וגלאי מעטפת</strong><span>{deckSlides.length} שקפים</span></div><button type="button" className={playerStyles.openLessonButton} onClick={() => { notifyLecturer("open"); setIndex(0); setOutlineOpen(true); setNotesOpen(false); setOpened(true); }}>פתיחת מערך השיעור <span aria-hidden="true">←</span></button></footer>
  </section>;

  if (typeof document === "undefined") return null;
  if (present) return createPortal(<div dir="rtl" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version={deckVersion} data-slides={extensionSlideCatalog} className={`l4-player syllo-student-app ${playerStyles.present}`} role="dialog" aria-label="הצגת שקף שיעור 05">
    <ScaledSlide slide={slide} index={index} hostClass={playerStyles.presentStage} />
    <div className={playerStyles.presentControls}><button type="button" onClick={() => go(index - 1)}>הקודם</button><span dir="ltr">{String(index + 1).padStart(2, "0")} / {deckSlides.length}</span><button type="button" onClick={() => go(index + 1)}>הבא</button><button type="button" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות מרצה · N</button><button type="button" onClick={exitPresentation}>יציאה · Esc</button></div>
    {!lecturerMode && studentFeedback}
    {notesOpen && <aside className={playerStyles.speakerNotes}><b>הערות מרצה</b><p>{slide.notes.join(" · ")}</p></aside>}
  </div>, document.body);

  return createPortal(<div ref={playerRef} dir="rtl" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version={deckVersion} data-slides={extensionSlideCatalog} className={`l4-player syllo-student-app ${playerStyles.player} ${outlineOpen ? playerStyles.withOutline : ""} ${notesOpen ? playerStyles.withContext : ""}`} aria-label="מערך שיעור 05">
    <header className={playerStyles.playerToolbar}>
      <div className={playerStyles.lessonIdentity}><a className={playerStyles.courseBreadcrumb} href={lecturerMode ? "/lecturer/sessions#lessons" : "/course/communication-systems/lessons"} onClick={() => notifyLecturer("exit")}><span className={playerStyles.breadcrumbArrow} aria-hidden="true">›</span><span><small>{lecturerMode ? "חזרה לפנל המרצים" : "חזרה למערכי השיעור"}</small><b>מערכות תקשורת</b></span></a><span className={playerStyles.toolbarDivider}/><span className={playerStyles.lessonBadge} dir="ltr">05</span><span className={playerStyles.lessonTitle}>מקלט AM — סופר־הטרודיין וגלאי מעטפת</span></div>
      <nav className={playerStyles.loopPhases} aria-label="שלבי השיעור"><a className={playerStyles.phaseActive} href={lecturerMode ? "/lecturer/lessons/lesson-05/slides" : "/course/communication-systems/lessons/lesson-05/slides"}><span dir="ltr">01</span>מערך השיעור</a><a href={lecturerMode ? "/lecturer/lessons/lesson-05/practice" : "/course/communication-systems/lessons/lesson-05/practice"}><span dir="ltr">02</span>תרגול</a></nav>
      <div className={playerStyles.toolbarActions}><button type="button" className={playerStyles.toolbarButton} aria-label="מבנה השיעור" aria-pressed={outlineOpen} onClick={() => setOutlineOpen((value) => !value)}>☷</button><button type="button" className={`${playerStyles.toolbarButton} ${playerStyles.toolbarTextButton}`} aria-label="הערות מרצה" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות</button><button type="button" className={playerStyles.presentButton} onClick={enterPresentation}>הצגה</button></div>
    </header>
    <div className={playerStyles.loopProgress}/>
    <div className={playerStyles.playerWorkspace}>
      {outlineOpen && <aside className={playerStyles.outline} aria-label="מבנה השיעור"><header className={playerStyles.outlineHeader}><div className={playerStyles.outlineTitleRow}><span className={playerStyles.lessonBadge} dir="ltr">05</span><div><span className={playerStyles.eyebrow}>מערך השיעור · מקלט AM</span><h2>סופר־הטרודיין וגלאי מעטפת</h2></div></div><div className={playerStyles.lessonProgress}><span>{seen.length}/{deckSlides.length} שקפים נצפו</span><i><b style={{ width: `${seen.length / deckSlides.length * 100}%` }}/></i></div><button type="button" className={playerStyles.closePanel} onClick={() => setOutlineOpen(false)}>סגירה</button></header><div className={playerStyles.outlineSectionHeading}>מבנה השיעור</div><nav className={playerStyles.outlineScroll} aria-label="פרקי השיעור">{chapters.map((chapter, chapterIndex) => { const chapterSlides = deckSlides.map((item, slideIndex) => ({ item, slideIndex })).filter(({ item }) => item.chapter === chapter); const chapterSeen = chapterSlides.filter(({ slideIndex }) => seen.includes(slideIndex + 1)).length; const chapterFeedback = chapterSlides.filter(({ slideIndex }) => Boolean(feedbackBySlide[slideIndex + 1])).length; return <section className={playerStyles.chapter} key={chapter}><button type="button" title={chapter} aria-expanded={Boolean(openChapters[chapter])} className={`${playerStyles.chapterButton} ${slide.chapter === chapter ? playerStyles.chapterActive : ""}`} onClick={() => setOpenChapters((value) => ({ ...value, [chapter]: !value[chapter] }))}><span className={playerStyles.chapterNumber} dir="ltr">{chapterIndex === 0 || chapterIndex === chapters.length - 1 ? "·" : String(chapterIndex).padStart(2, "0")}</span><span className={playerStyles.chapterTitle}>{chapter}</span>{chapterFeedback > 0 && <span className={playerStyles.flagCount} aria-label={`${chapterFeedback} תגובות בפרק`}>{chapterFeedback}</span>}<span className={playerStyles.progressRing} style={{ "--progress": chapterSlides.length ? chapterSeen / chapterSlides.length : 0 } as React.CSSProperties} aria-label={`${chapterSeen} מתוך ${chapterSlides.length} שקפים נצפו`}/></button>{openChapters[chapter] && <div className={playerStyles.chapterSlides}>{chapterSlides.map(({ item, slideIndex }) => { const slideNumber = slideIndex + 1; const feedbackTypeForSlide = feedbackBySlide[slideNumber] && feedbackTypes.find((type) => type.key === feedbackBySlide[slideNumber].t); return <button type="button" key={slideIndex} title={item.title} className={`${playerStyles.slideLink} ${index === slideIndex ? playerStyles.slideActive : ""} ${seen.includes(slideNumber) ? playerStyles.slideSeen : ""}`} aria-current={index === slideIndex ? "step" : undefined} onClick={() => go(slideIndex)}><span className={playerStyles.slideNumber} dir="ltr">{String(slideNumber).padStart(2, "0")}</span><span className={playerStyles.slideTitle}>{item.title}</span>{feedbackTypeForSlide && <span className={playerStyles.feedbackMarker} title={feedbackTypeForSlide.label} aria-label={`משוב: ${feedbackTypeForSlide.label}`}><FeedbackIcon type={feedbackTypeForSlide.key} size={13}/></span>}{Boolean(item.interactive) && <span className={playerStyles.interactiveMark} title="שקף אינטראקטיבי" aria-label="שקף אינטראקטיבי">◆</span>}</button>; })}</div>}</section>; })}</nav></aside>}
      <main className={playerStyles.playerMain} aria-label="נגן שיעור 05"><div className={playerStyles.stageWrap}><ScaledSlide slide={slide} index={index} hostClass={playerStyles.stage}/></div><footer className={playerStyles.playerFooter}><nav className={playerStyles.chapterBar} aria-label="התקדמות בין פרקי השיעור">{chapters.map((chapter) => { const chapterSlides = deckSlides.map((item, slideIndex) => ({ item, slideIndex })).filter(({ item }) => item.chapter === chapter); const start = chapterSlides[0]?.slideIndex ?? 0; const progress = Math.max(0, Math.min(100, (index - start + 1) / chapterSlides.length * 100)); return <button type="button" key={chapter} className={`${playerStyles.chapterSegment} ${slide.chapter === chapter ? playerStyles.segmentActive : ""}`} style={{ flex: chapterSlides.length }} onClick={() => go(start)} title={chapter} aria-label={`מעבר לפרק ${chapter}`}><i style={{ width: `${progress}%` }}/>{chapterSlides.map(({ slideIndex }) => { const feedback = feedbackBySlide[slideIndex + 1]; if (!feedback) return null; const type = feedbackTypes.find((item) => item.key === feedback.t); const label = `משוב „${type?.label ?? "נשלח"}” · שקף ${String(slideIndex + 1).padStart(2, "0")}: ${deckSlides[slideIndex].title}`; return <em key={slideIndex} title={label} aria-label={label} style={{ insetInlineStart: `${((slideIndex - start + 0.5) / chapterSlides.length) * 100}%`, background: type?.color ?? "#008F4D" }}/>; })}</button>; })}</nav><div className={playerStyles.slideNav}><button type="button" className={playerStyles.navButton} onClick={() => go(index - 1)} aria-label="לשקף הקודם">‹</button><span className={playerStyles.slideCount} dir="ltr">{String(index + 1).padStart(2, "0")} / {deckSlides.length}</span><button type="button" className={playerStyles.navButton} onClick={() => go(index + 1)} aria-label="לשקף הבא">›</button><span className={playerStyles.chapterLabel}>{slide.chapter}</span></div></footer></main>
      {notesOpen && <aside className={playerStyles.slideContext} aria-label="הערות מרצה לשקף"><header className={playerStyles.contextHeader}><span>הערות מרצה</span><b dir="ltr">{String(index + 1).padStart(2, "0")}</b></header><div className={playerStyles.contextBody}><div className={playerStyles.takeaway}><small>העיקר</small>{bidiQuantities(slide.takeaway)}</div><section className={playerStyles.contextSection}><h3>מפת מושגים</h3><p>הקשרים בין אות AM משיעור 4 לבין קליטת התחנה בשיעור 5.</p>{concepts.filter((concept) => visibleConceptIds.includes(concept.conceptId)).map((concept) => <Link className={playerStyles.conceptCard} key={concept.conceptId} href={`/course/communication-systems/concepts/${concept.conceptId}`}><b>{concept.name}</b><small>{concept.description}</small></Link>)}<Link href="/course/communication-systems/concepts" className={playerStyles.contextMore}>למפת המושגים המלאה ←</Link></section><h3>הערות לשקף</h3><ul>{slide.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></aside>}
      {!lecturerMode && studentFeedback}
    </div>
  </div>, document.body);
}
