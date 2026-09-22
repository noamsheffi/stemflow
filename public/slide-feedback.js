(function () {
  'use strict';
  var body = document.body;
  if (!body || (!document.querySelector('.deck') && !body.dataset.lessonId)) return;
  var types = [
    ['NOT_UNDERSTOOD', 'לא הבנתי', '?'], ['NEED_EXAMPLE', 'צריך עוד דוגמה', '↻'],
    ['QUESTION', 'יש לי שאלה', '✎'], ['POSSIBLE_ERROR', 'נראה שיש טעות', '!']
  ];
  var clientKey = 'syllo:anonymous-client-id';
  var clientId = localStorage.getItem(clientKey);
  if (!clientId) { clientId = crypto.randomUUID(); localStorage.setItem(clientKey, clientId); }
  var button = document.createElement('button'); button.className = 'syllo-feedback-trigger'; button.type = 'button'; button.setAttribute('aria-label', 'משוב על השקף הנוכחי');
  var sylloIcon = document.createElement('img'); sylloIcon.className = 'syllo-feedback-brand-icon'; sylloIcon.src = '/icon.png'; sylloIcon.alt = ''; sylloIcon.setAttribute('aria-hidden', 'true'); button.appendChild(sylloIcon);
  var panel = document.createElement('div'); panel.className = 'syllo-feedback-panel'; panel.hidden = true; panel.dir = 'rtl';
  panel.innerHTML = '<header class="syllo-feedback-header"><strong>משוב על השקף</strong><div class="syllo-feedback-window-controls"><button class="syllo-feedback-collapse" type="button" aria-label="קיפול החלונית" aria-expanded="true">⌄</button><button class="syllo-feedback-close" type="button" aria-label="סגירת החלונית">×</button></div></header><div class="syllo-feedback-content"><p class="syllo-feedback-prompt">מה תרצו לשתף?</p><div class="syllo-feedback-options"></div><textarea maxlength="800" placeholder="אפשר להוסיף כמה מילים (אופציונלי)" hidden></textarea><button class="syllo-feedback-submit" type="button" disabled>שליחה</button><span class="syllo-feedback-status" role="status" aria-live="polite"></span></div>';
  var options = panel.querySelector('.syllo-feedback-options'), text = panel.querySelector('textarea'), submit = panel.querySelector('.syllo-feedback-submit'), status = panel.querySelector('.syllo-feedback-status'), collapse = panel.querySelector('.syllo-feedback-collapse'), selected = null, lastSubmit = '', marksBySlide = Object.create(null), currentKey = '';
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide')); if (!slides.length) slides = Array.prototype.slice.call(document.querySelectorAll('.tab-content'));
  function currentSlide() { return document.querySelector('.slide.active') || document.querySelector('.tab-content.active'); }
  function keyFor(slide) { var index = slides.indexOf(slide); return slide && (slide.dataset.slideId || slide.id || 'slide-' + (index + 1)); }
  function paintSelection(type) { var item = types.find(function (entry) { return entry[0] === type; }), needsText = item && (type === 'QUESTION' || type === 'POSSIBLE_ERROR'); if (item) button.textContent = item[2]; else button.replaceChildren(sylloIcon.cloneNode(true)); button.dataset.selected = item ? 'true' : 'false'; button.setAttribute('aria-label', item ? 'המשוב שסימנת: ' + item[1] : 'משוב על השקף הנוכחי'); button.title = item ? 'סימנת: ' + item[1] : 'משוב על השקף הנוכחי'; options.querySelectorAll('button').forEach(function (option) { option.classList.toggle('selected', option.dataset.type === type); }); selected = type || null; text.hidden = !needsText; submit.hidden = !needsText; submit.disabled = !needsText; }
  function syncSlideSelection() { var key = keyFor(currentSlide()); if (!key || key === currentKey) return; if (currentKey) { panel.hidden = true; panel.classList.remove('minimized'); collapse.textContent = '⌄'; collapse.setAttribute('aria-label', 'קיפול החלונית'); collapse.setAttribute('aria-expanded', 'true'); } currentKey = key; status.textContent = ''; status.className = 'syllo-feedback-status'; text.value = ''; paintSelection(marksBySlide[key]); }
  types.forEach(function (item) { var option = document.createElement('button'); option.type = 'button'; option.textContent = item[1]; option.dataset.type = item[0]; option.addEventListener('click', function () { if (currentKey) marksBySlide[currentKey] = item[0]; paintSelection(item[0]); status.textContent = ''; status.className = 'syllo-feedback-status'; if (item[0] !== 'QUESTION' && item[0] !== 'POSSIBLE_ERROR') sendFeedback(); }); options.appendChild(option); });
  button.addEventListener('click', function () { panel.hidden = !panel.hidden; if (!panel.hidden) { syncSlideSelection(); options.querySelector('button').focus(); } });
  panel.querySelector('.syllo-feedback-close').addEventListener('click', function () { panel.hidden = true; button.focus(); });
  collapse.addEventListener('click', function () { var minimized = panel.classList.toggle('minimized'); collapse.textContent = minimized ? '⌃' : '⌄'; collapse.setAttribute('aria-label', minimized ? 'הרחבת החלונית' : 'קיפול החלונית'); collapse.setAttribute('aria-expanded', String(!minimized)); });
  function sendFeedback() {
    if (!selected || lastSubmit === currentKey + ':' + selected) return;
    var type = selected, slideKey = currentKey, requestKey = slideKey + ':' + type, slide = currentSlide(); if (!slide) { status.className = 'syllo-feedback-status error'; status.textContent = 'לא זוהה שקף פעיל. עברו לשקף ונסו שוב.'; return; }
    var slideId = slide.dataset.slideId || slide.id || 'slide-' + (slides.indexOf(slide) + 1);
    var payload = { anonymousClientId: clientId, courseId: body.dataset.courseId || 'unknown', lessonId: body.dataset.lessonId || 'unknown', slideId: slideId, slideNumber: slides.indexOf(slide) + 1, deckVersion: body.dataset.deckVersion || 'unknown', feedbackType: type, optionalComment: text.hidden ? '' : text.value, submittedAt: new Date().toISOString(), pageUrl: location.href, idempotencyKey: type + ':' + slideId + ':' + Math.floor(Date.now() / 5000) };
    submit.disabled = true; lastSubmit = requestKey;
    fetch('/api/student/slide-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).then(function (response) { if (!response.ok) throw new Error(response.status === 400 ? 'פרטי השקף לא תקינים. רעננו את המערך ונסו שוב.' : response.status === 503 ? 'השמירה אינה זמינה כרגע. נסו שוב בעוד רגע.' : 'לא הצלחנו לשמור את המשוב. נסו שוב.');
      if (window.gtag) window.gtag('event', 'student_feedback_submitted', { course_id: payload.courseId, lesson_id: payload.lessonId, slide_id: payload.slideId, feedback_type: payload.feedbackType });
      else { window.dataLayer = window.dataLayer || []; window.dataLayer.push(['event', 'student_feedback_submitted', { course_id: payload.courseId, lesson_id: payload.lessonId, slide_id: payload.slideId, feedback_type: payload.feedbackType }]); }
      if (currentKey === slideKey) { status.className = 'syllo-feedback-status success'; status.textContent = '✓ נשלח'; setTimeout(function () { if (lastSubmit === requestKey) lastSubmit = ''; if (currentKey !== slideKey) return; panel.hidden = true; status.textContent = ''; status.className = 'syllo-feedback-status'; text.value = ''; }, 1000); } else if (lastSubmit === requestKey) lastSubmit = '';
    }).catch(function (error) { if (currentKey === slideKey) { status.className = 'syllo-feedback-status error'; status.textContent = error instanceof TypeError ? 'לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.' : error.message || 'לא הצלחנו לשלוח. נסו שוב.'; submit.disabled = false; } if (lastSubmit === requestKey) lastSubmit = ''; });
  }
  submit.addEventListener('click', sendFeedback);
  var style = document.createElement('style'); style.textContent = `
    .syllo-feedback-trigger,.syllo-feedback-panel,.syllo-feedback-panel *{box-sizing:border-box}
    .syllo-feedback-trigger{position:fixed;top:auto;right:22px;bottom:calc(22px + env(safe-area-inset-bottom,0px));left:auto;z-index:2147483647;display:grid;place-items:center;width:56px;height:56px;padding:0;border:1px solid #d5e0e8;border-radius:50%;background:#fff;color:#17202a;box-shadow:0 8px 24px #0f172a30;font:700 20px/1 system-ui;cursor:pointer;transition:background .16s,color .16s,transform .16s}
    .syllo-feedback-brand-icon{display:block;width:32px;height:32px;object-fit:contain}
    .syllo-feedback-trigger:hover{transform:translateY(-1px)}
    .syllo-feedback-trigger[data-selected="true"]{background:#0f7f91;border-color:#0f7f91;color:#fff}
    .syllo-feedback-panel{position:fixed;top:auto;right:22px;bottom:calc(90px + env(safe-area-inset-bottom,0px));left:auto;z-index:2147483647;display:flex;flex-direction:column;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 112px - env(safe-area-inset-bottom,0px));overflow:hidden;border:1px solid #dce3eb;border-radius:20px;background:#fff;color:#17202a;box-shadow:0 20px 60px #17202a30;font:14px/1.5 system-ui,-apple-system,sans-serif}
    .syllo-feedback-panel[hidden]{display:none}
    .syllo-feedback-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:10px 14px 10px 18px;background:#111827;color:#fff}
    .syllo-feedback-header strong{font-size:15px;font-weight:650}
    .syllo-feedback-window-controls{display:flex;align-items:center;gap:7px}
    .syllo-feedback-window-controls button{display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:transparent;color:#d1d5db;font:24px/1 system-ui;cursor:pointer}
    .syllo-feedback-window-controls button:hover{background:#ffffff1c;color:#fff}
    .syllo-feedback-content{overflow:auto;padding:16px}
    .syllo-feedback-prompt{margin:0 0 12px;color:#475569;font-size:14px;font-weight:600}
    .syllo-feedback-options{display:grid;gap:8px;margin:0 0 12px}
    .syllo-feedback-options button{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:10px 13px;border:1px solid #d9e1ea;border-radius:12px;background:#fff;color:#1f2937;text-align:right;font-family:inherit;font-size:14px;font-weight:500;line-height:1.4;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
    .syllo-feedback-options button:hover{border-color:#78cbd2;background:#f3fbfc}
    .syllo-feedback-options button.selected{border-color:#138c99;background:#e7f7f7;color:#086b78;font-weight:650}
    .syllo-feedback-options button.selected:after{content:'✓';display:grid;place-items:center;flex:0 0 20px;width:20px;height:20px;border-radius:50%;background:#0f7f91;color:#fff;font-size:12px}
    .syllo-feedback-panel textarea{display:block;width:100%;min-height:72px;margin:0 0 12px;padding:10px 12px;resize:vertical;border:1px solid #d9e1ea;border-radius:12px;background:#fff;color:#17202a;font-family:inherit;font-size:14px;line-height:1.5}
    .syllo-feedback-submit{display:block;min-width:92px;min-height:42px;margin-inline-start:auto;padding:9px 16px;border:1px solid #0f7f91;border-radius:11px;background:#0f7f91;color:#fff;font-family:inherit;font-size:14px;font-weight:600;line-height:1.4;cursor:pointer}
    .syllo-feedback-submit:hover:not(:disabled){background:#0b6b79}
    .syllo-feedback-submit:disabled{opacity:.45;cursor:default}
    .syllo-feedback-status{display:block;margin-top:10px;padding:0;font-weight:650}
    .syllo-feedback-status:empty{display:none}
    .syllo-feedback-status.success{color:#087a48}
    .syllo-feedback-status.error{padding:9px 11px;border:1px solid #fecdca;border-radius:10px;background:#fef3f2;color:#b42318}
    .syllo-feedback-panel.minimized .syllo-feedback-content{display:none}
    @media(max-width:520px){.syllo-feedback-trigger{right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px))}.syllo-feedback-panel{right:12px;bottom:calc(78px + env(safe-area-inset-bottom,0px));width:calc(100vw - 24px);max-height:calc(100vh - 96px - env(safe-area-inset-bottom,0px))}}
  `; document.head.appendChild(style);
  var activeObserver = new MutationObserver(syncSlideSelection); slides.forEach(function (slide) { activeObserver.observe(slide, { attributes: true, attributeFilter: ['class'] }); });
  syncSlideSelection();
  function mountFeedback() { var target = document.fullscreenElement || body; if (button.parentNode !== target) target.appendChild(button); if (panel.parentNode !== target) target.appendChild(panel); }
  document.addEventListener('fullscreenchange', mountFeedback);
  document.addEventListener('webkitfullscreenchange', mountFeedback);
  mountFeedback();
}());
