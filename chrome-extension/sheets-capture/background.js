let popupWindowId = null;

async function openOrFocusCaptureWindow() {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch (err) {
      popupWindowId = null;
    }
  }

  const created = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 460,
    height: 860,
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
