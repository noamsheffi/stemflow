/* Shared lesson template metadata. Preserve authored IDs and all timing values. */
(() => {
  const deck = document.querySelector('.deck');
  if (!deck) return;
  const body = document.body;
  const path = location.pathname.match(/\/(?:course|courses)\/([^/]+)\/(lesson-\d+)/);
  if (path) {
    body.dataset.courseId ||= path[1];
    body.dataset.lessonId ||= path[2];
  }
  if (!body.dataset.lessonId) return;
  deck.querySelectorAll('.slide').forEach((slide, index) => {
    if (!slide.dataset.slideId) {
      slide.dataset.slideId = `${body.dataset.lessonId}-slide-${String(index + 1).padStart(2, '0')}`;
      slide.dataset.slideIdSource = 'index-fallback';
    }
  });

  // Anonymous learning signals: lesson and slide usage only. Respect Do Not Track.
  if (navigator.doNotTrack === '1' || !window.fetch || !crypto.randomUUID) return;
  const clientKey = 'syllo:anonymous-learning-client-id';
  let clientId;
  try {
    clientId = localStorage.getItem(clientKey) || crypto.randomUUID();
    localStorage.setItem(clientKey, clientId);
  } catch { return; }
  const sessionId = crypto.randomUUID();
  let activeIndex = -1;
  let openedAt = null;
  const slides = [...deck.querySelectorAll('.slide')];
  const send = (eventType, extra = {}) => {
    const payload = {
      anonymous_client_id: clientId,
      session_id: sessionId,
      course_id: body.dataset.courseId,
      lesson_id: body.dataset.lessonId,
      deck_version: body.dataset.deckVersion || null,
      event_type: eventType,
      slide_id: null,
      slide_number: null,
      active_duration_ms: null,
      occurred_at: new Date().toISOString(),
      ...extra,
    };
    fetch('/api/learning-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  };
  const closeActiveSlide = () => {
    if (activeIndex < 0 || openedAt === null) return;
    const slide = slides[activeIndex];
    send('slide_viewed', { slide_id: slide.dataset.slideId, slide_number: activeIndex + 1, active_duration_ms: Math.round(performance.now() - openedAt) });
    openedAt = null;
  };
  const transition = () => {
    const next = slides.findIndex(slide => slide.classList.contains('active'));
    if (next === activeIndex) return;
    closeActiveSlide();
    activeIndex = next;
    if (next >= 0 && document.visibilityState === 'visible') openedAt = performance.now();
  };
  const visibility = () => {
    if (document.visibilityState === 'visible' && activeIndex >= 0 && openedAt === null) openedAt = performance.now();
    else if (document.visibilityState !== 'visible') closeActiveSlide();
  };
  slides.forEach(slide => new MutationObserver(transition).observe(slide, { attributes: true, attributeFilter: ['class'] }));
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', () => { closeActiveSlide(); send('lesson_ended'); });
  send('lesson_started');
  transition();
})();
