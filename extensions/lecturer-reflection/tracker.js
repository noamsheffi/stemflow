(() => {
  if (globalThis.__lecturerReflection) { globalThis.__lecturerReflection(); return; }
  const deck = document.querySelector(".deck, .slides-container"), elements = [...(deck?.querySelectorAll(".slide") || [])];
  if (!elements.length) { if (!globalThis.__lecturerReflectionAutoStart) alert("לא נמצאה מצגת תואמת."); return; }
  const labels = { PASS: ["✓", "עבר טוב"], HARD: ["!", "דרש יותר הסבר"], DEEPEN: ["★", "צריך להעמיק"], REVISIT: ["↻", "לחזור לזה"] };
  const match = location.pathname.match(/\/(?:course|courses)\/([^/]+)\/(lesson-\d+)/), lesson = document.body.dataset.lessonId || match?.[2] || location.pathname;
  const plannedMinutes = element => { const raw = element.dataset.minutes ?? element.dataset.time ?? ""; const value = Number.parseFloat(raw.replace(",", ".")); return raw.trim() && Number.isFinite(value) && value >= 0 ? value : null; };
  const session = { session_id: crypto.randomUUID(), workspace_id: globalThis.SYLLO_WORKSPACE_ID || null, course_id: document.body.dataset.courseId || match?.[1] || null, lesson_id: lesson, deck_version: document.body.dataset.deckVersion || null, started_at: new Date().toISOString(), ended_at: null, sync_status: "local_only", last_sync_at: null, last_sync_error: null, slides: elements.map((element, index) => ({ slide_id: element.dataset.slideId || `${lesson}-slide-${String(index + 1).padStart(2, "0")}`, id_source: element.dataset.slideIdSource || (element.dataset.slideId ? "authored" : "index-fallback"), slide_number: index + 1, planned_duration_minutes: plannedMinutes(element), actual_active_duration_ms: 0, annotations: [] })) };
  let active = null, openedAt = null, ended = false, reviewing = false, collapsed = false;
  const host = document.createElement("div"); host.style.cssText = "position:fixed;top:80px;right:16px;z-index:2147483647";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>:host{font:13px Arial,sans-serif;color:#17202a;direction:rtl}*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer;background:#fff;border:1px solid #d6dde5;border-radius:7px}.bar{height:36px;display:flex;align-items:center;gap:3px;padding:3px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 1px 5px #0002}.collapsed{padding:0 8px;gap:6px}.toggle{border:0;background:transparent;font-variant-numeric:tabular-nums;white-space:nowrap}.icon{width:28px;height:28px;padding:0;font-weight:700}.drag{cursor:move;touch-action:none;color:#64748b}.over{border-color:#94a3b8}.badge{font-size:10px;color:#475569}dialog{direction:rtl;position:fixed;inset:0;width:min(1000px,94vw);max-height:85vh;overflow:auto;background:white;color:#17202a;border:1px solid #cbd5e1;border-radius:14px;padding:20px;font:14px Arial,sans-serif}dialog::backdrop{background:#0007}.tools{display:flex;gap:8px;flex-wrap:wrap}.tools button{padding:8px 12px}table{border-collapse:collapse;width:100%;margin-top:15px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:right;white-space:pre-line}.signal td{background:#fffbeb}.mark{font-weight:bold;color:#804400}.save{color:#475569}.warning{padding:9px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px}@media print{.bar{display:none}}</style><div class="bar"><button class="toggle" title="קיפול או פתיחת כלי המרצה" aria-label="קיפול או פתיחת כלי המרצה"><span class="timer" dir="ltr"></span><span class="badge" aria-hidden="true"></span></button><button class="drag icon" title="הזזת הכלי" aria-label="הזזת הכלי">⠿</button><div class="actions">${Object.entries(labels).map(([type, [icon, label]]) => `<button class="icon" data-mark="${type}" title="${label}" aria-label="${label}">${icon}</button>`).join("")}<button class="icon review" title="סקירת מפגש" aria-label="סקירת מפגש">☷</button></div></div><dialog aria-label="סקירת מפגש"><h2>סקירת מפגש</h2><p class="summary"></p><p>זמן ארוך מהמתוכנן הוא אות להתבוננות, לא אבחנה של קושי.</p><p class="warning" hidden>זהות חלק מהשקפים נוצרה לפי מיקום; ייתכן שהשתנתה בין גרסאות המצגת.</p><div class="tools"><button class="close">חזרה למצגת</button><button class="end">סיום שיעור</button><button class="sync" disabled>סנכרון ל־Syllo</button><button class="export">ייצוא JSON</button></div><p class="save" role="status"></p><table><thead><tr><th>שקף</th><th>מתוכנן</th><th>פעיל בפועל</th><th>סימון</th><th>סומן ב־</th></tr></thead><tbody></tbody></table></dialog>`;
  document.documentElement.append(host);
  root.querySelector("style").textContent = `
    :host{font:13px Arial,sans-serif;color:#17202a;direction:rtl}
    *{box-sizing:border-box}
    button{font:inherit;color:inherit;cursor:pointer}
    .bar{display:flex;flex-direction:column;align-items:center;gap:5px;width:39px;padding:6px 5px 5px;background:rgba(255,255,255,.97);border:1px solid #d9dfe7;border-radius:22px;box-shadow:0 9px 21px #41516a2b,0 1px 4px #41516a18;backdrop-filter:blur(12px)}
    .bar.horizontal{flex-direction:row;width:max-content;height:32px;padding:4px 6px;gap:4px;border-radius:18px}
    .toggle{display:flex;flex:0 0 auto;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:100%;min-width:0;height:auto;min-height:31px;padding:1px;border:0;background:transparent;border-radius:9px;overflow:hidden}
    .bar.horizontal .toggle{flex-direction:row;width:auto;height:23px;gap:4px}
    .logo{display:block;flex:0 0 20px;width:20px;height:20px;max-width:100%;object-fit:contain;overflow:hidden}
    .bar.horizontal .logo{flex-basis:18px;width:18px;height:18px}
    .timer{display:block;width:100%;max-width:100%;font-size:8px;font-variant-numeric:tabular-nums;white-space:pre-line;overflow-wrap:normal;text-align:center;line-height:1.2;color:#526176;direction:ltr;unicode-bidi:isolate}
    .bar.horizontal .timer{width:auto;max-width:none;font-size:10px;white-space:nowrap}
    .icon{width:26px;height:23px;padding:0;border:0;background:#f1f2f3;border-radius:50%;font-weight:700;font-size:10px}
    .drag{width:12px;height:10px;background:transparent;cursor:move;touch-action:none;color:#b6b8bc;font-size:0}
    .drag:after{content:'•••';display:block;transform:rotate(90deg);font-size:10px;line-height:8px;letter-spacing:0}
    .bar.horizontal .drag{width:10px;height:18px}
    .bar.horizontal .drag:after{transform:none}
    .actions{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%}
    .bar.horizontal .actions{flex-direction:row;width:auto;gap:3px}
    .actions .icon{width:26px;height:23px;border-radius:50%;font-size:11px;transition:background .15s,border-color .15s,box-shadow .15s}
    .bar.horizontal .actions .icon{width:23px;height:23px}
    .actions .icon:hover,.icon:focus-visible{background:#e9eaeb;outline:2px solid #b9dfe2;outline-offset:1px}
    .actions .icon.marked[data-mark="PASS"]{background:#d9f1e6;box-shadow:inset 0 0 0 1px #53a980;color:#24714b}
    .actions .icon.marked[data-mark="HARD"]{background:#ffe8d5;box-shadow:inset 0 0 0 1px #d89455;color:#95551e}
    .actions .icon.marked[data-mark="DEEPEN"]{background:#fff2bf;box-shadow:inset 0 0 0 1px #d7b84e;color:#806410}
    .actions .icon.marked[data-mark="REVISIT"]{background:#e9e1ff;box-shadow:inset 0 0 0 1px #9a80d0;color:#5b4395}
    .review{font-size:12px!important}
    .over{box-shadow:0 0 0 2px #f5c7c7,0 9px 21px #41516a2b}
    .badge{display:block;max-width:10px;overflow:hidden;font-size:7px;color:#087c89}
    dialog{direction:rtl;position:fixed;inset:0;width:min(1000px,94vw);max-height:85vh;overflow:auto;background:white;color:#17202a;border:1px solid #cbd5e1;border-radius:14px;padding:20px;font:14px Arial,sans-serif}
    dialog::backdrop{background:#0007}
    .tools{display:flex;gap:8px;flex-wrap:wrap}.tools button{padding:8px 12px}
    table{border-collapse:collapse;width:100%;margin-top:15px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:right;white-space:pre-line}
    .signal td{background:#fffbeb}.mark{font-weight:bold;color:#804400}.save{color:#475569}.save.error{color:#b42318;background:#fef3f2;border:1px solid #fecdca;border-radius:7px;padding:9px;font-weight:700}
    .warning{padding:9px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px}
    @media print{.bar{display:none}}
  `;
  const toggle = root.querySelector(".toggle");
  const favicon = document.createElement("img");
  favicon.className = "logo";
  favicon.alt = "";
  favicon.src = new URL("/icon.png?v=0.2.4", location.origin).href;
  const timerLabel = document.createElement("span");
  timerLabel.className = "timer";
  timerLabel.dir = "ltr";
  const badgeIndicator = document.createElement("span");
  badgeIndicator.className = "badge";
  badgeIndicator.setAttribute("aria-hidden", "true");
  toggle.replaceChildren(favicon, timerLabel, badgeIndicator);
  for (const event of ["click", "dblclick", "keydown", "keyup", "pointerdown", "touchstart"]) host.addEventListener(event, event => event.stopPropagation());
  const $ = selector => root.querySelector(selector), timer = $(".timer"), badge = $(".badge"), dialog = $("dialog");
  const elapsed = index => index === null ? 0 : session.slides[index].actual_active_duration_ms + (openedAt === null ? 0 : performance.now() - openedAt), fmt = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
  function updateUi() { const slide = active === null ? null : session.slides[active], bar = $(".bar"), horizontal = bar.classList.contains("horizontal"), current = fmt(elapsed(active)); timer.textContent = slide ? horizontal ? `${String(active + 1).padStart(2, "0")} · ${current}${slide.planned_duration_minutes === null ? "" : ` / ${slide.planned_duration_minutes}:00`}` : `${String(active + 1).padStart(2, "0")}\n${current}` : "—"; timer.title = slide ? `שקף ${active + 1} · זמן פעיל ${current}${slide.planned_duration_minutes === null ? "" : ` · מתוכנן ${slide.planned_duration_minutes}:00`}` : "לא זוהה שקף פעיל"; badge.textContent = slide?.annotations.length ? labels[slide.annotations.at(-1).type][0] : ""; bar.classList.toggle("over", Boolean(slide?.planned_duration_minutes !== null && elapsed(active) > slide.planned_duration_minutes * 60000)); root.querySelectorAll("[data-mark]").forEach(button => { const marked = Boolean(slide?.annotations.some(annotation => annotation.type === button.dataset.mark)); button.classList.toggle("marked", marked); button.setAttribute("aria-pressed", String(marked)); button.disabled = ended || active === null; }); }
  function closeSlideTiming() { if (openedAt !== null && active !== null) session.slides[active].actual_active_duration_ms += Math.max(0, performance.now() - openedAt); openedAt = null; }
  function transition() { const next = elements.findIndex(element => element.classList.contains("active")); if (next === active) return; closeSlideTiming(); active = next < 0 ? null : next; if (!ended && !reviewing && document.visibilityState === "visible" && active !== null) openedAt = performance.now(); updateUi(); persist(); }
  function visibility() { if (document.visibilityState === "visible" && !ended && !reviewing && openedAt === null && active !== null) openedAt = performance.now(); else if (document.visibilityState !== "visible") closeSlideTiming(); updateUi(); persist(); }
  let writes = Promise.resolve(); function persist() { const snapshot = structuredClone(session); if (active !== null) snapshot.slides[active].actual_active_duration_ms = Math.round(elapsed(active)); writes = writes.then(() => chrome.storage.local.set({ [`lecturer-session:${session.session_id}`]: snapshot })).then(() => { const save = $(".save"); save.classList.toggle("error", session.sync_status === "failed"); save.textContent = session.sync_status === "synced" ? "✓ סונכרן ל־Syllo" : session.sync_status === "failed" ? `⚠ ${session.last_sync_error || "הסנכרון נכשל"} · העותק המקומי נשמר` : "עותק מקומי נשמר"; }).catch(() => { const save = $(".save"); save.classList.add("error"); save.textContent = "שמירה מקומית נכשלה; יש לייצא JSON"; }); }
  const observer = new MutationObserver(transition); elements.forEach(element => observer.observe(element, { attributes: true, attributeFilter: ["class"] })); document.addEventListener("visibilitychange", visibility); window.addEventListener("pagehide", () => { closeSlideTiming(); persist(); });
  function setCollapsed(value) { collapsed = value; $(".actions").hidden = value; $(".bar").classList.toggle("collapsed", value); updateUi(); } $(".toggle").addEventListener("click", () => setCollapsed(!collapsed));
  root.querySelectorAll("[data-mark]").forEach(button => button.addEventListener("click", () => { if (ended || active === null) return; const type = button.dataset.mark; session.slides[active].annotations.push({ type, timestamp: new Date().toISOString() }); persist(); updateUi(); }));
  function renderReview() { const total = session.slides.reduce((sum, slide) => sum + slide.actual_active_duration_ms, 0); const count = Object.fromEntries(Object.keys(labels).map(type => [type, session.slides.flatMap(slide => slide.annotations).filter(annotation => annotation.type === type).length])); $(".summary").textContent = `משך פעיל: ${fmt(total)} · ✓ ${count.PASS} · ! ${count.HARD} · ★ ${count.DEEPEN} · ↻ ${count.REVISIT}`; $(".warning").hidden = !session.slides.some(slide => slide.id_source === "index-fallback"); $(".sync").disabled = !ended; const tbody = $("tbody"); tbody.replaceChildren(); for (const slide of session.slides) { const row = document.createElement("tr"), over = slide.planned_duration_minutes !== null && slide.actual_active_duration_ms > slide.planned_duration_minutes * 60000; if (over) row.className = "signal"; [slide.slide_number, slide.planned_duration_minutes === null ? "לא זמין" : `${slide.planned_duration_minutes}:00`, fmt(slide.actual_active_duration_ms), slide.annotations.map(annotation => `${labels[annotation.type][0]} ${labels[annotation.type][1]}`).join("\n") || "—", slide.annotations.map(annotation => annotation.timestamp).join("\n") || "—"].forEach((value, index) => { const cell = document.createElement("td"); cell.textContent = value; if (index === 3 && slide.annotations.some(annotation => annotation.type !== "PASS")) cell.className = "mark"; row.append(cell); }); tbody.append(row); } }
  function review() { closeSlideTiming(); reviewing = true; renderReview(); persist(); if (!dialog.open) dialog.showModal(); } $(".review").addEventListener("click", review); globalThis.__lecturerReflection = review; $(".close").addEventListener("click", () => dialog.close()); dialog.addEventListener("close", () => { reviewing = false; if (!ended && document.visibilityState === "visible" && active !== null) openedAt = performance.now(); updateUi(); });
  $(".end").addEventListener("click", () => { closeSlideTiming(); ended = true; session.ended_at = new Date().toISOString(); observer.disconnect(); clearInterval(uiTick); clearInterval(saveTick); persist(); renderReview(); updateUi(); });
  async function syncSession() { closeSlideTiming(); session.sync_status = "syncing"; persist(); try { const { lecturerSyncToken } = await chrome.storage.local.get("lecturerSyncToken"); if (!lecturerSyncToken) throw new Error("חסר אסימון סנכרון. פתחו את אפשרויות התוסף והנפיקו אסימון."); const response = await fetch(`${globalThis.SYLLO_API_BASE_URL}/api/lecturer/sessions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${lecturerSyncToken}` }, body: JSON.stringify(session) }); if (!response.ok) throw new Error(response.status === 401 ? "אסימון הסנכרון פג או נדחה. הנפיקו אסימון חדש." : response.status === 400 ? "נתוני המפגש נדחו. רעננו את המצגת והתחילו מפגש חדש." : response.status >= 500 ? "שרת Syllo לא הצליח לשמור את המפגש. הנתונים נשארו מקומית; אפשר לנסות שוב." : `הסנכרון נדחה (HTTP ${response.status}).`); session.sync_status = "synced"; session.last_sync_at = new Date().toISOString(); session.last_sync_error = null; } catch (error) { session.sync_status = "failed"; session.last_sync_error = error instanceof TypeError ? "שגיאת חיבור/CORS. בדקו שמזהה התוסף תואם ל־SYLLO_EXTENSION_ORIGIN. הנתונים נשמרו מקומית." : error instanceof Error ? error.message : "שגיאת סנכרון; הנתונים נשמרו מקומית."; } persist(); renderReview(); } $(".sync").addEventListener("click", syncSession);
  $(".export").addEventListener("click", () => { closeSlideTiming(); const url = URL.createObjectURL(new Blob([JSON.stringify(session, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = `lecturer-session-${session.session_id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  const drag = $(".drag"); let origin;
  const dockAt = y => {
    const top = y <= 36;
    const bottom = innerHeight - y <= 36;
    $(".bar").classList.toggle("horizontal", top || bottom);
    return { top, bottom };
  };
  drag.addEventListener("pointerdown", event => { origin = { x: event.clientX, y: event.clientY, rect: host.getBoundingClientRect() }; drag.setPointerCapture(event.pointerId); });
  drag.addEventListener("pointermove", event => {
    if (!origin) return;
    host.style.right = "auto";
    const dock = dockAt(event.clientY);
    const left = origin.rect.left + event.clientX - origin.x;
    const top = origin.rect.top + event.clientY - origin.y;
    host.style.left = `${Math.max(6, Math.min(innerWidth - host.offsetWidth - 6, left))}px`;
    host.style.top = dock.top ? "8px" : dock.bottom ? `${Math.max(6, innerHeight - host.offsetHeight - 8)}px` : `${Math.max(6, Math.min(innerHeight - host.offsetHeight - 6, top))}px`;
  });
  drag.addEventListener("pointerup", () => {
    if (!origin) return;
    const rect = host.getBoundingClientRect();
    const dock = dockAt(rect.top + rect.height / 2);
    if (dock.top) host.style.top = "8px";
    if (dock.bottom) host.style.top = `${Math.max(6, innerHeight - host.offsetHeight - 8)}px`;
    origin = null;
    chrome.storage.local.set({ lecturerToolbarPosition: { left: parseFloat(host.style.left), top: parseFloat(host.style.top) } });
  });
  chrome.storage.local.get("lecturerToolbarPosition").then(({ lecturerToolbarPosition }) => {
    if (!lecturerToolbarPosition || lecturerToolbarPosition.left < 0 || lecturerToolbarPosition.top < 0 || lecturerToolbarPosition.left >= innerWidth - 20 || lecturerToolbarPosition.top >= innerHeight - 20) return;
    host.style.right = "auto";
    host.style.left = `${lecturerToolbarPosition.left}px`;
    host.style.top = `${lecturerToolbarPosition.top}px`;
    const dock = dockAt(lecturerToolbarPosition.top + host.offsetHeight / 2);
    if (dock.top) host.style.top = "8px";
    if (dock.bottom) host.style.top = `${Math.max(6, innerHeight - host.offsetHeight - 8)}px`;
  });
  const uiTick = setInterval(updateUi, 1000), saveTick = setInterval(persist, 5000); transition(); persist();
})();
