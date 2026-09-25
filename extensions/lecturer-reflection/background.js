chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['config.js', 'auto-start.js', 'tracker.js'] });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (globalThis.__lecturerReflection) globalThis.__lecturerReflection();
        else globalThis.__lecturerReflectionOpenRequested = true;
        return Boolean(globalThis.__lecturerReflection || globalThis.__lecturerReflectionOpenRequested);
      }
    });
    if (!result?.result) throw new Error('The lecturer panel did not initialize in the main page.');
    await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
    await chrome.action.setTitle({ tabId: tab.id, title: 'Syllo lecturer panel is open' });
  } catch (error) {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    await chrome.action.setTitle({ tabId: tab.id, title: error instanceof Error ? `Syllo panel: ${error.message}` : 'Open a Syllo lesson page and reload the extension.' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'START_LECTURER_REFLECTION' || !sender.tab?.id) return;
  chrome.scripting.executeScript({ target: { tabId: sender.tab.id }, files: ['config.js', 'tracker.js'] })
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});
