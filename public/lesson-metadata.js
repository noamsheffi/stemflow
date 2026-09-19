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
})();
