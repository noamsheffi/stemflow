(() => {
  if (globalThis.__lecturerReflection) { globalThis.__lecturerReflection(); return; }
  if (globalThis.__lecturerReflectionStarted) { globalThis.__lecturerReflectionOpenRequested = true; return; }

  const playerAtStart = document.querySelector("[data-lesson-player]");
  let reactSlides = [];
  try { reactSlides = playerAtStart ? JSON.parse(playerAtStart.dataset.slides || "[]") : []; } catch { reactSlides = []; }
  const legacyDeck = document.querySelector(".deck, .slides-container, #slidesContainer");
  let elements = [...(legacyDeck?.querySelectorAll(".slide.lesson-slide") || [])];
  if (!elements.length) elements = [...(legacyDeck?.querySelectorAll(".slide") || [])];
  if (!elements.length && !reactSlides.length) { if (!globalThis.__lecturerReflectionAutoStart) alert("לא נמצאה מצגת תואמת."); return; }
  globalThis.__lecturerReflectionStarted = true;

  const markTypes = [
    { id: "good", api: "PASS", label: "עבר טוב", hint: "הכיתה הבינה, הקצב נכון", key: "1", color: "#137A86", soft: "#E8F4F5", icon: "M5 12.5l4.2 4.2L19 7" },
    { id: "hard", api: "HARD", label: "קושי בכיתה", hint: "שאלות, מבטים, בלבול", key: "2", color: "#D9731F", soft: "#FDF3EA", icon: "M12 5v9|dot" },
    { id: "star", api: "DEEPEN", label: "רגע חזק", hint: "לשמור כמו שזה", key: "3", color: "#B8860B", soft: "#FBF4DF", icon: "M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" },
    { id: "redo", api: "REVISIT", label: "לשנות בפעם הבאה", hint: "לבנות מחדש או לקצר", key: "4", color: "#3B5BA9", soft: "#ECF0FA", icon: "M19 12a7 7 0 1 1-2.1-5|M19 4v4h-4" },
  ];
  const markById = Object.fromEntries(markTypes.map((mark) => [mark.id, mark]));
  const markByApi = Object.fromEntries(markTypes.map((mark) => [mark.api, mark]));
  const pathMatch = location.pathname.match(/\/(?:course|courses)\/([^/]+)\/(?:lessons\/)?(lesson-\d+)/);
  const lesson = playerAtStart?.dataset.lessonId || document.body.dataset.lessonId || pathMatch?.[2] || location.pathname;
  const course = playerAtStart?.dataset.courseId || document.body.dataset.courseId || pathMatch?.[1] || "communication-systems";
  const courseLabel = document.body.innerText.match(/\b\d{2}\.\d{4}\b/)?.[0] || course;
  const deckVersion = playerAtStart?.dataset.deckVersion || document.body.dataset.deckVersion || null;
  const minutesFrom = (value) => { const raw = String(value ?? "").trim().replace(",", "."); const amount = Number.parseFloat(raw); return raw && Number.isFinite(amount) && amount >= 0 ? amount : null; };
  const slideMeta = reactSlides.length ? reactSlides.map((item, index) => ({
    id: item.slideId || `${lesson}-slide-${String(index + 1).padStart(2, "0")}`,
    idSource: item.slideId ? "authored" : "index-fallback",
    number: Number(item.slideNumber) || index + 1,
    minutes: minutesFrom(item.minutes),
    title: String(item.title || `שקף ${String(index + 1).padStart(2, "0")}`),
    chapter: String(item.chapter || ""),
    section: Boolean(item.section),
  })) : elements.map((element, index) => ({
    id: element.dataset.slideId || `${lesson}-slide-${String(index + 1).padStart(2, "0")}`,
    idSource: element.dataset.slideIdSource || (element.dataset.slideId ? "authored" : "index-fallback"),
    number: element.dataset.slideNumber ? Number(element.dataset.slideNumber) : element.dataset.index !== undefined ? Number(element.dataset.index) + 1 : index + 1,
    minutes: minutesFrom(element.dataset.minutes || element.dataset.time),
    title: (element.querySelector("h1,h2,h3")?.textContent || element.dataset.slideTitle || element.querySelector(".slide-title")?.textContent || "").trim() || `שקף ${String(index + 1).padStart(2, "0")}`,
    chapter: String(element.dataset.section || element.dataset.chapter || ""),
    section: element.matches(".section,.section-slide,[data-section-slide='true']"),
  }));
  const lessonNumber = Number(lesson.match(/\d+/)?.[0]) || 0;
  const defaultSession = () => ({ session_id: crypto.randomUUID(), workspace_id: globalThis.SYLLO_WORKSPACE_ID || null, course_id: course, lesson_id: lesson, deck_version: deckVersion, started_at: new Date().toISOString(), ended_at: null, sync_status: "local_only", last_sync_at: null, last_sync_error: null, slides: slideMeta.map((slide) => ({ slide_id: slide.id, id_source: slide.idSource, slide_number: slide.number, planned_duration_minutes: slide.minutes, actual_active_duration_ms: 0, annotations: [] })) });
  const activeKey = `lecturer-active:${encodeURIComponent(`${course}:${lesson}:${location.origin}${location.pathname}`)}`;
  const uiKey = "lecturerPanelUi";
  const fmt = (ms) => { const seconds = Math.floor(Math.max(0, ms) / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; };
  const icon = (id, size = 18) => {
    const data = markById[id]?.icon || ({ syllo: "M7 8a4 4 0 1 0 0 8c3.2 0 6.8-8 10-8a4 4 0 1 1 0 8c-3.2 0-6.8-8-10-8", note: "M5 19l1-4L15.5 5.5a2 2 0 0 1 2.9 2.9L9 18z", list: "M9 7h10M9 12h10M9 17h10|dot1|dot2|dot3", expand: "M9 6l6 6-6 6", collapse: "M15 6l-6 6 6 6", swap: "M4 8h14l-3-3m5 11H6l3 3" })[id] || "";
    const paths = data.split("|").filter((part) => !part.startsWith("dot"));
    const circles = data.includes("dot1") ? `<circle cx="5" cy="7" r=".8" fill="currentColor"/><circle cx="5" cy="12" r=".8" fill="currentColor"/><circle cx="5" cy="17" r=".8" fill="currentColor"/>` : id === "hard" ? '<circle cx="12" cy="18.6" r=".9" fill="currentColor"/>' : "";
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((path) => `<path d="${path}"/>`).join("")}${circles}</svg>`;
  };

  (async () => {
    const stored = await chrome.storage.local.get([activeKey, uiKey]);
    const restored = stored[activeKey];
    const reusable = restored?.session && !restored.session.ended_at && restored.session.lesson_id === lesson && restored.session.deck_version === deckVersion && restored.session.slides.length === slideMeta.length;
    let session = reusable ? restored.session : defaultSession();
    let notes = reusable && restored.notes && typeof restored.notes === "object" ? restored.notes : {};
    const savedUi = stored[uiKey] || {};
    const ui = { expanded: Boolean(savedUi.expanded), side: savedUi.side === "right" ? "right" : "left", y: Number.isFinite(savedUi.y) ? Math.max(-260, Math.min(260, savedUi.y)) : 0, running: reusable ? savedUi.running !== false : true };
    let active = null, activeSince = null, ended = Boolean(session.ended_at), reviewing = false, filter = "all", toastTimer;
    const $ = (selector) => root.querySelector(selector);
    const host = document.createElement("div");
    host.dir = "ltr";
    host.style.cssText = "position:fixed;inset:0;z-index:2147483000;pointer-events:none;direction:ltr";
    const root = host.attachShadow({ mode: "open" });
    const stylesheet = document.createElement("link"); stylesheet.rel = "stylesheet"; stylesheet.href = chrome.runtime.getURL("panel.css"); root.append(stylesheet);
    root.insertAdjacentHTML("beforeend", `<div class="lp-panel side-${ui.side}" dir="rtl" aria-label="כלי המרצה">
      <header class="lp-grip" title="גררו להזזה אנכית"><span class="lp-logo">${icon("syllo", 22)}</span><span class="lp-dot"></span><span class="lp-title" hidden>מצב מרצה</span><span class="lp-sync" hidden></span><button class="lp-side" type="button" aria-label="העברת הפאנל לצד השני" title="העברת הפאנל לצד השני">${icon("swap", 16)}</button></header>
      <section class="lp-now"><button class="lp-timebox" type="button" aria-label="השהיה או המשך של הטיימר" aria-pressed="false"><svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true"><circle class="lp-ring-bg" cx="26" cy="26" r="22" fill="none" stroke-width="3.5"/><circle class="lp-ring-progress" cx="26" cy="26" r="22" fill="none" stroke-width="3.5"/></svg><span class="lp-tb-in"><span class="mono n"></span><span class="mono t"></span></span><span class="lp-paused" hidden>❚❚</span></button><div class="lp-expanded-now" hidden><div class="lp-slide-l"><span class="mono lp-slide-count"></span><b class="lp-slide-title"></b><small class="lp-chapter"></small></div><div class="lp-time-big"><div class="ltb-row"><span class="ltb-a mono"></span><span class="ltb-p mono"></span><button class="lp-play" type="button" aria-label="השהיית הטיימר" aria-pressed="true"></button></div><div class="ltb-bar"><i></i><em hidden></em></div><small class="lp-remaining"></small></div></div></section>
      <div class="lp-cur" aria-label="הסימון הנוכחי"></div><section class="lp-marks" aria-label="איך עבר השקף?">${markTypes.map((mark) => `<button class="lm-btn" type="button" data-mark="${mark.id}" style="--c:${mark.color};--cs:${mark.soft}" aria-label="${mark.label}" aria-pressed="false"><span class="lm-ic">${icon(mark.id, 19)}</span><span class="lm-tip">${mark.label}<kbd>${mark.key}</kbd></span></button>`).join("")}</section>
      <section class="lp-note" hidden><div class="lp-sec">הערה לשקף <span class="mono lp-note-number"></span></div><textarea aria-label="הערה לשקף" placeholder="מה לשנות, מה עבד, שאלה שעלתה…" rows="3"></textarea></section>
      <section class="lp-tl" hidden><div class="lp-sec">השיעור עד כה</div><div class="lp-tl-bars"></div></section>
      <section class="lp-tools"><button class="lp-tool note-toggle" type="button" aria-label="הערה לשקף" aria-pressed="false" title="הערה לשקף">${icon("note", 17)}</button><button class="lp-tool review-toggle" type="button" aria-label="סקירת מפגש" title="סקירת מפגש">${icon("list", 17)}</button></section>
      <section class="lp-flyout" hidden><div class="lp-sec">הערה לשקף <span class="mono lp-fly-number"></span></div><textarea aria-label="הערה לשקף" placeholder="מה לשנות, מה עבד…" rows="3"></textarea><button class="lp-fly-done" type="button">סיום</button></section>
      <footer class="lp-foot"><button class="lp-review" type="button">${icon("list", 15)}סקירת מפגש</button><button class="lp-exp" type="button" aria-label="הרחבת הפאנל" aria-pressed="false">${icon("expand", 17)}</button></footer><div class="lp-toast" hidden role="status" aria-live="polite"></div>
    </div><div class="rv-back" hidden><section class="rv" role="dialog" aria-modal="true" aria-label="סקירת מפגש"><header class="rv-h"><div><div class="rv-eyebrow"></div><h2>סקירת מפגש</h2></div><button class="rv-x" type="button" aria-label="חזרה למצגת (Escape)">×</button></header><div class="rv-stats"></div><div class="rv-hint">זמן ארוך מהמתוכנן הוא אות להתבוננות, לא אבחנה של קושי.</div><div class="rv-tools"><div class="rv-filters"></div><span class="rv-count"></span></div><div class="rv-table"></div><footer class="rv-f"><span class="rv-save"><i></i><span></span></span><button class="rv-btn ghost export" type="button">ייצוא JSON</button><button class="rv-btn ghost sync" type="button">סנכרון ל־Syllo</button><button class="rv-btn warn end" type="button">סיום שיעור</button><button class="rv-btn primary return" type="button">חזרה למצגת</button></footer></section></div>`);
    document.documentElement.append(host);
    const panel = $(".lp-panel"), dialog = $(".rv-back");
    host.addEventListener("click", (event) => event.stopPropagation());
    host.addEventListener("pointerdown", (event) => event.stopPropagation());
    const slideIndexByNumber = (number) => slideMeta.findIndex((item) => item.number === number);
    const getCurrentIndex = () => {
      const player = document.querySelector("[data-lesson-player]");
      if (player) { const number = Number(player.querySelector("[data-current-slide]")?.dataset.slideNumber); return slideIndexByNumber(number); }
      const freshDeck = document.querySelector(".deck, .slides-container, #slidesContainer");
      let freshElements = [...(freshDeck?.querySelectorAll(".slide.lesson-slide") || [])];
      if (!freshElements.length) freshElements = [...(freshDeck?.querySelectorAll(".slide") || [])];
      const selected = freshElements.findIndex((element) => element.classList.contains("active"));
      return selected >= 0 ? selected : elements.findIndex((element) => element.classList.contains("active"));
    };
    const currentSlide = () => session.slides[active] || null;
    const metaFor = (index) => slideMeta[index] || {};
    const elapsedMs = (index = active) => index === null || index < 0 ? 0 : session.slides[index].actual_active_duration_ms + (index === active && activeSince !== null ? Math.max(0, performance.now() - activeSince) : 0);
    const markFor = (slide) => slide?.annotations?.length ? markByApi[slide.annotations.at(-1).type]?.id || null : null;
    const plannedMs = (slide) => slide?.planned_duration_minutes === null ? null : slide.planned_duration_minutes * 60000;
    const isOver = (slide) => plannedMs(slide) !== null && elapsedMs(slide === currentSlide() ? active : session.slides.indexOf(slide)) > plannedMs(slide);
    const store = async () => {
      const snapshot = structuredClone(session);
      if (active !== null && activeSince !== null) snapshot.slides[active].actual_active_duration_ms = Math.round(elapsedMs(active));
      const resume = { session: snapshot, notes: structuredClone(notes), current: active === null ? restored?.current ?? 0 : active };
      await chrome.storage.local.set({ [activeKey]: resume, [`lecturer-session:${session.session_id}`]: snapshot, [uiKey]: ui });
      updateSaveLabel();
    };
    let saveQueue = Promise.resolve();
    const persist = () => { saveQueue = saveQueue.then(store).catch(() => { const label = $(".rv-save span"); if (label) label.textContent = "השמירה המקומית נכשלה"; }); return saveQueue; };
    const startTiming = () => { if (!ended && ui.running && !reviewing && active !== null && document.visibilityState === "visible" && activeSince === null) activeSince = performance.now(); };
    const stopTiming = () => { if (activeSince !== null && active !== null) session.slides[active].actual_active_duration_ms += Math.max(0, performance.now() - activeSince); activeSince = null; };
    const updateSaveLabel = () => { const label = $(".rv-save span"); if (!label) return; label.textContent = session.sync_status === "synced" ? "נשמר מקומית · סונכרן ל־Syllo" : session.sync_status === "failed" ? `נשמר מקומית · הסנכרון נכשל${session.last_sync_error ? `: ${session.last_sync_error}` : ""}` : session.sync_status === "syncing" ? "נשמר מקומית · הסנכרון מתבצע" : "נשמר מקומית · טרם סונכרן"; };
    const updateUiConfig = async () => { host.dataset.side = ui.side; panel.classList.toggle("side-left", ui.side === "left"); panel.classList.toggle("side-right", ui.side === "right"); panel.classList.toggle("exp", ui.expanded); panel.style.transform = `translateY(calc(-50% + ${ui.y}px))`; $(".lp-title").hidden = !ui.expanded; $(".lp-sync").hidden = !ui.expanded; $(".lp-side").hidden = !ui.expanded; $(".lp-expanded-now").hidden = !ui.expanded; $(".lp-timebox").hidden = ui.expanded; $(".lp-note").hidden = !ui.expanded; $(".lp-tl").hidden = !ui.expanded || innerHeight <= 760; $(".lp-exp").setAttribute("aria-label", ui.expanded ? "כיווץ הפאנל" : "הרחבת הפאנל"); $(".lp-exp").setAttribute("aria-pressed", String(ui.expanded)); $(".lp-exp").innerHTML = icon(ui.expanded ? "collapse" : "expand", 17); $(".lp-sync").textContent = "מסונכרן מקומית"; await persist(); };
    const setMark = (number, markId) => {
      const index = slideIndexByNumber(number); if (index < 0 || ended) return;
      const slide = session.slides[index], current = markFor(slide), next = current === markId ? null : markId;
      slide.annotations = next ? [{ type: markById[next].api, timestamp: new Date().toISOString() }] : [];
      render(); void persist();
      if (next) showToast(number, next);
    };
    const showToast = (number, markId) => { const toast = $(".lp-toast"), mark = markById[markId]; toast.className = `lp-toast side-${ui.side}`; toast.style.setProperty("--c", mark.color); toast.innerHTML = `${icon(markId, 15)}<span></span>`; toast.querySelector("span").textContent = `שקף ${String(number).padStart(2, "0")} סומן: ${mark.label}`; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 1400); };
    const renderTimeline = () => {
      const bars = $(".lp-tl-bars"); bars.replaceChildren();
      slideMeta.forEach((meta, index) => { const button = document.createElement("button"); button.type = "button"; button.className = `tl-b${session.slides[index].actual_active_duration_ms > 0 ? " seen" : ""}${meta.section ? " sec" : ""}${index === active ? " cur" : ""}`; const mark = markFor(session.slides[index]); if (mark) button.style.background = markById[mark].color; button.title = `${String(meta.number).padStart(2, "0")} · ${meta.title}`; button.setAttribute("aria-label", `מעבר לשקף ${meta.number}: ${meta.title}`); button.addEventListener("click", () => void gotoSlide(meta.number)); bars.append(button); });
    };
    function render() {
      const slide = currentSlide(), meta = metaFor(active), number = meta.number || 0, currentMark = markFor(slide), actual = elapsedMs(), plan = plannedMs(slide), over = plan !== null && actual > plan;
      panel.classList.toggle("exp", ui.expanded); $(".lp-grip").classList.toggle("exp", ui.expanded); const deckSynced = active !== null; $(".lp-sync").classList.toggle("ok", deckSynced); $(".lp-dot").classList.toggle("ok", deckSynced); $(".lp-sync").textContent = deckSynced ? "מסונכרן" : "מתחבר";
      $(".lp-slide-count").textContent = `${String(number).padStart(2, "0")} / ${slideMeta.length}`; $(".lp-slide-title").textContent = meta.title || ""; $(".lp-chapter").textContent = meta.chapter || "";
      $(".lp-tb-in .n").textContent = String(number).padStart(2, "0"); $(".lp-tb-in .t").textContent = fmt(actual); $(".lp-tb-in .t").classList.toggle("over", over); $(".lp-timebox").classList.toggle("over", over); $(".lp-timebox").setAttribute("aria-pressed", String(!ui.running)); $(".lp-timebox").title = ui.running ? "השהיית הטיימר" : "המשך הטיימר"; $(".lp-paused").hidden = ui.running;
      const circle = $(".lp-ring-progress"), circumference = 2 * Math.PI * 22, ratio = plan > 0 ? Math.min(1, actual / plan) : 0; circle.setAttribute("stroke-dasharray", `${circumference * ratio} ${circumference}`);
      $(".ltb-a").textContent = fmt(actual); $(".ltb-a").classList.toggle("over", over); $(".ltb-p").textContent = plan === null ? "" : `/ ${fmt(plan)}`; $(".lp-play").textContent = ui.running ? "❚❚" : "▶"; $(".lp-play").classList.toggle("paused", !ui.running); $(".lp-play").setAttribute("aria-label", ui.running ? "השהיית הטיימר" : "המשך הטיימר"); $(".lp-play").setAttribute("aria-pressed", String(ui.running));
      $(".ltb-bar i").style.width = plan ? `${Math.min(100, actual / plan * 100)}%` : "0%"; $(".ltb-bar i").classList.toggle("over", over); $(".ltb-bar em").hidden = !over; $(".ltb-bar em").style.width = over ? `${Math.min(40, (actual - plan) / plan * 100)}%` : "0%"; $(".lp-remaining").textContent = plan === null ? "שקף מעבר" : over ? `חריגה של ${fmt(actual - plan)}` : `נותרו ${fmt(plan - actual)} לפי התכנון`;
      const markMeta = currentMark && markById[currentMark]; $(".lp-cur").innerHTML = markMeta ? icon(currentMark, 16) : '<span class="lp-cur-empty"></span>'; $(".lp-cur").style.color = markMeta?.color || ""; $(".lp-cur").title = markMeta ? markMeta.label : "לא סומן"; $(".lp-cur").hidden = ui.expanded;
      $(".lp-marks").classList.toggle("grid", ui.expanded); root.querySelectorAll("[data-mark]").forEach((button) => { const selected = currentMark === button.dataset.mark; button.classList.toggle("on", selected); button.classList.toggle("big", ui.expanded); button.setAttribute("aria-pressed", String(selected)); button.disabled = ended || active === null; button.title = `${markById[button.dataset.mark].label} (${markById[button.dataset.mark].key})`; if (ui.expanded && !button.querySelector(".lm-bl")) { const mark = markById[button.dataset.mark]; const text = document.createElement("span"); text.className = "lm-bl"; const label = document.createElement("b"), hint = document.createElement("small"); label.textContent = mark.label; hint.textContent = mark.hint; text.append(label, hint); const key = document.createElement("kbd"); key.textContent = mark.key; button.querySelector(".lm-tip")?.remove(); button.append(text, key); } else if (!ui.expanded) { button.querySelector(".lm-bl")?.remove(); button.querySelectorAll("kbd").forEach((key) => { if (!key.closest(".lm-tip")) key.remove(); }); if (!button.querySelector(".lm-tip")) { const mark = markById[button.dataset.mark], tip = document.createElement("span"), key = document.createElement("kbd"); tip.className = "lm-tip"; tip.append(document.createTextNode(mark.label)); key.textContent = mark.key; tip.append(key); button.append(tip); } } });
      const expandedNote = $(".lp-note textarea"), flyoutNote = $(".lp-flyout textarea"); if (expandedNote.value !== (notes[number] || "")) expandedNote.value = notes[number] || ""; if (flyoutNote.value !== (notes[number] || "")) flyoutNote.value = notes[number] || ""; $(".lp-note-number").textContent = String(number).padStart(2, "0"); $(".lp-fly-number").textContent = String(number).padStart(2, "0"); $(".lp-note").hidden = !ui.expanded; $(".lp-tools").hidden = ui.expanded; $(".lp-tl").hidden = !ui.expanded || innerHeight <= 760; $(".note-toggle").classList.toggle("has", Boolean(notes[number])); $(".note-toggle").setAttribute("aria-pressed", String($(".lp-flyout").hidden === false)); $(".lp-review").disabled = active === null; $(".lp-exp").innerHTML = icon(ui.expanded ? "collapse" : "expand", 17); $(".lp-exp").setAttribute("aria-label", ui.expanded ? "כיווץ הפאנל" : "הרחבת הפאנל"); $(".lp-exp").setAttribute("aria-pressed", String(ui.expanded)); $(".lp-title").hidden = !ui.expanded; $(".lp-sync").hidden = !ui.expanded; $(".lp-side").hidden = !ui.expanded; $(".lp-timebox").hidden = ui.expanded;
      renderTimeline(); if (reviewing) renderReview();
    }
    const commitTiming = () => { if (activeSince !== null && active !== null) session.slides[active].actual_active_duration_ms += Math.max(0, performance.now() - activeSince); activeSince = null; };
    const transition = () => {
      const next = getCurrentIndex(); if (next === active || next < 0 || next >= session.slides.length) return;
      commitTiming(); active = next; if (!ended && ui.running && !reviewing && document.visibilityState === "visible") activeSince = performance.now(); render(); void persist();
    };
    async function gotoSlide(number) {
      const index = slideIndexByNumber(number); if (index < 0) return;
      const player = document.querySelector("[data-lesson-player]");
      if (player) { window.dispatchEvent(new CustomEvent("syllo:lecturer-goto-slide", { detail: number })); return; }
      const current = getCurrentIndex(); if (current < 0 || current === index) return;
      const nextKey = lesson === "lesson-03" ? "ArrowLeft" : "ArrowRight";
      const key = index > current ? nextKey : nextKey === "ArrowRight" ? "ArrowLeft" : "ArrowRight";
      for (let step = current; step !== index; step += index > current ? 1 : -1) { document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })); await new Promise((resolve) => setTimeout(resolve, 16)); }
      transition();
    }
    function setRunning(next) {
      if (ui.running === next || ended) return;
      if (!next) commitTiming(); ui.running = next; if (next) activeSince = active !== null && !reviewing && document.visibilityState === "visible" ? performance.now() : null; render(); void persist();
    }
    function setExpanded(next) { ui.expanded = next; updateUiConfig(); render(); }
    function setSide(next) { ui.side = next; updateUiConfig(); render(); }
    function openReview() { commitTiming(); reviewing = true; dialog.hidden = false; renderReview(); void persist(); dialog.querySelector(".rv-x").focus(); }
    function closeReview() { if (!reviewing) return; reviewing = false; dialog.hidden = true; if (ui.running && !ended && document.visibilityState === "visible" && active !== null) activeSince = performance.now(); render(); void persist(); }
    function renderReview() {
      const rows = slideMeta.map((meta, index) => ({ meta, slide: session.slides[index], index })).filter((row) => !row.meta.section).filter(({ slide }) => filter === "all" ? true : filter === "none" ? !markFor(slide) : filter === "over" ? plannedMs(slide) !== null && slide.actual_active_duration_ms > plannedMs(slide) * 1.25 : markFor(slide) === filter);
      const counted = slideMeta.map((meta, index) => ({ meta, slide: session.slides[index] })).filter((row) => !row.meta.section);
      const actualTotal = counted.reduce((sum, row) => sum + elapsedMs(session.slides.indexOf(row.slide)), 0), planTotal = counted.reduce((sum, row) => sum + (plannedMs(row.slide) || 0), 0), seen = counted.filter((row) => elapsedMs(session.slides.indexOf(row.slide)) > 0), plannedSeen = seen.reduce((sum, row) => sum + (plannedMs(row.slide) || 0), 0), delta = actualTotal - plannedSeen;
      $(".rv-eyebrow").textContent = `${courseLabel} · שיעור ${String(lessonNumber).padStart(2, "0")} · ${ended ? "הסתיים" : "בזמן השיעור"}`;
      const stats = $(".rv-stats"); stats.replaceChildren();
      const stat = (title, value, description, over = false) => { const card = document.createElement("div"); card.className = "rv-stat"; const small = document.createElement("small"), strong = document.createElement("b"), span = document.createElement("span"); small.textContent = title; strong.textContent = value; strong.classList.toggle("over", over); span.textContent = description; card.append(small, strong, span); return card; };
      stats.append(stat("זמן פעיל", fmt(actualTotal), `מתוך ${fmt(planTotal)} מתוכננות`), stat("קצב", `${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta))}`, `ביחס לתכנון, ב־${seen.length} שקפים`, delta > 0));
      markTypes.forEach((mark) => { const button = document.createElement("button"); button.className = `rv-stat mk${filter === mark.id ? " on" : ""}`; button.style.setProperty("--c", mark.color); button.style.setProperty("--cs", mark.soft); button.type = "button"; const small = document.createElement("small"), strong = document.createElement("b"); small.innerHTML = `${icon(mark.id, 13)}<span></span>`; small.querySelector("span").textContent = mark.label; strong.textContent = String(counted.filter((row) => markFor(row.slide) === mark.id).length); button.append(small, strong); button.addEventListener("click", () => { filter = filter === mark.id ? "all" : mark.id; renderReview(); }); stats.append(button); });
      const filters = $(".rv-filters"); filters.replaceChildren(); [["all", "הכל"], ["none", "לא סומנו"], ["over", "חריגה בזמן"]].forEach(([id, label]) => { const button = document.createElement("button"); button.type = "button"; button.className = filter === id ? "on" : ""; button.textContent = label; button.addEventListener("click", () => { filter = id; renderReview(); }); filters.append(button); });
      $(".rv-count").textContent = `${rows.length} שקפים`;
      const table = $(".rv-table"); table.replaceChildren(); const header = document.createElement("div"); header.className = "rv-tr rv-th"; ["שקף", "זמן: מתוכנן מול בפועל", "סימון", "הערה"].forEach((label, index) => { const cell = document.createElement("span"); cell.textContent = label; if (index === 2) cell.className = "c"; header.append(cell); }); table.append(header);
      const maxTime = Math.max(1, ...counted.map((row) => Math.max(plannedMs(row.slide) || 0, elapsedMs(session.slides.indexOf(row.slide)))));
      rows.forEach(({ meta, slide, index }) => {
        const row = document.createElement("div"); row.className = `rv-tr${elapsedMs(index) ? "" : " unseen"}`;
        const jump = document.createElement("button"); jump.type = "button"; jump.className = "rv-slide"; jump.addEventListener("click", () => { closeReview(); void gotoSlide(meta.number); }); const num = document.createElement("span"); num.className = "mono"; num.textContent = String(meta.number).padStart(2, "0"); const titleWrap = document.createElement("span"), title = document.createElement("b"), chapter = document.createElement("small"); title.textContent = meta.title; chapter.textContent = meta.chapter; titleWrap.append(title, chapter); jump.append(num, titleWrap); row.append(jump);
        const time = document.createElement("div"); time.className = "rv-time"; const bars = document.createElement("div"); bars.className = "rv-bars"; const plan = plannedMs(slide) || 0, actual = elapsedMs(index), p = document.createElement("i"), a = document.createElement("i"); p.className = "p"; a.className = `a${plan && actual > plan * 1.25 ? " over" : ""}`; p.style.width = `${plan / maxTime * 100}%`; a.style.width = `${actual / maxTime * 100}%`; bars.append(p, a); const value = document.createElement("span"); value.className = "mono rv-tn"; value.innerHTML = `<span></span><em></em>`; value.querySelector("span").textContent = fmt(actual); value.querySelector("em").textContent = ` / ${plan ? fmt(plan) : "—"}`; const diff = document.createElement("span"); const change = actual - plan; diff.className = `mono rv-d${change > 0 ? " pos" : " neg"}`; diff.textContent = actual ? `${change > 0 ? "+" : "−"}${fmt(Math.abs(change))}` : ""; time.append(bars, value, diff); row.append(time);
        const marks = document.createElement("div"); marks.className = "rv-marks"; markTypes.forEach((mark) => { const button = document.createElement("button"); button.type = "button"; button.className = `rv-m${markFor(slide) === mark.id ? " on" : ""}`; button.style.setProperty("--c", mark.color); button.title = mark.label; button.setAttribute("aria-label", `${mark.label} לשקף ${meta.number}`); button.setAttribute("aria-pressed", String(markFor(slide) === mark.id)); button.innerHTML = icon(mark.id, 13); button.addEventListener("click", () => setMark(meta.number, mark.id)); marks.append(button); }); row.append(marks);
        const note = document.createElement("div"); note.className = "rv-note rv-row-note"; note.textContent = notes[meta.number] || "—"; row.append(note); table.append(row);
      });
      $(".rv-save i").style.background = session.sync_status === "synced" ? "#35b37e" : session.sync_status === "failed" ? "#d9731f" : "#e0a243"; updateSaveLabel(); $(".sync").disabled = !ended || session.sync_status === "syncing"; $(".sync").textContent = session.sync_status === "synced" ? "✓ סונכרן" : session.sync_status === "syncing" ? "מסנכרן…" : "סנכרון ל־Syllo"; $(".sync").classList.toggle("ok", session.sync_status === "synced"); $(".end").hidden = ended;
    }
    async function syncSession() {
      if (!ended) return; await persist(); session.sync_status = "syncing"; renderReview(); await persist();
      try {
        const { lecturerSyncToken } = await chrome.storage.local.get("lecturerSyncToken");
        if (!lecturerSyncToken) throw new Error("חסר אסימון סנכרון. פתחו את אפשרויות התוסף והנפיקו אסימון.");
        const payload = { ...session, slides: session.slides.map(({ slide_id, id_source, slide_number, planned_duration_minutes, actual_active_duration_ms, annotations }) => ({ slide_id, id_source, slide_number, planned_duration_minutes, actual_active_duration_ms: Math.round(actual_active_duration_ms), annotations })) };
        const response = await fetch(`${globalThis.SYLLO_API_BASE_URL}/api/lecturer/sessions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${lecturerSyncToken}` }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(response.status === 401 ? "אסימון הסנכרון פג או נדחה. הנפיקו אסימון חדש." : response.status >= 500 ? "שרת Syllo לא הצליח לשמור את המפגש. הנתונים נשארו מקומית; אפשר לנסות שוב." : `הסנכרון נדחה (HTTP ${response.status}).`);
        session.sync_status = "synced"; session.last_sync_at = new Date().toISOString(); session.last_sync_error = null;
      } catch (error) { session.sync_status = "failed"; session.last_sync_error = error instanceof TypeError ? "שגיאת חיבור/CORS. בדקו את הגדרת מקור התוסף. הנתונים נשמרו מקומית." : error instanceof Error ? error.message : "שגיאת סנכרון; הנתונים נשמרו מקומית."; }
      await persist(); renderReview();
    }
    const exportJson = () => {
      commitTiming(); const data = { course: courseLabel, lesson: lessonNumber || lesson, at: new Date().toISOString(), slides: slideMeta.filter((meta) => !meta.section).map((meta) => { const slideIndex = slideMeta.indexOf(meta), slide = session.slides[slideIndex]; return { n: meta.number, title: meta.title, plannedSec: Math.round((plannedMs(slide) || 0) / 1000), actualSec: Math.round(elapsedMs(slideIndex) / 1000), mark: markFor(slide), note: notes[meta.number] || "" }; }) };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = `syllo-${lesson}-session.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); void persist();
    };
    const onKeydown = (event) => {
      const target = event.target;
      if (target?.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target?.tagName || "")) return;
      if (event.key === "Escape" && (!dialog.hidden || !$(".lp-flyout").hidden)) { event.preventDefault(); event.stopPropagation(); if (!dialog.hidden) closeReview(); $(".lp-flyout").hidden = true; return; }
      if (!dialog.hidden) return;
      if (/^[1-4]$/.test(event.key)) { event.preventDefault(); event.stopPropagation(); const mark = markTypes[Number(event.key) - 1]; if (active !== null) setMark(slideMeta[active].number, mark.id); }
      else if (event.key.toLowerCase() === "e") { event.preventDefault(); event.stopPropagation(); setExpanded(!ui.expanded); }
      else if (event.key.toLowerCase() === "r") { event.preventDefault(); event.stopPropagation(); openReview(); }
    };
    window.addEventListener("keydown", onKeydown, true);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") commitTiming(); else if (ui.running && !ended && !reviewing) activeSince = active === null ? null : performance.now(); render(); void persist(); });
    const observer = new MutationObserver(transition); observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-slide-number", "class"] });
    window.addEventListener("pagehide", () => { commitTiming(); void persist(); });

    $(".lp-grip").addEventListener("pointerdown", (event) => { if (event.target.closest("button")) return; const startY = event.clientY, startOffset = ui.y, grip = event.currentTarget; grip.setPointerCapture(event.pointerId); const move = (next) => { ui.y = Math.max(-260, Math.min(260, startOffset + next.clientY - startY)); panel.style.transform = `translateY(calc(-50% + ${ui.y}px))`; }; const up = () => { grip.removeEventListener("pointermove", move); grip.removeEventListener("pointerup", up); void persist(); }; grip.addEventListener("pointermove", move); grip.addEventListener("pointerup", up); });
    $(".lp-exp").addEventListener("click", () => setExpanded(!ui.expanded)); $(".lp-side").addEventListener("click", () => setSide(ui.side === "left" ? "right" : "left")); $(".lp-timebox").addEventListener("click", () => setRunning(!ui.running)); $(".lp-play").addEventListener("click", () => setRunning(!ui.running));
    root.querySelectorAll("[data-mark]").forEach((button) => button.addEventListener("click", () => { if (active !== null) setMark(slideMeta[active].number, button.dataset.mark); }));
    $(".lp-review").addEventListener("click", openReview); $(".review-toggle").addEventListener("click", openReview); $(".rv-x").addEventListener("click", closeReview); $(".return").addEventListener("click", closeReview); $(".rv-back").addEventListener("click", (event) => { if (event.target === dialog) closeReview(); }); $(".export").addEventListener("click", exportJson); $(".sync").addEventListener("click", () => void syncSession()); $(".end").addEventListener("click", () => { commitTiming(); ended = true; ui.running = false; session.ended_at = new Date().toISOString(); render(); void persist(); });
    $(".note-toggle").addEventListener("click", () => { const flyout = $(".lp-flyout"); flyout.hidden = !flyout.hidden; $(".note-toggle").setAttribute("aria-pressed", String(!flyout.hidden)); if (!flyout.hidden) $(".lp-flyout textarea").focus(); }); $(".lp-fly-done").addEventListener("click", () => { $(".lp-flyout").hidden = true; $(".note-toggle").setAttribute("aria-pressed", "false"); });
    [$(".lp-note textarea"), $(".lp-flyout textarea")].forEach((textarea) => textarea.addEventListener("input", () => { if (active === null) return; notes[slideMeta[active].number] = textarea.value; $(".lp-note textarea").value = textarea.value; $(".lp-flyout textarea").value = textarea.value; $(".note-toggle").classList.toggle("has", Boolean(textarea.value)); void persist(); }));

    await updateUiConfig();
    active = getCurrentIndex();
    if (active < 0) active = Math.max(0, Math.min(slideMeta.length - 1, Number(restored?.current) || 0));
    const restoredNumber = slideMeta[restored?.current]?.number;
    if (reusable && Number.isInteger(restoredNumber) && restoredNumber !== slideMeta[active]?.number) void gotoSlide(restoredNumber);
    startTiming(); render(); void persist();
    const uiTick = setInterval(() => { if (activeSince !== null) { render(); void persist(); } else if (!reviewing) render(); }, 1000);
    window.addEventListener("pagehide", () => clearInterval(uiTick), { once: true });
    globalThis.__lecturerReflection = () => setExpanded(true);
    if (globalThis.__lecturerReflectionOpenRequested) {
      globalThis.__lecturerReflectionOpenRequested = false;
      setExpanded(true);
    }
  })().catch((error) => { globalThis.__lecturerReflectionStarted = false; console.error("Syllo lecturer panel could not start", error); });
})();
