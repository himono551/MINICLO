let popupWindowId = null;
const CAPTURE_WINDOW_WIDTH = 460;
const CAPTURE_WINDOW_HEIGHT = 620;
const CAPTURE_WINDOW_TOP = 100;
const CAPTURE_WINDOW_LEFT = 24;

async function openOrFocusCaptureWindow() {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, {
        width: CAPTURE_WINDOW_WIDTH,
        height: CAPTURE_WINDOW_HEIGHT,
        top: CAPTURE_WINDOW_TOP,
        left: CAPTURE_WINDOW_LEFT,
        focused: true
      });
      return;
    } catch (err) {
      popupWindowId = null;
    }
  }

  const created = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: CAPTURE_WINDOW_WIDTH,
    height: CAPTURE_WINDOW_HEIGHT,
    top: CAPTURE_WINDOW_TOP,
    left: CAPTURE_WINDOW_LEFT,
    focused: true,
  });
  popupWindowId = created && typeof created.id === 'number' ? created.id : null;
}

chrome.action.onClicked.addListener(function() {
  openOrFocusCaptureWindow().catch(function() {});
});

chrome.windows.onRemoved.addListener(function(windowId) {
  if (windowId === popupWindowId) popupWindowId = null;
});
