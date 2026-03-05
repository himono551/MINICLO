const FIELD_IDS = [
  'site',
  'url',
  'name',
  'brand',
  'type',
  'item_status',
  'category',
  'category2',
  'color',
  'purchase_date',
  'price',
  'image_url',
  'memo',
  'raw_text',
];

// 任意: よく使うGAS URLを固定したい場合はここに入れる
const DEFAULT_APPS_SCRIPT_URL = '';
const POPUP_STATE_KEY = 'sheetCapturePopupStateV1';
let isSaving = false;
let persistTimer = null;

function $(id) {
  return document.getElementById(id);
}

function normalizeTypeValue_(value) {
  var raw = String(value || '').trim();
  if (!raw) return '未分類';
  if (/^product$/i.test(raw)) return '未分類';
  if (/衣類|衣服|clothes?|fashion/i.test(raw)) return '衣服';
  if (/コスメ|cosmetics?|makeup|beauty/i.test(raw)) return 'コスメ';
  if (/ガジェット|家電|デバイス|電子|gadget|device|electronics?/i.test(raw)) return 'ガジェット';
  if (/未分類|uncategorized|unknown|none|n\/a/i.test(raw)) return '未分類';
  return '未分類';
}

function normalizeItemStatusValue_(value) {
  var raw = String(value || '').trim();
  if (!raw) return 'ほしい';
  if (/^wish$/i.test(raw)) return 'ほしい';
  if (/^owned$/i.test(raw)) return 'もってる';
  if (/^disposed$/i.test(raw)) return '手放す';
  if (/ほしい|欲しい|want|wish/i.test(raw)) return 'ほしい';
  if (/もってる|持ってる|owned|have|own/i.test(raw)) return 'もってる';
  if (/手放す|dispose|drop|discard/i.test(raw)) return '手放す';
  return 'ほしい';
}

function updateImagePreview_() {
  var input = $('image_url');
  var preview = $('imagePreview');
  if (!input || !preview) return;
  var url = String(input.value || '').trim();
  if (!url) {
    preview.removeAttribute('src');
    preview.classList.remove('is-visible');
    return;
  }
  preview.src = url;
  preview.classList.add('is-visible');
}

function setStatus(message, kind) {
  const el = $('status');
  el.textContent = message || '';
  const safeKind = kind === 'error' || kind === 'loading' ? kind : 'ok';
  el.className = 'status ' + safeKind;
  schedulePersistPopupState_();
}

function setSavingState_(saving) {
  isSaving = !!saving;
  const saveBtn = $('saveBtn');
  const extractBtn = $('extractBtn');
  if (saveBtn) {
    saveBtn.disabled = !!saving;
    saveBtn.classList.toggle('is-loading', !!saving);
    saveBtn.textContent = saving ? 'Saving…' : 'Save to Sheet';
  }
  if (extractBtn) extractBtn.disabled = !!saving;
}

function collectRawForm_() {
  const data = {};
  FIELD_IDS.forEach(function(id) {
    data[id] = $(id).value == null ? '' : String($(id).value);
  });
  return data;
}

function schedulePersistPopupState_() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(function() {
    const statusEl = $('status');
    const payload = {
      scriptUrl: $('scriptUrl').value.trim(),
      fields: collectRawForm_(),
      status: {
        text: statusEl ? statusEl.textContent : '',
        kind: statusEl ? String(statusEl.className || '').replace('status', '').trim() : '',
      },
      savedAt: Date.now(),
    };
    chrome.storage.local.set({ [POPUP_STATE_KEY]: payload });
  }, 120);
}

function loadPopupState_() {
  return new Promise(function(resolve) {
    chrome.storage.local.get([POPUP_STATE_KEY], function(result) {
      resolve(result[POPUP_STATE_KEY] || null);
    });
  });
}

function restorePopupState_(state) {
  if (!state || typeof state !== 'object') return;
  if (state.scriptUrl) $('scriptUrl').value = String(state.scriptUrl);
  const fields = state.fields || {};
  FIELD_IDS.forEach(function(id) {
    if (Object.prototype.hasOwnProperty.call(fields, id)) {
      $(id).value = fields[id] == null ? '' : String(fields[id]);
    }
  });
  $('type').value = normalizeTypeValue_($('type').value);
  $('item_status').value = normalizeItemStatusValue_($('item_status').value);
  $('category').value = '未分類';
  updateImagePreview_();
  if (state.status && state.status.text) {
    setStatus(String(state.status.text), String(state.status.kind || 'ok'));
  }
}

function collectForm() {
  const payload = {};
  FIELD_IDS.forEach(function(id) {
    payload[id] = $(id).value.trim();
  });
  if (payload.price === '') payload.price = null;
  return payload;
}

function fillForm(data) {
  FIELD_IDS.forEach(function(id) {
    if (Object.prototype.hasOwnProperty.call(data, id)) {
      $(id).value = data[id] == null ? '' : String(data[id]);
    }
  });
  $('type').value = normalizeTypeValue_($('type').value);
  $('item_status').value = normalizeItemStatusValue_($('item_status').value);
  $('category').value = '未分類';
  updateImagePreview_();
  schedulePersistPopupState_();
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true });
  if (!tabs || !tabs.length) return null;
  const nonExtension = tabs
    .filter(function(tab) {
      const url = String(tab && tab.url ? tab.url : '');
      return /^https?:\/\//i.test(url);
    })
    .sort(function(a, b) {
      return Number(b.lastAccessed || 0) - Number(a.lastAccessed || 0);
    });
  return nonExtension.length ? nonExtension[0] : tabs[0];
}

function isExtractableUrl(url) {
  const u = String(url || '');
  return /^https?:\/\//i.test(u);
}

function sendMessageToTab(tabId, message) {
  return new Promise(function(resolve) {
    chrome.tabs.sendMessage(tabId, message, function(response) {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        resolve({ ok: false, error: String(lastError.message || lastError) });
        return;
      }
      resolve(response);
    });
  });
}

async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function extractViaScripting(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function() {
        try {
          if (typeof window.__MONODATA_EXTRACT_PRODUCT__ !== 'function') {
            return { ok: false, error: 'extractor_not_ready' };
          }
          return { ok: true, data: window.__MONODATA_EXTRACT_PRODUCT__() };
        } catch (err) {
          return { ok: false, error: String(err) };
        }
      },
    });
    return results && results[0] ? results[0].result : { ok: false, error: 'no_result' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function extractCurrentPage() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    setStatus('アクティブタブが見つかりません', 'error');
    return;
  }
  if (!isExtractableUrl(tab.url)) {
    setStatus('このページでは抽出できません（http/httpsページで実行してください）', 'error');
    return;
  }

  let res = await sendMessageToTab(tab.id, { type: 'extractProduct' });
  if (!res || !res.ok) {
    res = await extractViaScripting(tab.id);
  }
  if (!res || !res.ok) {
    const injected = await ensureContentScript(tab.id);
    if (injected) {
      res = await sendMessageToTab(tab.id, { type: 'extractProduct' });
      if (!res || !res.ok) {
        res = await extractViaScripting(tab.id);
      }
    }
  }
  if (!res || !res.ok) {
    const detail = res && res.error ? ' / ' + String(res.error) : '';
    setStatus('抽出に失敗しました（ページ再読み込み後に再試行）' + detail, 'error');
    return;
  }

  fillForm(res.data || {});
  setStatus('ページ情報を抽出しました', 'ok');
}

function getStoredScriptUrl() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(['appsScriptUrl'], function(result) {
      resolve(result.appsScriptUrl || '');
    });
  });
}

function saveScriptUrl(url) {
  return new Promise(function(resolve) {
    chrome.storage.local.set({ appsScriptUrl: url }, function() {
      resolve();
    });
  });
}

async function submitToSheet() {
  if (isSaving) return;
  const scriptUrl = $('scriptUrl').value.trim();
  if (!scriptUrl) {
    setStatus('Apps Script URL を入力してください', 'error');
    return;
  }

  const payload = collectForm();
  payload.type = normalizeTypeValue_(payload.type);
  payload.status = normalizeItemStatusValue_(payload.item_status);
  delete payload.item_status;
  payload.category = '未分類';
  if (!payload.name) {
    setStatus('name は必須です', 'error');
    return;
  }

  setSavingState_(true);
  setStatus('送信中…', 'loading');
  await saveScriptUrl(scriptUrl);

  let res;
  try {
    const requestBody = { action: 'appendManualItem', ...payload, tag: payload.category2 || '' };
    res = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    setStatus('通信に失敗しました: ' + String(err), 'error');
    setSavingState_(false);
    return;
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    setStatus('レスポンスの解析に失敗しました', 'error');
    setSavingState_(false);
    return;
  }

  if (!json.ok) {
    setStatus('保存に失敗: ' + String(json.error || 'unknown error'), 'error');
    setSavingState_(false);
    return;
  }

  const meta = json.appended || {};
  const sheetName = meta.sheetName ? String(meta.sheetName) : '';
  const row = meta.row ? String(meta.row) : '';
  const invSheet = meta.inventorySheetName ? String(meta.inventorySheetName) : '';
  const invRow = meta.inventoryRow ? String(meta.inventoryRow) : '';
  const parts = [];
  if (sheetName) parts.push(sheetName + (row ? ' row:' + row : ''));
  if (invSheet) parts.push(invSheet + (invRow ? ' row:' + invRow : ''));
  const extra = parts.length ? (' [' + parts.join(' / ') + ']') : '';
  setStatus('シートに追加しました' + extra, 'ok');
  setSavingState_(false);
}

async function init() {
  const popupState = await loadPopupState_();
  restorePopupState_(popupState);

  const url = await getStoredScriptUrl();
  const initialUrl = (url || '').trim() || DEFAULT_APPS_SCRIPT_URL;
  if (!$('scriptUrl').value) $('scriptUrl').value = initialUrl;
  if (initialUrl && initialUrl !== url) {
    await saveScriptUrl(initialUrl);
  }

  $('scriptUrl').addEventListener('change', function() {
    const value = $('scriptUrl').value.trim();
    saveScriptUrl(value);
    schedulePersistPopupState_();
  });
  $('scriptUrl').addEventListener('blur', function() {
    const value = $('scriptUrl').value.trim();
    saveScriptUrl(value);
    schedulePersistPopupState_();
  });
  FIELD_IDS.forEach(function(id) {
    $(id).addEventListener('input', schedulePersistPopupState_);
    $(id).addEventListener('change', schedulePersistPopupState_);
  });
  $('type').addEventListener('change', function() {
    $('type').value = normalizeTypeValue_($('type').value);
    schedulePersistPopupState_();
  });
  $('item_status').addEventListener('change', function() {
    $('item_status').value = normalizeItemStatusValue_($('item_status').value);
    schedulePersistPopupState_();
  });
  $('image_url').addEventListener('input', function() {
    updateImagePreview_();
    schedulePersistPopupState_();
  });
  $('image_url').addEventListener('change', updateImagePreview_);
  $('type').value = normalizeTypeValue_($('type').value);
  $('item_status').value = normalizeItemStatusValue_($('item_status').value);
  $('category').value = '未分類';
  updateImagePreview_();

  $('extractBtn').addEventListener('click', function() {
    extractCurrentPage();
  });
  $('saveBtn').addEventListener('click', function() {
    submitToSheet();
  });

  const hasDraft = FIELD_IDS.some(function(id) {
    return String($(id).value || '').trim() !== '';
  });
  const tab = await getActiveTab();
  if (!hasDraft && tab && isExtractableUrl(tab.url)) {
    extractCurrentPage();
  }
}

init();
