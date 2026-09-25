chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['config.js', 'auto-start.js', 'tracker.js'] });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        if (globalThis.__lecturerReflection) globalThis.__lecturerReflection();
        else globalThis.__lecturerReflectionOpenRequested = true;
      }
    });
    await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    await chrome.action.setTitle({ tabId: tab.id, title: 'Open a lesson HTML page first (allow file URL access for local files).' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'START_LECTURER_REFLECTION' || !sender.tab?.id) return;
  chrome.scripting.executeScript({ target: { tabId: sender.tab.id, allFrames: true }, files: ['config.js', 'tracker.js'] })
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});
