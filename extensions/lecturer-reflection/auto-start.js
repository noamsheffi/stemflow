// Loaded only on the communication-systems area. Start tracking when a supported
// presentation appears, including client-side navigation from the lesson list.
globalThis.__lecturerReflectionAutoStart = true;

let requested = false;
let firstCheck = true;
const requestTracker = () => {
  const presentation = document.querySelector("[data-lesson-player], .deck .slide, .slides-container .slide");
  if (firstCheck) { firstCheck = false; if (presentation) return; }
  if (!presentation || requested || globalThis.__lecturerReflectionStarted) return;
  requested = true;
  chrome.runtime.sendMessage({ type: "START_LECTURER_REFLECTION" }).catch(() => { requested = false; });
};

new MutationObserver(requestTracker).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("popstate", requestTracker);
requestTracker();
