const OCR_CATEGORY_OPTIONS = ["服", "コスメ", "ガジェット", "その他"];
const OCR_STATUS_OPTIONS = ["OWNED", "WISHLIST", "HISTORY", "DISPOSED"];
const STORAGE_KEY = "monodata.ocr.beta.v1";

const state = {
  scriptUrl: "",
  ocrSourceHint: "auto",
  ocrImageDataUrl: "",
  ocrStatusText: "画像を選択してください",
  ocrRawText: "",
  ocrResult: emptyOcrResult_(),
};

function emptyOcrResult_() {
  return {
    source: "unknown",
    order: {
      order_id: null,
      order_date: null,
      total_paid: null,
      payment_method: null,
      status: null,
    },
    items: [],
    raw: {
      ocr_text: "",
    },
  };
}

function persist_() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restore_() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return;
    state.scriptUrl = String(saved.scriptUrl || "");
    state.ocrSourceHint = String(saved.ocrSourceHint || "auto");
    state.ocrImageDataUrl = String(saved.ocrImageDataUrl || "");
    state.ocrStatusText = String(saved.ocrStatusText || "画像を選択してください");
    state.ocrRawText = String(saved.ocrRawText || "");
    state.ocrResult = saved.ocrResult || emptyOcrResult_();
  } catch (_e) {
    // ignore broken local state
  }
}

function withTimeout(promise, ms = 20000) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = () => reject(new Error("file_read_failed"));
    fr.readAsDataURL(file);
  });
}

function normalizeOcrTextSpacing_(text) {
  const src = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const jpChar = "[一-龯々〆ヵヶぁ-ゖァ-ヺー]";
  const betweenJp = new RegExp(`(${jpChar})[ \\t\\u3000]+(${jpChar})`, "g");
  return src
    .split("\n")
    .map((line) => {
      let out = line;
      let prev = "";
      while (prev !== out) {
        prev = out;
        out = out.replace(betweenJp, "$1$2");
      }
      return out;
    })
    .join("\n");
}

function parseMoneyValue_(text) {
  const src = String(text || "");
  const matches = src.match(/\d[\d,\.]*/g);
  if (!matches || !matches.length) return null;
  const values = matches
    .map((m) => Number(String(m).replace(/[,.]/g, "")))
    .filter((n) => Number.isFinite(n));
  return values.length ? Math.max(...values) : null;
}

function parseOrderDate_(text) {
  const src = String(text || "");
  const m = src.match(/(\d{4})[\/\-\.年]\s*(\d{1,2})[\/\-\.月]\s*(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

function detectSourceFromText_(text, hint = "auto") {
  if (hint && hint !== "auto") return hint;
  const src = String(text || "");
  if (/amazon|アマゾン/i.test(src)) return "amazon";
  if (/qoo10|キューテン/i.test(src)) return "qoo10";
  return "unknown";
}

function extractOrderId_(text) {
  const src = String(text || "");
  const amazon = src.match(/\b\d{3}-\d{7}-\d{7}\b/);
  if (amazon) return amazon[0];
  const lines = src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const m = line.match(/(?:注文番号|注文ID|Order\s*ID|Order Number|取引番号)[^\w]{0,8}([A-Z0-9\-]{6,})/i);
    if (m) return m[1];
  }
  return null;
}

function extractOrderMeta_(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let totalPaid = null;
  let paymentMethod = null;
  let status = null;
  let orderDate = parseOrderDate_(text);

  for (const line of lines) {
    if (orderDate == null && /(注文日|購入日|order date|date)/i.test(line)) orderDate = parseOrderDate_(line);
    if (totalPaid == null && /(合計|注文合計|total|お支払い金額|請求額)/i.test(line)) totalPaid = parseMoneyValue_(line);
    if (paymentMethod == null && /(支払|payment|カード|amazon pay|paypal|コンビニ)/i.test(line)) {
      paymentMethod = line.replace(/^.*?(支払方法|Payment Method)[:：]?\s*/i, "").trim() || line;
    }
    if (status == null && /(注文状況|配送状況|status|配達|発送)/i.test(line)) {
      status = line.replace(/^.*?(注文状況|配送状況|status)[:：]?\s*/i, "").trim() || line;
    }
  }

  return {
    order_id: extractOrderId_(text),
    order_date: orderDate,
    total_paid: totalPaid,
    payment_method: paymentMethod,
    status,
  };
}

function isLikelyOcrItemNameLine_(line) {
  const v = String(line || "").trim();
  if (!v || v.length < 2 || v.length > 120) return false;
  if (/^[¥￥\d,\.\-\s円]+$/.test(v)) return false;
  if (/^(数量|qty|個数|送料|決済金額|お支払い金額|注文番号|注文日|カート番号)/i.test(v)) return false;
  if (/^(受取確認|送料無料|無料)$/i.test(v)) return false;
  if (/amazon|qoo10|ヘルプ|クーポン|ポイント/i.test(v)) return false;
  return true;
}

function extractItemsFromQoo10_(text) {
  const rawLines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const isHardNoise = (line) => /(商品名|数量|決済金額|送料|受取確認|送料無料|無料|クーポン|ポイント|配送|注文状況|qoo10|leio)/i.test(line);
  const isCartMeta = (line) => /(カート番号|注文日|\(\d{4}\/\d{2}\/\d{2}\)|\b\d{6,}\b)/i.test(line);
  const isGarbage = (line) => line.length <= 2 || /^[\W_ー—\-=\|]+$/.test(line) || /^[A-Za-z]{1,3}$/.test(line);
  const hasQtyLike = (line) => /(?:数量|qty|個数|x|×|==)\s*[:：]?\s*\d+/i.test(line) || /^\d{1,2}$/.test(line);

  function extractPrice_(line) {
    const normalized = String(line || "")
      .replace(/[OoＯｏ]/g, "0")
      .replace(/[lI｜]/g, "1")
      .replace(/[SsＳｓ]/g, "5")
      .replace(/[BＢ]/g, "8")
      .replace(/[gGｇＧ]/g, "9");
    const matches = normalized.match(/\d[\d,.\s]{2,}/g);
    if (!matches) return null;
    const values = matches
      .map((m) => Number(String(m).replace(/[^\d]/g, "")))
      .filter((n) => Number.isFinite(n) && n >= 50 && n <= 500000);
    return values.length ? Math.max(...values) : null;
  }

  const isPriceLine = (line) => {
    const price = extractPrice_(line);
    if (price == null) return false;
    if (/[¥￥円]/.test(line) || /決済金額|お支払い金額|price|無料|送料無料/i.test(line)) return true;
    return /^\d[\d,.\s]{2,}$/.test(line.trim());
  };

  function cleanNameFragment_(line) {
    return String(line || "")
      .replace(/(?:決済金額|お支払い金額|送料|無料|送料無料)/gi, " ")
      .replace(/[¥￥]?\s*\d[\d,.\s]{2,}\s*円?/g, " ")
      .replace(/[!！\[\]\(\)\|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const items = [];
  let nameParts = [];
  let pendingQty = null;

  function flushItem_(priceLine) {
    const price = extractPrice_(priceLine);
    if (price == null) return;
    const name = nameParts.join(" ").replace(/\s+/g, " ").trim();
    if (!name || !isLikelyOcrItemNameLine_(name)) {
      nameParts = [];
      pendingQty = null;
      return;
    }
    items.push({
      item_name: name,
      brand: null,
      variant: null,
      category: "服",
      status: "OWNED",
      price: Number(price),
      qty: Math.max(1, Number(pendingQty || 1)),
    });
    nameParts = [];
    pendingQty = null;
  }

  for (const line of rawLines) {
    if (isCartMeta(line)) {
      nameParts = [];
      pendingQty = null;
      continue;
    }
    if (isHardNoise(line) || isGarbage(line)) continue;

    if (hasQtyLike(line) && !isPriceLine(line)) {
      const m = line.match(/(\d{1,2})/);
      if (m) pendingQty = Number(m[1]);
      continue;
    }

    if (isPriceLine(line)) {
      const inlineName = cleanNameFragment_(line);
      if (inlineName && isLikelyOcrItemNameLine_(inlineName)) nameParts.push(inlineName);
      flushItem_(line);
      continue;
    }

    if (isLikelyOcrItemNameLine_(line)) nameParts.push(cleanNameFragment_(line));
  }

  const uniq = new Map();
  items.forEach((item) => {
    const key = `${String(item.item_name || "").toLowerCase()}::${item.price ?? ""}`;
    if (!uniq.has(key)) uniq.set(key, item);
  });
  return [...uniq.values()].slice(0, 20);
}

function extractItemsFromText_(text, source = "unknown") {
  if (source === "qoo10") {
    const qoo10Items = extractItemsFromQoo10_(text);
    if (qoo10Items.length) return qoo10Items;
  }

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const isQtyLine = (line) => /(?:^|\s)(?:数量|qty|個数|x|×)\s*[:：]?\s*\d+/i.test(line);
  const isPriceLine = (line) => /(お支払い金額|単価|価格|price|¥|￥|\d+\s*円)/i.test(line);
  const isNoiseLine = (line) => /(注文|お届け|配送|小計|合計|請求|クーポン|ポイント|注文番号|order id|status|履歴|ヘルプ|amazon|qoo10)/i.test(line);
  const isLikelyNameLine = (line) => {
    if (!line || line.length < 2) return false;
    if (isQtyLine(line) || isPriceLine(line)) return false;
    if (isNoiseLine(line)) return false;
    if (/^[¥￥\d,\.\-\s円]+$/.test(line)) return false;
    return true;
  };

  const items = [];
  let current = null;

  function pushCurrent_() {
    if (!current || !current.item_name) return;
    items.push({
      item_name: current.item_name,
      brand: current.brand || null,
      variant: current.variant || null,
      category: current.category || "服",
      status: current.status || "OWNED",
      price: current.price == null ? null : Number(current.price),
      qty: Math.max(1, Number(current.qty || 1)),
    });
  }

  for (const line of lines) {
    if (isLikelyNameLine(line)) {
      if (current) pushCurrent_();
      current = { item_name: line, brand: null, variant: null, category: "服", status: "OWNED", price: null, qty: 1 };
      continue;
    }
    if (!current) continue;
    if (isQtyLine(line)) {
      const m = line.match(/(\d+)/);
      if (m) current.qty = Number(m[1]);
      continue;
    }
    if (isPriceLine(line)) {
      const p = parseMoneyValue_(line);
      if (p != null) current.price = p;
      continue;
    }
    if (!isNoiseLine(line) && line.length <= 80) current.variant = current.variant ? `${current.variant} ${line}` : line;
  }

  if (current) pushCurrent_();
  if (!items.length) {
    items.push({ item_name: null, brand: null, variant: null, category: "服", status: "OWNED", price: null, qty: 1 });
  }
  return items;
}

function buildOcrResultFromText_(text, hint = "auto") {
  const result = emptyOcrResult_();
  result.source = detectSourceFromText_(text, hint);
  result.order = extractOrderMeta_(text);
  result.items = extractItemsFromText_(text, result.source);
  result.raw.ocr_text = String(text || "");
  return result;
}

function normalizeOcrCategory_(value) {
  const text = String(value || "").trim();
  if (OCR_CATEGORY_OPTIONS.includes(text)) return text;
  if (/服|衣類|トップス|ボトムス|アウター/i.test(text)) return "服";
  if (/コスメ|化粧|美容|メイク/i.test(text)) return "コスメ";
  if (/ガジェット|家電|デバイス|電子/i.test(text)) return "ガジェット";
  return "その他";
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render_() {
  const srcHint = document.getElementById("ocrSourceHint");
  const scriptUrl = document.getElementById("scriptUrl");
  const status = document.getElementById("ocrStatusText");
  const raw = document.getElementById("ocrRawText");
  const preview = document.getElementById("ocrPreviewImage");

  srcHint.value = state.ocrSourceHint;
  scriptUrl.value = state.scriptUrl;
  status.textContent = state.ocrStatusText;
  if (raw.value !== state.ocrRawText) raw.value = state.ocrRawText;

  if (state.ocrImageDataUrl) {
    preview.src = state.ocrImageDataUrl;
    preview.hidden = false;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
  }

  const ocr = state.ocrResult || emptyOcrResult_();
  const orderDate = document.getElementById("ocrOrderDate");
  const orderId = document.getElementById("ocrOrderId");
  const orderTotal = document.getElementById("ocrOrderTotal");
  const orderPayment = document.getElementById("ocrOrderPayment");
  orderDate.value = ocr.order?.order_date || "";
  orderId.value = ocr.order?.order_id || "";
  orderTotal.value = ocr.order?.total_paid ?? "";
  orderPayment.value = ocr.order?.payment_method || "";

  const tbody = document.getElementById("ocrItemRows");
  tbody.innerHTML = "";
  (ocr.items || []).forEach((item, idx) => {
    const tr = document.createElement("tr");
    const categoryOptions = OCR_CATEGORY_OPTIONS
      .map((c) => `<option value="${c}" ${normalizeOcrCategory_(item.category) === c ? "selected" : ""}>${c}</option>`)
      .join("");
    const statusValue = OCR_STATUS_OPTIONS.includes(String(item.status || "").toUpperCase()) ? String(item.status || "").toUpperCase() : "OWNED";
    const statusOptions = OCR_STATUS_OPTIONS
      .map((s) => `<option value="${s}" ${statusValue === s ? "selected" : ""}>${s}</option>`)
      .join("");

    tr.innerHTML = `
      <td><textarea rows="2" data-ocr-item="${idx}" data-ocr-key="item_name">${escapeHtml_(item.item_name || "")}</textarea></td>
      <td><select data-ocr-item="${idx}" data-ocr-key="category">${categoryOptions}</select></td>
      <td><input data-ocr-item="${idx}" data-ocr-key="sub_category" value="${escapeHtml_(item.sub_category ?? item.variant ?? "")}" /></td>
      <td><input data-ocr-item="${idx}" data-ocr-key="brand" value="${escapeHtml_(item.brand || "")}" /></td>
      <td><select data-ocr-item="${idx}" data-ocr-key="status">${statusOptions}</select></td>
      <td><input type="number" min="1" data-ocr-item="${idx}" data-ocr-key="qty" value="${Math.max(1, Number(item.qty || 1))}" /></td>
      <td><input type="number" min="0" data-ocr-item="${idx}" data-ocr-key="price" value="${item.price ?? ""}" /></td>
      <td><button type="button" data-ocr-item-remove="${idx}">削除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function runOcrFromImage_() {
  if (!state.ocrImageDataUrl) {
    alert("画像を選択してください。");
    return;
  }
  const tesseract = globalThis.Tesseract;
  if (!tesseract || typeof tesseract.recognize !== "function") {
    alert("OCRライブラリの読み込みに失敗しました。");
    return;
  }

  state.ocrStatusText = "OCR実行中...";
  persist_();
  render_();

  try {
    const result = await tesseract.recognize(state.ocrImageDataUrl, "jpn+eng", {
      logger: (msg) => {
        if (!msg || !msg.status) return;
        if (typeof msg.progress === "number") {
          state.ocrStatusText = `${msg.status} ${Math.round(msg.progress * 100)}%`;
        } else {
          state.ocrStatusText = String(msg.status);
        }
        render_();
      },
    });

    const text = normalizeOcrTextSpacing_(String(result?.data?.text || ""));
    state.ocrRawText = text;
    state.ocrResult = buildOcrResultFromText_(text, state.ocrSourceHint || "auto");
    state.ocrStatusText = `OCR完了 ${new Date().toLocaleTimeString("ja-JP")}`;
    persist_();
    render_();
  } catch (error) {
    state.ocrStatusText = "OCR失敗";
    persist_();
    render_();
    alert(`OCRに失敗しました: ${error.message}`);
  }
}

function buildAddItemsPayloadFromOcr_() {
  const ocr = state.ocrResult || emptyOcrResult_();
  const imageUrl = /^https?:\/\//i.test(state.ocrImageDataUrl) ? state.ocrImageDataUrl : "";
  const items = (ocr.items || [])
    .filter((i) => i && i.item_name)
    .map((i) => ({
      item_name: String(i.item_name || "").trim() || null,
      brand: i.brand ? String(i.brand).trim() : null,
      variant: i.sub_category ? String(i.sub_category).trim() : (i.variant ? String(i.variant).trim() : null),
      category: normalizeOcrCategory_(i.category),
      status: OCR_STATUS_OPTIONS.includes(String(i.status || "").toUpperCase()) ? String(i.status || "").toUpperCase() : "OWNED",
      price: i.price == null || Number.isNaN(Number(i.price)) ? null : Number(i.price),
      qty: Math.max(1, Number(i.qty || 1)),
    }));

  return {
    action: "addItems",
    source: String(ocr.source || "unknown"),
    order: {
      order_id: ocr.order?.order_id || null,
      order_date: ocr.order?.order_date || null,
      total_paid: ocr.order?.total_paid == null ? null : Number(ocr.order.total_paid),
      payment_method: ocr.order?.payment_method || null,
      status: ocr.order?.status || null,
    },
    image_url: imageUrl,
    raw_text: ocr.raw?.ocr_text || state.ocrRawText || "",
    items,
  };
}

async function saveOcrResultToAppsScript_() {
  const url = String(state.scriptUrl || "").trim();
  if (!url) {
    alert("Apps Script URL を入力してください。");
    return;
  }

  const payload = buildAddItemsPayloadFromOcr_();
  if (!payload.items.length) {
    alert("登録できる商品がありません。");
    return;
  }

  state.ocrStatusText = "シートへ登録中...";
  persist_();
  render_();

  try {
    const res = await withTimeout(fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }));

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${errText}`.trim());
    }

    const responsePayload = await res.json().catch(() => null);
    if (responsePayload && responsePayload.ok === false) {
      throw new Error(responsePayload.error || "Apps Scriptが登録エラーを返しました");
    }

    state.ocrStatusText = `登録完了 ${new Date().toLocaleTimeString("ja-JP")}`;
    persist_();
    render_();
  } catch (error) {
    state.ocrStatusText = "登録失敗";
    persist_();
    render_();
    alert(`OCR結果の保存に失敗しました: ${error.message}`);
  }
}

function bindEvents_() {
  document.getElementById("ocrSourceHint").addEventListener("change", (e) => {
    state.ocrSourceHint = String(e.target.value || "auto");
    if (state.ocrRawText) {
      state.ocrResult = buildOcrResultFromText_(state.ocrRawText, state.ocrSourceHint);
    }
    persist_();
    render_();
  });

  document.getElementById("scriptUrl").addEventListener("change", (e) => {
    state.scriptUrl = String(e.target.value || "").trim();
    persist_();
  });

  document.getElementById("ocrImageInput").addEventListener("change", async (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = (input.files || [])[0];
    if (!file) return;
    try {
      state.ocrImageDataUrl = await fileToDataUrl(file);
      state.ocrStatusText = "OCR実行ボタンを押してください";
      persist_();
      render_();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("ocrRunBtn").addEventListener("click", runOcrFromImage_);

  document.getElementById("ocrParseBtn").addEventListener("click", () => {
    const rawEl = document.getElementById("ocrRawText");
    const text = normalizeOcrTextSpacing_(rawEl.value || "");
    state.ocrRawText = text;
    state.ocrResult = buildOcrResultFromText_(text, state.ocrSourceHint || "auto");
    state.ocrStatusText = "テキスト再解析完了";
    persist_();
    render_();
  });

  document.getElementById("ocrSaveBtn").addEventListener("click", saveOcrResultToAppsScript_);

  document.getElementById("ocrOrderDate").addEventListener("input", (e) => {
    state.ocrResult.order.order_date = String(e.target.value || "") || null;
    persist_();
  });
  document.getElementById("ocrOrderId").addEventListener("input", (e) => {
    state.ocrResult.order.order_id = String(e.target.value || "") || null;
    persist_();
  });
  document.getElementById("ocrOrderTotal").addEventListener("input", (e) => {
    const n = String(e.target.value || "").trim();
    state.ocrResult.order.total_paid = n === "" ? null : Number(n);
    persist_();
  });
  document.getElementById("ocrOrderPayment").addEventListener("input", (e) => {
    state.ocrResult.order.payment_method = String(e.target.value || "") || null;
    persist_();
  });

  document.getElementById("ocrItemRows").addEventListener("input", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    const idx = Number(target.dataset.ocrItem || -1);
    const key = target.dataset.ocrKey || "";
    const items = state.ocrResult.items || [];
    if (idx < 0 || idx >= items.length) return;
    const item = items[idx];
    if (!item) return;

    if (key === "qty") item.qty = Math.max(1, Number(target.value || 1));
    else if (key === "price") item.price = String(target.value || "").trim() === "" ? null : Number(target.value);
    else if (key === "category") item.category = normalizeOcrCategory_(target.value);
    else if (key === "status") item.status = OCR_STATUS_OPTIONS.includes(String(target.value || "").toUpperCase()) ? String(target.value).toUpperCase() : "OWNED";
    else item[key] = String(target.value || "");
    persist_();
  });

  document.getElementById("ocrItemRows").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-ocr-item-remove]") : null;
    if (!btn) return;
    const idx = Number(btn.dataset.ocrItemRemove || -1);
    if (idx < 0 || idx >= state.ocrResult.items.length) return;
    state.ocrResult.items.splice(idx, 1);
    persist_();
    render_();
  });

  document.getElementById("ocrAddItemBtn").addEventListener("click", () => {
    state.ocrResult.items.push({
      item_name: "",
      brand: null,
      sub_category: null,
      category: "その他",
      status: "OWNED",
      price: null,
      qty: 1,
    });
    persist_();
    render_();
  });
}

function init_() {
  restore_();
  if (!state.ocrResult || typeof state.ocrResult !== "object") state.ocrResult = emptyOcrResult_();
  if (!state.ocrResult.order) state.ocrResult.order = emptyOcrResult_().order;
  if (!Array.isArray(state.ocrResult.items)) state.ocrResult.items = [];
  bindEvents_();
  render_();
}

init_();
