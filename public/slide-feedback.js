(function () {
  'use strict';
  var body = document.body;
  if (!body || (!document.querySelector('.deck') && !body.dataset.lessonId)) return;
  var types = [
    ['NOT_UNDERSTOOD', 'לא הבנתי'], ['NEED_EXAMPLE', 'צריך עוד דוגמה'],
    ['QUESTION', 'יש לי שאלה'], ['POSSIBLE_ERROR', 'נראה שיש טעות']
  ];
  var clientKey = 'syllo:anonymous-client-id';
  var clientId = localStorage.getItem(clientKey);
  if (!clientId) { clientId = crypto.randomUUID(); localStorage.setItem(clientKey, clientId); }
  var button = document.createElement('button'); button.className = 'syllo-feedback-trigger'; button.type = 'button'; button.textContent = '?'; button.setAttribute('aria-label', 'משוב על השקף הנוכחי');
  var panel = document.createElement('div'); panel.className = 'syllo-feedback-panel'; panel.hidden = true; panel.dir = 'rtl';
  panel.innerHTML = '<strong>מה תרצו לשתף?</strong><div class="syllo-feedback-options"></div><textarea maxlength="800" placeholder="אפשר להוסיף כמה מילים (אופציונלי)" hidden></textarea><button class="syllo-feedback-submit" type="button" disabled>שליחה</button><span class="syllo-feedback-status" role="status"></span>';
  var options = panel.querySelector('.syllo-feedback-options'), text = panel.querySelector('textarea'), submit = panel.querySelector('.syllo-feedback-submit'), status = panel.querySelector('.syllo-feedback-status'), selected = null, lastSubmit = '';
  types.forEach(function (item) { var option = document.createElement('button'); option.type = 'button'; option.textContent = item[1]; option.dataset.type = item[0]; option.addEventListener('click', function () { selected = item[0]; options.querySelectorAll('button').forEach(function (b) { b.classList.toggle('selected', b === option); }); text.hidden = selected !== 'QUESTION' && selected !== 'POSSIBLE_ERROR'; submit.disabled = false; }); options.appendChild(option); });
  button.addEventListener('click', function () { panel.hidden = !panel.hidden; if (!panel.hidden) options.querySelector('button').focus(); });
  submit.addEventListener('click', function () {
    if (!selected || submit.disabled || lastSubmit === selected) return;
    var slide = document.querySelector('.slide.active') || document.querySelector('.tab-content.active'); if (!slide) return;
    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide')); if (!slides.length) slides = Array.prototype.slice.call(document.querySelectorAll('.tab-content'));
    var slideId = slide.dataset.slideId || slide.id || 'slide-' + (slides.indexOf(slide) + 1);
    var payload = { anonymousClientId: clientId, courseId: body.dataset.courseId || 'unknown', lessonId: body.dataset.lessonId || 'unknown', slideId: slideId, slideNumber: slides.indexOf(slide) + 1, deckVersion: body.dataset.deckVersion || 'unknown', feedbackType: selected, optionalComment: text.hidden ? '' : text.value, submittedAt: new Date().toISOString(), pageUrl: location.href, idempotencyKey: selected + ':' + slideId + ':' + Math.floor(Date.now() / 5000) };
    submit.disabled = true; lastSubmit = selected;
    fetch('/api/student/slide-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).then(function (response) { if (!response.ok) throw new Error(response.status === 400 ? 'פרטי השקף לא תקינים. רעננו את המערך ונסו שוב.' : response.status === 503 ? 'השמירה אינה זמינה כרגע. נסו שוב בעוד רגע.' : 'לא הצלחנו לשמור את המשוב. נסו שוב.');
      if (window.gtag) window.gtag('event', 'student_feedback_submitted', { course_id: payload.courseId, lesson_id: payload.lessonId, slide_id: payload.slideId, feedback_type: payload.feedbackType });
      else { window.dataLayer = window.dataLayer || []; window.dataLayer.push(['event', 'student_feedback_submitted', { course_id: payload.courseId, lesson_id: payload.lessonId, slide_id: payload.slideId, feedback_type: payload.feedbackType }]); }
      status.className = 'syllo-feedback-status success'; status.textContent = '✓ נשלח'; setTimeout(function () { panel.hidden = true; status.textContent = ''; status.className = 'syllo-feedback-status'; selected = null; lastSubmit = ''; submit.disabled = true; options.querySelectorAll('button').forEach(function (b) { b.classList.remove('selected'); }); text.value = ''; }, 850);
    }).catch(function (error) { status.className = 'syllo-feedback-status error'; status.textContent = error instanceof TypeError ? 'לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.' : error.message || 'לא הצלחנו לשלוח. נסו שוב.'; submit.disabled = false; lastSubmit = ''; });
  });
  var style = document.createElement('style'); style.textContent = '.syllo-feedback-trigger{position:fixed;top:20px;right:20px;left:auto;z-index:2147483647;width:38px;height:38px;border:1px solid currentColor;border-radius:50%;background:rgba(255,255,255,.96);font-weight:700;cursor:pointer}.syllo-feedback-panel{position:fixed;top:66px;right:20px;left:auto;z-index:2147483647;width:230px;padding:14px;background:#fff;color:#1a1a1a;border:1px solid #ddd;box-shadow:0 8px 24px #0002;font:14px system-ui}.syllo-feedback-options{display:grid;gap:6px;margin:10px 0}.syllo-feedback-options button,.syllo-feedback-submit{padding:7px;border:1px solid #bbb;background:#fafafa;cursor:pointer}.syllo-feedback-options button.selected{background:#dff5ea;border-color:#008f4d}.syllo-feedback-panel textarea{width:100%;margin:2px 0 8px;min-height:58px;resize:vertical}.syllo-feedback-submit:disabled{opacity:.5;cursor:default}.syllo-feedback-status{display:block;margin-top:8px;font-weight:700}.syllo-feedback-status.success{color:#008f4d}.syllo-feedback-status.error{color:#b42318;background:#fef3f2;border:1px solid #fecdca;border-radius:6px;padding:7px}'; document.head.appendChild(style);
  function mountFeedback() { var target = document.fullscreenElement || body; if (button.parentNode !== target) target.appendChild(button); if (panel.parentNode !== target) target.appendChild(panel); }
  document.addEventListener('fullscreenchange', mountFeedback);
  document.addEventListener('webkitfullscreenchange', mountFeedback);
  mountFeedback();
}());
