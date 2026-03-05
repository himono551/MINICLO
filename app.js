const STORAGE_KEY = "miniclo_state_v1";
const SYNC_TIMEOUT_MS = 20000;

const DUP_SYNONYMS = {
  tshirt: "t shirt",
  tee: "t shirt",
};

const COLOR_RULES = [
  ["白", "#f5f5f5"],
  ["黒", "#1f2937"],
  ["グレー", "#9ca3af"],
  ["灰", "#9ca3af"],
  ["ネイビー", "#1e3a8a"],
  ["紺", "#1e3a8a"],
  ["青", "#2563eb"],
  ["水色", "#38bdf8"],
  ["緑", "#16a34a"],
  ["カーキ", "#4d5d3a"],
  ["黄緑", "#84cc16"],
  ["黄", "#eab308"],
  ["ベージュ", "#d6b98c"],
  ["茶", "#8b5a2b"],
  ["ブラウン", "#8b5a2b"],
  ["オレンジ", "#f97316"],
  ["赤", "#dc2626"],
  ["ピンク", "#ec4899"],
  ["紫", "#7c3aed"],
];

const INVENTORY_DEFAULT_FIELDS = [
  { key: "category", label: "カテゴリ" },
  { key: "brand", label: "ブランド" },
  { key: "status", label: "状態" },
  { key: "fav", label: "お気に入り" },
  { key: "color", label: "色" },
  { key: "season", label: "季節" },
  { key: "tag", label: "タグ" },
  { key: "remaining", label: "残量" },
  { key: "memo", label: "メモ" },
  { key: "purchase_date", label: "購入日" },
  { key: "price", label: "価格" },
  { key: "capacity", label: "容量" },
  { key: "url", label: "URL" },
  { key: "qty", label: "数量" },
];

const SCOPE_TITLE = {
  all: "アイテム",
  clothes: "衣服",
  cosmetics: "コスメ",
  gadgets: "ガジェット",
  uncategorized: "未分類",
  lettinggo: "手放す",
};

const INVENTORY_SORT_FIELDS = [
  { key: "category", label: "カテゴリ" },
  { key: "tag", label: "タグ" },
  { key: "brand", label: "ブランド" },
  { key: "name", label: "名前" },
  { key: "status", label: "状態" },
  { key: "fav", label: "お気に入り" },
  { key: "color", label: "色" },
  { key: "season", label: "季節" },
  { key: "remaining", label: "残量" },
  { key: "purchase_date", label: "購入日" },
  { key: "price", label: "価格" },
  { key: "capacity", label: "容量" },
  { key: "qty", label: "数量" },
  { key: "updated_at", label: "更新日時" },
  { key: "created_at", label: "作成日時" },
];

const INVENTORY_DEFAULT_SORT_RULES = [
  { key: "category", dir: "asc" },
  { key: "tag", dir: "asc" },
  { key: "brand", dir: "asc" },
];

const OCR_CATEGORY_OPTIONS = ["服", "コスメ", "ガジェット", "その他"];
const OCR_STATUS_OPTIONS = ["OWNED", "WISHLIST", "HISTORY", "DISPOSED"];
const CATEGORY_TYPE_OPTIONS = ["衣服", "コスメ", "ガジェット", "未分類"];
const ITEM_STATUS_OPTIONS = ["ほしい", "もってる", "手放す"];

const CATEGORY_TABS_BY_SCOPE = {
  clothes: [
    { name: "トップス" },
    { name: "ボトムス" },
    { name: "アウター" },
    { name: "部屋着" },
    { name: "下着" },
    { name: "バッグ" },
    { name: "衣服その他" },
  ],
  cosmetics: [
    { name: "スキンケア" },
    { name: "ベースメイク" },
    { name: "ポイントメイク" },
    { name: "コスメその他" },
  ],
  gadgets: [
    { name: "ガジェットその他" },
  ],
};

const DASHBOARD_DONUT_COLORS = [
  "#d46767",
  "#d88b6b",
  "#d89f7a",
  "#c97d99",
  "#8f95d9",
  "#77b5b0",
  "#9cbf7a",
  "#c4a574",
];

const state = {
  categories: [],
  inventoryItems: [],
  deletedInventoryItems: [],
  wishlistItems: [],
  budgetMonths: [],
  behaviorEvents: [],
  ui: {
    tab: "dashboard",
    month: getCurrentMonth(),
    inventoryCategoryFilter: "all",
    inventoryTagsFilter: "",
    inventoryFiltersByContext: {},
    inventoryCustomizeByContext: {},
    inventoryScope: "all",
    inventoryView: "list",
    inventoryViewByScope: {
      all: "list",
      clothes: "gallery",
      cosmetics: "gallery",
      gadgets: "gallery",
      uncategorized: "gallery",
      lettinggo: "list",
    },
    inventoryFieldsPanelOpen: false,
    inventorySortPanelOpen: false,
    inventoryImageFitMode: "cover",
    inventoryCustomFields: [],
    inventoryFieldOrder: [],
    inventoryVisibleFields: {
      category: true,
      brand: true,
      status: true,
      fav: true,
      color: true,
      season: true,
      tag: true,
      remaining: true,
      purchase_date: true,
      price: true,
      capacity: true,
      url: true,
      qty: true,
    },
    inventoryAddModalOpen: false,
    inventoryModalOpen: false,
    inventoryModalItemId: null,
    inventoryModalDraft: null,
    inventorySortAuto: true,
    inventorySortRules: clone(INVENTORY_DEFAULT_SORT_RULES),
    dashboardTypeFilter: "all",
    wishlistView: "gallery",
    wishlistCategoryFilter: "all",
    autoSyncEnabled: false,
    autoSyncIntervalSec: 60,
    lastLoadedFingerprint: "",
    notifyOnAutoSync: false,
    lastSavedDataFingerprint: "",
    ocrSourceHint: "auto",
    ocrImageDataUrl: "",
    ocrStatusText: "画像を選択してください",
    ocrRawText: "",
    ocrResult: null,
    scriptUrl: "",
    syncStatus: "ローカル保存モード",
    sidebarMenuOpen: false,
  },
};

function getCurrentMonth() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}`;
}

function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function yen(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthFromDate(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSyncSaveButtonState_();
}

function normalizeTypeLabel_(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/衣類|衣服|clothes?|fashion/i.test(text)) return "衣服";
  if (/コスメ|cosmetics?|makeup|beauty/i.test(text)) return "コスメ";
  if (/ガジェット|家電|デバイス|電子|gadget|device|electronics?/i.test(text)) return "ガジェット";
  if (/未分類|uncategorized|unknown|none|n\/a/i.test(text)) return "未分類";
  return "";
}

function normalizeCategoryType_(value) {
  const type = normalizeTypeLabel_(value);
  if (type === "衣服" || type === "コスメ" || type === "ガジェット" || type === "未分類") return type;
  return "衣服";
}

function normalizeItemStatus_(value, fallback = "もってる") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  if (ITEM_STATUS_OPTIONS.includes(text)) return text;
  if (/wish|approved|hold|want|ほしい|欲しい/i.test(text)) return "ほしい";
  if (/owned|bought|own|持ってる|もってる|所持/i.test(text)) return "もってる";
  if (/drop|dropped|dispose|disposed|hand.?off|手放す|処分/i.test(text)) return "手放す";
  return fallback;
}

function inferCategoryTypeFromName_(categoryName) {
  const name = String(categoryName || "").trim();
  if (!name) return "衣服";
  if (CATEGORY_TABS_BY_SCOPE.clothes.some((x) => x.name === name)) return "衣服";
  if (CATEGORY_TABS_BY_SCOPE.cosmetics.some((x) => x.name === name)) return "コスメ";
  if (CATEGORY_TABS_BY_SCOPE.gadgets.some((x) => x.name === name)) return "ガジェット";
  return normalizeCategoryType_(name);
}

function scopeFromTypeLabel_(value) {
  const type = normalizeTypeLabel_(value);
  if (type === "衣服") return "clothes";
  if (type === "コスメ") return "cosmetics";
  if (type === "ガジェット") return "gadgets";
  return "uncategorized";
}

function defaultCategoryNameForType_(type) {
  if (type === "コスメ") return "コスメその他";
  if (type === "ガジェット") return "ガジェットその他";
  if (type === "未分類" || !type) return "未分類";
  return "衣服その他";
}

function normalizeCategoryNameForType_(categoryName, type) {
  const text = String(categoryName || "").trim();
  if ((type === "未分類" || !type) && (!text || text === "-" || text === "その他")) return "未分類";
  if (text === "服") return "衣服その他";
  if (text === "コスメ") return "コスメその他";
  if (text === "ガジェット") return "ガジェットその他";
  if (!text || text === "-" || text === "その他") return defaultCategoryNameForType_(type || "衣服");
  return text;
}

function normalizeInventoryItems() {
  state.inventoryItems = state.inventoryItems.map((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : parseTags(item.tags);
    const tag = String(item.tag || item.category2 || tags[3] || "");
    const rawCategoryName = String(item.category || getCategoryName(item.category_id) || "");
    const rawType = String(item.type || "");
    const normalizedType = normalizeTypeLabel_(rawType) || inferCategoryTypeFromName_(rawCategoryName);
    const normalizedCategory = normalizeCategoryNameForType_(rawCategoryName, normalizedType);
    const categoryId = ensureLocalCategoryIdByName_(normalizedCategory, normalizedType);
    return {
      ...item,
      category_id: categoryId,
      tags,
      category: normalizedCategory,
      type: normalizedType,
      brand: String(item.brand || tags[0] || ""),
      status: normalizeItemStatus_(item.status),
      fav: String(item.fav || ""),
      color: String(item.color || tags[1] || ""),
      season: String(item.season || tags[2] || ""),
      tag,
      category2: tag,
      remaining: String(item.remaining || item.qty || ""),
      memo: String(item.memo || ""),
      purchase_date: String(item.purchase_date || ""),
      price: item.price == null || item.price === "" ? null : Number(item.price),
      capacity: String(item.capacity || ""),
      url: String(item.url || ""),
      image_url: coalesceImageSource(item),
    };
  });
}

function normalizeCategories_() {
  if (!Array.isArray(state.categories)) state.categories = [];
  state.categories.forEach((cat, idx) => {
    if (!cat || typeof cat !== "object") return;
    cat.type = normalizeCategoryType_(cat.type || inferCategoryTypeFromName_(cat.name));
    cat.sort_order = Number(cat.sort_order || idx + 1);
  });
  normalizeCategorySortOrders_(getSortedCategories());
}

function ensureInventoryUiDefaults() {
  if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryFieldsPanelOpen")) state.ui.inventoryFieldsPanelOpen = false;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "inventorySortPanelOpen")) state.ui.inventorySortPanelOpen = false;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryImageFitMode")) state.ui.inventoryImageFitMode = "cover";
  if (!state.ui.inventoryViewByScope || typeof state.ui.inventoryViewByScope !== "object") {
    state.ui.inventoryViewByScope = {};
  }
  if (!state.ui.inventoryViewByScope.all) state.ui.inventoryViewByScope.all = "list";
  if (!state.ui.inventoryViewByScope.clothes) state.ui.inventoryViewByScope.clothes = "gallery";
  if (!state.ui.inventoryViewByScope.cosmetics) state.ui.inventoryViewByScope.cosmetics = "gallery";
  if (!state.ui.inventoryViewByScope.gadgets) state.ui.inventoryViewByScope.gadgets = "gallery";
  if (!state.ui.inventoryViewByScope.uncategorized) state.ui.inventoryViewByScope.uncategorized = "gallery";
  if (!state.ui.inventoryViewByScope.lettinggo) state.ui.inventoryViewByScope.lettinggo = "list";
  if (state.ui.inventoryScope === "other") state.ui.inventoryScope = "uncategorized";
  if (!["all", "clothes", "cosmetics", "gadgets", "uncategorized", "lettinggo"].includes(state.ui.inventoryScope || "")) {
    state.ui.inventoryScope = "all";
  }

  if (!state.ui.inventoryFiltersByContext || typeof state.ui.inventoryFiltersByContext !== "object") {
    state.ui.inventoryFiltersByContext = {};
  }
  if (!state.ui.inventoryCustomizeByContext || typeof state.ui.inventoryCustomizeByContext !== "object") {
    state.ui.inventoryCustomizeByContext = {};
  }
  if (!Array.isArray(state.ui.inventoryCustomFields)) state.ui.inventoryCustomFields = [];
  if (!Array.isArray(state.ui.inventoryFieldOrder)) state.ui.inventoryFieldOrder = [];
  if (!state.ui.inventoryVisibleFields || typeof state.ui.inventoryVisibleFields !== "object") {
    state.ui.inventoryVisibleFields = {};
  }
  if (!Object.prototype.hasOwnProperty.call(state.ui, "inventorySortAuto")) state.ui.inventorySortAuto = true;
  if (!Array.isArray(state.ui.inventorySortRules)) state.ui.inventorySortRules = clone(INVENTORY_DEFAULT_SORT_RULES);
  state.ui.inventorySortRules = state.ui.inventorySortRules.map((r) => {
    if (!r) return r;
    if (r.key === "category2") return { ...r, key: "tag" };
    return r;
  });
  state.ui.inventorySortRules = state.ui.inventorySortRules
    .filter((r) => r && INVENTORY_SORT_FIELDS.some((f) => f.key === r.key))
    .map((r) => ({ key: r.key, dir: r.dir === "desc" ? "desc" : "asc" }));
  if (!state.ui.inventorySortRules.length) state.ui.inventorySortRules = clone(INVENTORY_DEFAULT_SORT_RULES);
  if (!state.ui.ocrSourceHint) state.ui.ocrSourceHint = "auto";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "ocrImageDataUrl")) state.ui.ocrImageDataUrl = "";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "ocrStatusText")) state.ui.ocrStatusText = "画像を選択してください";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "ocrRawText")) state.ui.ocrRawText = "";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "ocrResult")) state.ui.ocrResult = null;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "sidebarMenuOpen")) state.ui.sidebarMenuOpen = false;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "dashboardTypeFilter")) state.ui.dashboardTypeFilter = "all";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "wishlistView")) state.ui.wishlistView = "gallery";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "wishlistCategoryFilter")) state.ui.wishlistCategoryFilter = "all";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "autoSyncEnabled")) state.ui.autoSyncEnabled = false;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "autoSyncIntervalSec")) state.ui.autoSyncIntervalSec = 60;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "lastLoadedFingerprint")) state.ui.lastLoadedFingerprint = "";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "notifyOnAutoSync")) state.ui.notifyOnAutoSync = false;
  if (!Object.prototype.hasOwnProperty.call(state.ui, "lastSavedDataFingerprint")) state.ui.lastSavedDataFingerprint = "";
  if (Object.prototype.hasOwnProperty.call(state.ui.inventoryVisibleFields, "category2")
    && !Object.prototype.hasOwnProperty.call(state.ui.inventoryVisibleFields, "tag")) {
    state.ui.inventoryVisibleFields.tag = !!state.ui.inventoryVisibleFields.category2;
  }
  state.ui.inventoryFieldOrder = state.ui.inventoryFieldOrder.map((k) => (k === "category2" ? "tag" : k));
  state.ui.inventoryCustomFields = state.ui.inventoryCustomFields.map((f) => {
    if (!f || f.key !== "category2") return f;
    return { ...f, key: "tag", label: "タグ" };
  });
  getInventoryFieldDefs().forEach(({ key }) => {
    if (!Object.prototype.hasOwnProperty.call(state.ui.inventoryVisibleFields, key)) {
      state.ui.inventoryVisibleFields[key] = true;
    }
  });
  normalizeInventoryFieldOrder_();
  ensureContextFilter_(currentInventoryContextKey_());
  ensureContextCustomize_(currentInventoryContextKey_());
}

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

function parseMoneyValue_(text) {
  const src = String(text || "");
  const matches = src.match(/\d[\d,\.]*/g);
  if (!matches || !matches.length) return null;
  const values = matches
    .map((m) => {
      const normalized = String(m).replace(/[,.]/g, "");
      return Number(normalized);
    })
    .filter((n) => Number.isFinite(n));
  if (!values.length) return null;
  return Math.max(...values);
}

function parseOrderDate_(text) {
  const src = String(text || "");
  const m = src.match(/(\d{4})[\/\-\.年]\s*(\d{1,2})[\/\-\.月]\s*(\d{1,2})/);
  if (!m) return null;
  const y = m[1];
  const mo = m[2].padStart(2, "0");
  const d = m[3].padStart(2, "0");
  return `${y}-${mo}-${d}`;
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
    if (orderDate == null && /(注文日|購入日|order date|date)/i.test(line)) {
      orderDate = parseOrderDate_(line);
    }
    if (totalPaid == null && /(合計|注文合計|total|お支払い金額|請求額)/i.test(line)) {
      totalPaid = parseMoneyValue_(line);
    }
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
  if (!v) return false;
  if (v.length < 2 || v.length > 120) return false;
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

  const isHardNoise = (line) =>
    /(商品名|数量|決済金額|送料|受取確認|送料無料|無料|クーポン|ポイント|配送|注文状況|qoo10|leio)/i.test(line);
  const isCartMeta = (line) =>
    /(カート番号|注文日|\(\d{4}\/\d{2}\/\d{2}\)|\b\d{6,}\b)/i.test(line);
  const isGarbage = (line) =>
    line.length <= 2 || /^[\W_ー—\-=\|]+$/.test(line) || /^[A-Za-z]{1,3}$/.test(line);
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
    if (!values.length) return null;
    return Math.max(...values);
  }

  const isPriceLine = (line) => {
    const price = extractPrice_(line);
    if (price == null) return false;
    if (/[¥￥円]/.test(line) || /決済金額|お支払い金額|price|無料|送料無料/i.test(line)) return true;
    return /^\d[\d,.\s]{2,}$/.test(line.trim());
  };

  function cleanNameFragment_(line) {
    let out = String(line || "");
    out = out
      .replace(/(?:決済金額|お支払い金額|送料|無料|送料無料)/gi, " ")
      .replace(/[¥￥]?\s*\d[\d,.\s]{2,}\s*円?/g, " ")
      .replace(/[!！\[\]\(\)\|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return out;
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
      if (inlineName && isLikelyOcrItemNameLine_(inlineName)) {
        nameParts.push(inlineName);
      }
      flushItem_(line);
      continue;
    }

    if (isLikelyOcrItemNameLine_(line)) {
      nameParts.push(cleanNameFragment_(line));
    }
  }

  // 金額行欠落の末尾ブロックは採用しない（誤検出抑制）
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
    if (!current) return;
    if (!current.item_name) return;
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
      current = {
        item_name: line,
        brand: null,
        variant: null,
        category: "服",
        status: "OWNED",
        price: null,
        qty: 1,
      };
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

    if (!isNoiseLine(line) && line.length <= 80) {
      current.variant = current.variant ? `${current.variant} ${line}` : line;
    }
  }
  if (current) pushCurrent_();

  if (!items.length) {
    items.push({
      item_name: null,
      brand: null,
      variant: null,
      category: "服",
      status: "OWNED",
      price: null,
      qty: 1,
    });
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

function buildAddItemsPayloadFromOcr_() {
  const ocr = state.ui.ocrResult || emptyOcrResult_();
  const rawImage = String(state.ui.ocrImageDataUrl || "");
  const imageUrl = /^https?:\/\//i.test(rawImage) ? rawImage : "";
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
    raw_text: ocr.raw?.ocr_text || state.ui.ocrRawText || "",
    items,
  };
}

async function saveOcrResultToAppsScript_() {
  const url = (state.ui.scriptUrl || "").trim();
  if (!url) {
    alert("Apps Script URL を入力してください。");
    return;
  }
  const payload = buildAddItemsPayloadFromOcr_();
  if (!payload.items.length) {
    alert("登録できる商品がありません。OCR全文を確認してから再解析してください。");
    return;
  }

  state.ui.ocrStatusText = "シートへ登録中...";
  persist();
  renderOcr();

  try {
    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }),
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${errText}`.trim());
    }
    const responsePayload = await res.json().catch(() => null);
    if (responsePayload && responsePayload.ok === false) {
      if (/Unsupported action/i.test(String(responsePayload.error || ""))) {
        throw new Error("Apps Scriptが古いバージョンです。Code.gsを再デプロイしてください。");
      }
      throw new Error(responsePayload.error || "Apps Scriptが登録エラーを返しました");
    }

    payload.items.forEach((it) => {
      const ocrCategory = normalizeOcrCategory_(it.category);
      const typeName =
        ocrCategory === "コスメ" ? "コスメ"
          : ocrCategory === "ガジェット" ? "ガジェット"
            : "衣服";
      const categoryName = normalizeCategoryNameForType_(ocrCategory, typeName);
      const categoryId = ensureLocalCategoryIdByName_(categoryName, typeName);
      const now = new Date().toISOString();
      const normalizedStatus = OCR_STATUS_OPTIONS.includes(String(it.status || "").toUpperCase()) ? String(it.status).toUpperCase() : "OWNED";
      state.inventoryItems.push({
        id: uuid(),
        name: String(it.item_name || "").trim(),
        category_id: categoryId,
        category: categoryName,
        type: typeName,
        brand: String(it.brand || "").trim(),
        status: normalizeItemStatus_(normalizedStatus, "もってる"),
        fav: "",
        color: "",
        season: "",
        tag: String(it.sub_category || it.variant || "").trim(),
        category2: String(it.sub_category || it.variant || "").trim(),
        remaining: "",
        purchase_date: payload.order?.order_date || "",
        price: it.price == null ? null : Number(it.price),
        capacity: "",
        url: "",
        tags: [String(it.brand || "").trim(), String(it.sub_category || it.variant || "").trim()].filter(Boolean),
        image_url: "",
        qty: Math.max(1, Number(it.qty || 1)),
        created_at: now,
        updated_at: now,
      });
    });

    state.ui.ocrStatusText = `登録完了 ${new Date().toLocaleTimeString("ja-JP")}`;
    persist();
    renderAll();
  } catch (error) {
    if (error instanceof TypeError) {
      try {
        await withTimeout(
          fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          }),
        );
        state.ui.ocrStatusText = `登録送信完了 ${new Date().toLocaleTimeString("ja-JP")}`;
        persist();
        renderOcr();
        return;
      } catch (_) {
        // fall through
      }
    }
    state.ui.ocrStatusText = "登録失敗";
    persist();
    renderOcr();
    alert(`OCR結果の保存に失敗しました: ${error.message}`);
  }
}

function normalizeOcrTextSpacing_(text) {
  const src = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const jpChar = "[一-龯々〆ヵヶぁ-ゖァ-ヺー]";
  const betweenJp = new RegExp(`(${jpChar})[ \\t\\u3000]+(${jpChar})`, "g");

  // 改行は保持し、行内の不要スペースだけ除去する
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

function loadScopeView_() {
  const scope = state.ui.inventoryScope || "all";
  const byScope = state.ui.inventoryViewByScope || {};
  const next = byScope[scope];
  state.ui.inventoryView = next === "gallery" ? "gallery" : "list";
}

function saveScopeView_() {
  const scope = state.ui.inventoryScope || "all";
  if (!state.ui.inventoryViewByScope || typeof state.ui.inventoryViewByScope !== "object") {
    state.ui.inventoryViewByScope = {};
  }
  state.ui.inventoryViewByScope[scope] = state.ui.inventoryView === "gallery" ? "gallery" : "list";
}

function getInventoryFieldDefs() {
  const customs = (state.ui.inventoryCustomFields || [])
    .filter((f) => f && f.key && f.label)
    .map((f) => ({ key: String(f.key), label: String(f.label) }));
  return [...INVENTORY_DEFAULT_FIELDS, ...customs];
}

function normalizeInventoryFieldOrder_() {
  const available = getInventoryFieldDefs().map((f) => f.key);
  const current = Array.isArray(state.ui.inventoryFieldOrder) ? state.ui.inventoryFieldOrder : [];
  const deduped = [];
  current.forEach((k) => {
    if (available.includes(k) && !deduped.includes(k)) deduped.push(k);
  });
  available.forEach((k) => {
    if (!deduped.includes(k)) deduped.push(k);
  });
  state.ui.inventoryFieldOrder = deduped;
}

function getOrderedInventoryFieldDefs_() {
  normalizeInventoryFieldOrder_();
  const defsByKey = {};
  getInventoryFieldDefs().forEach((f) => {
    defsByKey[f.key] = f;
  });
  return state.ui.inventoryFieldOrder
    .map((k) => defsByKey[k])
    .filter(Boolean);
}

function moveInventoryField_(dragKey, dropKey) {
  const order = [...state.ui.inventoryFieldOrder];
  const from = order.indexOf(dragKey);
  const to = order.indexOf(dropKey);
  if (from < 0 || to < 0 || from === to) return;
  const [moved] = order.splice(from, 1);
  order.splice(to, 0, moved);
  state.ui.inventoryFieldOrder = order;
}

function currentInventoryContextKey_() {
  return `${state.ui.inventoryScope || "all"}::${state.ui.inventoryView || "list"}`;
}

function ensureContextFilter_(key) {
  if (!state.ui.inventoryFiltersByContext[key]) {
    state.ui.inventoryFiltersByContext[key] = { category: "all", tags: "" };
  }
}

function loadContextFilter_() {
  const key = currentInventoryContextKey_();
  ensureContextFilter_(key);
  const f = state.ui.inventoryFiltersByContext[key];
  state.ui.inventoryCategoryFilter = String(f.category || "all");
  state.ui.inventoryTagsFilter = String(f.tags || "");
}

function saveContextFilter_() {
  const key = currentInventoryContextKey_();
  ensureContextFilter_(key);
  state.ui.inventoryFiltersByContext[key] = {
    category: String(state.ui.inventoryCategoryFilter || "all"),
    tags: String(state.ui.inventoryTagsFilter || ""),
  };
}

function defaultVisibleFields_() {
  const out = {};
  getInventoryFieldDefs().forEach(({ key }) => {
    out[key] = true;
  });
  return out;
}

function ensureContextCustomize_(key) {
  const existing = state.ui.inventoryCustomizeByContext[key] || {};
  const visible = existing.visibleFields && typeof existing.visibleFields === "object"
    ? { ...existing.visibleFields }
    : { ...defaultVisibleFields_(), ...(state.ui.inventoryVisibleFields || {}) };
  const fitMode = existing.imageFitMode || state.ui.inventoryImageFitMode || "cover";
  const order = Array.isArray(existing.fieldOrder) && existing.fieldOrder.length
    ? [...existing.fieldOrder]
    : [...(state.ui.inventoryFieldOrder || [])];

  state.ui.inventoryCustomizeByContext[key] = {
    visibleFields: visible,
    imageFitMode: fitMode === "fit" ? "fit" : "cover",
    fieldOrder: order,
  };

  const available = getInventoryFieldDefs().map((f) => f.key);
  available.forEach((k) => {
    if (!Object.prototype.hasOwnProperty.call(state.ui.inventoryCustomizeByContext[key].visibleFields, k)) {
      state.ui.inventoryCustomizeByContext[key].visibleFields[k] = true;
    }
  });
  const deduped = [];
  state.ui.inventoryCustomizeByContext[key].fieldOrder.forEach((k) => {
    if (available.includes(k) && !deduped.includes(k)) deduped.push(k);
  });
  available.forEach((k) => {
    if (!deduped.includes(k)) deduped.push(k);
  });
  state.ui.inventoryCustomizeByContext[key].fieldOrder = deduped;
}

function loadContextCustomize_() {
  const key = currentInventoryContextKey_();
  ensureContextCustomize_(key);
  const c = state.ui.inventoryCustomizeByContext[key];
  state.ui.inventoryVisibleFields = { ...c.visibleFields };
  state.ui.inventoryImageFitMode = c.imageFitMode;
  state.ui.inventoryFieldOrder = [...c.fieldOrder];
}

function saveContextCustomize_() {
  const key = currentInventoryContextKey_();
  ensureContextCustomize_(key);
  state.ui.inventoryCustomizeByContext[key] = {
    visibleFields: { ...(state.ui.inventoryVisibleFields || {}) },
    imageFitMode: state.ui.inventoryImageFitMode === "fit" ? "fit" : "cover",
    fieldOrder: [...(state.ui.inventoryFieldOrder || [])],
  };
}

function keyFromLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, "");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

function coalesceImageSource(item) {
  const raw = String(
    item?.image_url || item?.image || item?.product_image || item?.purchase_screenshot || "",
  ).trim();
  if (!raw) return "";
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\/[^\s)]+$/i.test(raw)) return raw;
  if (/^blob:/i.test(raw)) return raw;
  const match = raw.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : "";
}

function normalizeUrlForOpen_(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;
  return `https://${raw}`;
}

function setSyncStatus(message) {
  state.ui.syncStatus = message;
  const statusEl = document.getElementById("syncStatus");
  if (statusEl) statusEl.textContent = message;
}

function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const loaded = JSON.parse(raw);
    if (!loaded.categories || !loaded.inventoryItems || !loaded.wishlistItems) return false;
    Object.assign(state, loaded);
    if (!Array.isArray(state.deletedInventoryItems)) state.deletedInventoryItems = [];
    if (!state.ui) state.ui = { tab: "dashboard", month: getCurrentMonth() };
    if (!state.ui.month) state.ui.month = getCurrentMonth();
    if (!state.ui.tab) state.ui.tab = "dashboard";
    if (!state.ui.inventoryCategoryFilter) state.ui.inventoryCategoryFilter = "all";
    if (!state.ui.inventoryTagsFilter) state.ui.inventoryTagsFilter = "";
    if (!state.ui.inventoryScope) state.ui.inventoryScope = "all";
    if (!state.ui.inventoryView) state.ui.inventoryView = "list";
    if (!state.ui.dashboardTypeFilter) state.ui.dashboardTypeFilter = "all";
    ensureInventoryUiDefaults();
    loadScopeView_();
    if (Object.keys(state.ui.inventoryFiltersByContext || {}).length === 0) {
      saveContextFilter_();
    } else {
      loadContextFilter_();
    }
    if (Object.keys(state.ui.inventoryCustomizeByContext || {}).length === 0) {
      saveContextCustomize_();
    } else {
      loadContextCustomize_();
    }
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryAddModalOpen")) state.ui.inventoryAddModalOpen = false;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryModalOpen")) state.ui.inventoryModalOpen = false;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryModalItemId")) state.ui.inventoryModalItemId = null;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventoryModalDraft")) state.ui.inventoryModalDraft = null;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventorySortPanelOpen")) state.ui.inventorySortPanelOpen = false;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventorySortAuto")) state.ui.inventorySortAuto = true;
    if (!Object.prototype.hasOwnProperty.call(state.ui, "inventorySortRules")) {
      state.ui.inventorySortRules = clone(INVENTORY_DEFAULT_SORT_RULES);
    }
  if (!state.ui.scriptUrl) state.ui.scriptUrl = "";
  if (!state.ui.syncStatus) state.ui.syncStatus = "ローカル保存モード";
  if (!Object.prototype.hasOwnProperty.call(state.ui, "sidebarMenuOpen")) state.ui.sidebarMenuOpen = false;
    normalizeCategories_();
    normalizeInventoryItems();
    if (!state.ui.lastSavedDataFingerprint) {
      state.ui.lastSavedDataFingerprint = syncFingerprint_(exportSyncData());
    }
    return true;
  } catch {
    return false;
  }
}

function seedIfNeeded() {
  if (restore()) return;

  const clothes = {
    id: uuid(),
    name: "Clothes",
    type: "衣服",
    limit_count: 30,
    ideal_count: 20,
    sort_order: 1,
  };
  const cosmetics = {
    id: uuid(),
    name: "Cosmetics",
    type: "コスメ",
    limit_count: 20,
    ideal_count: 12,
    sort_order: 2,
  };

  state.categories = [clothes, cosmetics];
  state.inventoryItems = [
    {
      id: uuid(),
      name: "Black T Shirt",
      category_id: clothes.id,
      tags: ["black", "t shirt", "summer"],
      image_url: "",
      qty: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  state.deletedInventoryItems = [];
  state.wishlistItems = [];
  state.budgetMonths = [
    {
      id: uuid(),
      month: state.ui.month,
      budget_limit: 20000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  state.behaviorEvents = [];

  normalizeCategories_();
  persist();
}

function getSortedCategories() {
  return [...state.categories].sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeCategorySortOrders_(orderedCategories = getSortedCategories()) {
  orderedCategories.forEach((cat, idx) => {
    cat.sort_order = idx + 1;
  });
}

function scopeFromItemType_(item) {
  const source = String(item.type || "");
  return scopeFromTypeLabel_(source);
}

function getCategoryById(id) {
  return state.categories.find((c) => c.id === id) || null;
}

function getCategoryName(id) {
  return getCategoryById(id)?.name || "-";
}

function ensureLocalCategoryIdByName_(name, typeHint = "") {
  const target = String(name || "").trim() || "その他";
  const targetType = normalizeCategoryType_(typeHint || inferCategoryTypeFromName_(target));
  const found =
    state.categories.find((c) => String(c.name || "").trim() === target && normalizeCategoryType_(c.type) === targetType)
    || state.categories.find((c) => String(c.name || "").trim() === target);
  if (found) return found.id;

  const maxSort = Math.max(0, ...state.categories.map((c) => Number(c.sort_order || 0)));
  const category = {
    id: uuid(),
    name: target,
    type: targetType,
    limit_count: null,
    ideal_count: null,
    sort_order: maxSort + 1,
  };
  state.categories.push(category);
  return category.id;
}

function parseTags(text) {
  return String(text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferTypeFromCategoryName(categoryName) {
  return normalizeTypeLabel_(categoryName);
}

function inferTypeFromScope(scope) {
  if (scope === "clothes") return "衣服";
  if (scope === "cosmetics") return "コスメ";
  if (scope === "gadgets") return "ガジェット";
  if (scope === "uncategorized") return "未分類";
  return "";
}

function getColorHex(colorText) {
  const label = String(colorText || "");
  const found = COLOR_RULES.find(([key]) => label.includes(key));
  return found ? found[1] : "#cbd5e1";
}

function normalizeText(s) {
  const raw = String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");

  let out = raw;
  Object.entries(DUP_SYNONYMS).forEach(([k, v]) => {
    out = out.replaceAll(k, v);
  });
  return out;
}

function tokens(s) {
  return normalizeText(s)
    .split(" ")
    .filter(Boolean);
}

function jaccard(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  sa.forEach((x) => {
    if (sb.has(x)) inter += 1;
  });
  return inter / (sa.size + sb.size - inter);
}

function categoryCurrentCount(categoryId) {
  return state.inventoryItems
    .filter((item) => item.category_id === categoryId)
    .reduce((sum, item) => sum + (item.qty || 0), 0);
}

function categorySummary(category) {
  const current = categoryCurrentCount(category.id);
  const limit = category.limit_count;
  const ideal = category.ideal_count;

  return {
    current,
    limit,
    ideal,
    remaining: limit === null || limit === undefined ? null : limit - current,
    deltaToIdeal: ideal === null || ideal === undefined ? null : ideal - current,
  };
}

function budgetForMonth(month) {
  return state.budgetMonths.find((b) => b.month === month) || null;
}

function ensureBudgetMonth(month) {
  let found = budgetForMonth(month);
  if (!found) {
    found = {
      id: uuid(),
      month,
      budget_limit: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.budgetMonths.push(found);
  }
  return found;
}

function actualSpend(month) {
  return state.behaviorEvents
    .filter((e) => e.event_type === "purchase" && monthFromDate(e.date) === month)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

function plannedSpend(month, excludeWishlistId = null) {
  return state.wishlistItems
    .filter((w) => w.status === "approved")
    .filter((w) => monthFromDate(w.created_at) === month)
    .filter((w) => w.id !== excludeWishlistId)
    .reduce((sum, w) => sum + (w.price || 0), 0);
}

function duplicateCheck(wishlistItem) {
  const inSameCategory = state.inventoryItems.filter((i) => i.category_id === wishlistItem.category_id);
  const wNorm = normalizeText(wishlistItem.name);
  const wTokens = tokens(wishlistItem.name);

  if (!wNorm) return { status: "no_match", candidates: [] };

  const scored = inSameCategory
    .map((item) => {
      const iNorm = normalizeText(item.name);
      const iTokens = tokens(item.name);
      const score = jaccard(wTokens, iTokens);
      const containsAll = wTokens.length > 0 && wTokens.every((t) => iNorm.includes(t));
      const strong = iNorm === wNorm;
      return { item, strong, score, containsAll };
    })
    .filter((x) => x.strong || x.score >= 0.6 || x.containsAll)
    .sort((a, b) => Number(b.strong) - Number(a.strong) || b.score - a.score);

  if (scored.length === 0) return { status: "no_match", candidates: [] };
  if (scored[0].strong) {
    return {
      status: "likely_duplicate",
      candidates: scored.slice(0, 3).map((s) => s.item.id),
    };
  }

  return {
    status: "possible_duplicate",
    candidates: scored.slice(0, 3).map((s) => s.item.id),
  };
}

function budgetCheck(wishlistItem, month) {
  const budget = budgetForMonth(month);
  if (!budget || budget.budget_limit === null || budget.budget_limit === undefined) {
    return { status: "no_budget", remaining: null };
  }
  if (wishlistItem.price === null || wishlistItem.price === undefined || Number.isNaN(wishlistItem.price)) {
    return { status: "unknown_price", remaining: null };
  }

  const remaining = budget.budget_limit - (actualSpend(month) + plannedSpend(month, wishlistItem.id));
  return {
    status: wishlistItem.price <= remaining ? "within" : "over",
    remaining,
  };
}

function capacityCheck(wishlistItem) {
  const category = getCategoryById(wishlistItem.category_id);
  if (!category) return { status: "no_limit", remaining: null };
  if (category.limit_count === null || category.limit_count === undefined) {
    return { status: "no_limit", remaining: null };
  }
  const remaining = category.limit_count - categoryCurrentCount(category.id);
  return {
    status: remaining >= 1 ? "has_room" : "full_requires_swap",
    remaining,
  };
}

function evaluateWishlistItem(wishlistItem, month) {
  const b = budgetCheck(wishlistItem, month);
  const c = capacityCheck(wishlistItem);
  const d = duplicateCheck(wishlistItem);
  return {
    budget: b,
    capacity: c,
    duplicate: d,
  };
}

function decisionSortKey(w, evals) {
  const e = evals.get(w.id);

  const budgetRank =
    e.budget.status === "over"
      ? 0
      : e.budget.status === "within"
        ? 3
        : e.budget.status === "unknown_price"
          ? 4
          : 5;

  const capRank = e.capacity.status === "full_requires_swap" ? 1 : 6;
  const dupRank =
    e.duplicate.status === "likely_duplicate"
      ? 2
      : e.duplicate.status === "possible_duplicate"
        ? 3
        : 7;

  const needBy = w.need_by ? new Date(w.need_by).getTime() : Number.MAX_SAFE_INTEGER;
  const priority = 4 - (w.priority || 2);
  const price = w.price ?? Number.MAX_SAFE_INTEGER;

  return [budgetRank, capRank, dupRank, needBy, -priority, price];
}

function compareTuple(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

function sortedWishlist(month) {
  const active = state.wishlistItems.filter((w) => w.status !== "dropped" && w.status !== "bought");
  const evals = new Map(active.map((w) => [w.id, evaluateWishlistItem(w, month)]));

  const sorted = [...active].sort((a, b) =>
    compareTuple(decisionSortKey(a, evals), decisionSortKey(b, evals)),
  );

  return { sorted, evals };
}

function isMobileLayout_() {
  return globalThis.matchMedia ? globalThis.matchMedia("(max-width: 980px)").matches : false;
}

function applySidebarMenuState_() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("sidebarMenuToggle");
  if (!sidebar || !toggle) return;
  const open = !!state.ui.sidebarMenuOpen;
  if (isMobileLayout_()) {
    sidebar.classList.toggle("menu-open", open);
  } else {
    sidebar.classList.remove("menu-open");
  }
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

function closeSidebarMenuOnMobile_() {
  if (!isMobileLayout_()) return;
  state.ui.sidebarMenuOpen = false;
  applySidebarMenuState_();
}

function setTab(tab) {
  state.ui.tab = tab;
  if (tab !== "inventory") {
    state.ui.inventoryFieldsPanelOpen = false;
    state.ui.inventorySortPanelOpen = false;
  }
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  const isInventoryTab = tab === "inventory";
  document.querySelectorAll(".sub-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", isInventoryTab && btn.dataset.scope === state.ui.inventoryScope);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });
  closeSidebarMenuOnMobile_();
  persist();
}

function matchInventoryScope(item, scope) {
  if (scope === "all") return true;
  if (scope === "lettinggo") return normalizeItemStatus_(item?.status) === "手放す";
  const itemScope = scopeFromTypeLabel_(item?.type);
  if (scope === "uncategorized") return itemScope === "uncategorized";
  return itemScope === scope;
}

function exportSyncData() {
  return {
    categories: clone(state.categories),
    inventoryItems: clone(state.inventoryItems),
    deletedInventoryItems: clone(state.deletedInventoryItems || []),
    wishlistItems: clone(state.wishlistItems),
    budgetMonths: clone(state.budgetMonths),
    behaviorEvents: clone(state.behaviorEvents),
  };
}

function importSyncData(data) {
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.inventoryItems)) {
    throw new Error("シートデータ形式が不正です");
  }

  state.categories = clone(data.categories);
  state.inventoryItems = clone(data.inventoryItems);
  state.deletedInventoryItems = Array.isArray(data.deletedInventoryItems) ? clone(data.deletedInventoryItems) : [];
  state.wishlistItems = Array.isArray(data.wishlistItems) ? clone(data.wishlistItems) : [];
  state.budgetMonths = Array.isArray(data.budgetMonths) ? clone(data.budgetMonths) : [];
  state.behaviorEvents = Array.isArray(data.behaviorEvents) ? clone(data.behaviorEvents) : [];
  normalizeCategories_();
  normalizeInventoryItems();
}

function withTimeout(promise, timeoutMs = SYNC_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("タイムアウトしました")), timeoutMs);
    }),
  ]);
}

function syncFingerprint_(data) {
  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
}

function updateSyncSaveButtonState_() {
  const btn = document.getElementById("syncSaveBtn");
  if (!btn) return;
  const baseline = String(state.ui.lastSavedDataFingerprint || "");
  const current = syncFingerprint_(exportSyncData());
  const dirty = baseline !== "" && current !== baseline;
  btn.classList.toggle("attention", dirty);
  btn.title = dirty ? "未保存の変更があります" : "";
}

function notifySheetUpdated_(message) {
  if (!state.ui.notifyOnAutoSync) return;
  if (!("Notification" in globalThis)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("MiniClo", { body: message || "シートが更新されました" });
  } catch {
    // ignore
  }
}

let autoSyncTimerId_ = null;
let autoSyncInFlight_ = false;

function stopAutoSync_() {
  if (autoSyncTimerId_) {
    clearInterval(autoSyncTimerId_);
    autoSyncTimerId_ = null;
  }
}

function startAutoSync_() {
  stopAutoSync_();
  if (!state.ui.autoSyncEnabled) return;
  const intervalSec = Math.max(15, Number(state.ui.autoSyncIntervalSec || 60));
  autoSyncTimerId_ = setInterval(async () => {
    if (autoSyncInFlight_) return;
    if (document.hidden) return;
    if (!(state.ui.scriptUrl || "").trim()) return;
    autoSyncInFlight_ = true;
    try {
      await syncLoadFromAppsScript({ silent: true, fromAuto: true });
    } finally {
      autoSyncInFlight_ = false;
    }
  }, intervalSec * 1000);
}

async function syncLoadFromAppsScript(options = {}) {
  const { silent = false, fromAuto = false } = options;
  const url = (state.ui.scriptUrl || "").trim();
  if (!url) {
    if (!silent) alert("Apps Script URL を入力してください。");
    return;
  }

  if (!silent) setSyncStatus("シートから取得中...");

  try {
    const ts = Date.now();
    const sep = url.includes("?") ? "&" : "?";
    const res = await withTimeout(fetch(`${url}${sep}action=load&_=${ts}`, { method: "GET", cache: "no-store" }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const data = payload?.data ?? payload;
    const incomingFingerprint = syncFingerprint_(data);
    const hasChanged = incomingFingerprint && incomingFingerprint !== String(state.ui.lastLoadedFingerprint || "");
    importSyncData(data);
    if (incomingFingerprint) state.ui.lastLoadedFingerprint = incomingFingerprint;
    state.ui.lastSavedDataFingerprint = incomingFingerprint || syncFingerprint_(exportSyncData());
    persist();
    if (!silent) setSyncStatus(`取得完了 ${new Date().toLocaleTimeString("ja-JP")}`);
    if (fromAuto && hasChanged) {
      setSyncStatus(`自動更新 ${new Date().toLocaleTimeString("ja-JP")}`);
      notifySheetUpdated_("シート更新を反映しました");
    }
    renderAll();
    return { ok: true, changed: hasChanged };
  } catch (error) {
    if (!silent) {
      setSyncStatus("取得失敗");
      alert(`シート取得に失敗しました: ${error.message}`);
    }
    return { ok: false, changed: false };
  }
}

async function syncSaveToAppsScript() {
  const url = (state.ui.scriptUrl || "").trim();
  if (!url) {
    alert("Apps Script URL を入力してください。");
    return;
  }

  setSyncStatus("シートへ保存中...");

  try {
    const payload = {
      action: "save",
      data: exportSyncData(),
      meta: { savedAt: new Date().toISOString() },
    };

    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        // Apps Script WebApp + file origin では JSON だとCORS preflightで失敗しやすい
        // text/plain にして simple request として送る
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }),
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const responsePayload = await res.json().catch(() => null);
    if (responsePayload && responsePayload.ok === false) {
      throw new Error(responsePayload.error || "Apps Scriptが保存エラーを返しました");
    }
    state.ui.lastSavedDataFingerprint = syncFingerprint_(exportSyncData());
    persist();
    setSyncStatus(`保存完了 ${new Date().toLocaleTimeString("ja-JP")}`);
  } catch (error) {
    // CORS制約下ではレスポンス読取に失敗することがあるため no-cors で再試行
    if (error instanceof TypeError) {
      try {
        await withTimeout(
          fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: "save",
              data: exportSyncData(),
              meta: { savedAt: new Date().toISOString() },
            }),
          }),
        );
        state.ui.lastSavedDataFingerprint = syncFingerprint_(exportSyncData());
        persist();
        setSyncStatus(`保存送信完了 ${new Date().toLocaleTimeString("ja-JP")}`);
        return;
      } catch (_) {
        // fall through
      }
    }

    setSyncStatus("保存失敗");
    alert(`シート保存に失敗しました: ${error.message}`);
  }
}

function upsertInventoryOnBuy(wishlistItem) {
  const existing = state.inventoryItems.find(
    (i) => i.category_id === wishlistItem.category_id && normalizeText(i.name) === normalizeText(wishlistItem.name),
  );

  if (existing) {
    existing.qty += 1;
    existing.updated_at = new Date().toISOString();
    return;
  }

  state.inventoryItems.push({
    id: uuid(),
    name: wishlistItem.name,
    category_id: wishlistItem.category_id,
    tags: [],
    image_url: "",
    qty: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

function addBehaviorEvent(event) {
  state.behaviorEvents.push({ id: uuid(), created_at: new Date().toISOString(), ...event });
}

function categoryOptionsHtml(selectedId = "", typeFilter = "all") {
  const normalizedFilter = typeFilter === "all" ? "all" : normalizeCategoryType_(typeFilter);
  let cats = getSortedCategories()
    .filter((c) => normalizedFilter === "all" || normalizeCategoryType_(c.type) === normalizedFilter);
  if (!cats.length) cats = getSortedCategories();
  return cats
    .map((c) => `<option value="${c.id}" ${String(selectedId) === String(c.id) ? "selected" : ""}>${c.name}</option>`)
    .join("");
}

function categoryFilterOptionsHtml(selected = "all") {
  const seen = new Set();
  const cats = state.inventoryItems
    .map((i) => String(i.category || getCategoryName(i.category_id) || "").trim())
    .filter((name) => {
      if (!name || name === "-") return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .sort((a, b) => a.localeCompare(b, "ja"));
  const head = `<option value="all" ${selected === "all" ? "selected" : ""}>全カテゴリ</option>`;
  return head + cats.map((name) => `<option value="${name}" ${selected === name ? "selected" : ""}>${name}</option>`).join("");
}

function categoryTabsForScope(scope) {
  const all = getSortedCategories();
  let filtered = all;
  if (scope === "clothes") filtered = all.filter((c) => normalizeCategoryType_(c.type) === "衣服");
  else if (scope === "cosmetics") filtered = all.filter((c) => normalizeCategoryType_(c.type) === "コスメ");
  else if (scope === "gadgets") filtered = all.filter((c) => normalizeCategoryType_(c.type) === "ガジェット");
  else if (scope === "uncategorized") filtered = all.filter((c) => normalizeCategoryType_(c.type) === "未分類");
  else if (scope === "lettinggo") filtered = all;
  return [{ name: "全カテゴリ", value: "all" }, ...filtered.map((cat) => ({ name: cat.name, value: cat.name }))];
}

function ensureCategoryFilterForScope_() {
  const tabs = categoryTabsForScope(state.ui.inventoryScope);
  const values = new Set(tabs.map((t) => t.value));
  if (!values.has(state.ui.inventoryCategoryFilter)) {
    state.ui.inventoryCategoryFilter = "all";
    saveContextFilter_();
  }
}

function renderInventoryCategoryTabs() {
  const wrap = document.getElementById("inventoryCategoryTabs");
  if (!wrap) return;
  const tabs = categoryTabsForScope(state.ui.inventoryScope);
  wrap.innerHTML = tabs
    .map((tab) => `
      <button
        class="category-tab ${state.ui.inventoryCategoryFilter === tab.value ? "active" : ""}"
        type="button"
        role="tab"
        aria-selected="${state.ui.inventoryCategoryFilter === tab.value ? "true" : "false"}"
        data-category-tab="${tab.value}">
        <span>${tab.name}</span>
      </button>
    `)
    .join("");
}

function normalizeSortValue_(item, key) {
  if (key === "category") return categorySortRank_(item);
  if (key === "price" || key === "qty") return Number(item[key] || 0);
  if (key === "remaining") return Number(item.remaining || 0);
  if (key === "created_at" || key === "updated_at" || key === "purchase_date") {
    return new Date(item[key] || 0).getTime() || 0;
  }
  return String(item[key] || "").trim();
}

function categorySortRank_(item) {
  if (item?.category_id) {
    const catById = getCategoryById(item.category_id);
    if (catById && Number.isFinite(Number(catById.sort_order))) {
      return Number(catById.sort_order);
    }
  }
  const categoryName = String(item?.category || "").trim();
  if (categoryName) {
    const catByName = state.categories.find((c) => String(c.name || "").trim() === categoryName);
    if (catByName && Number.isFinite(Number(catByName.sort_order))) {
      return Number(catByName.sort_order);
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

function renderInventorySortPanel() {
  const panel = document.getElementById("inventorySortPanel");
  if (!panel) return;
  panel.hidden = !state.ui.inventorySortPanelOpen;
  const auto = document.getElementById("inventorySortAuto");
  if (auto) auto.checked = !!state.ui.inventorySortAuto;

  const rowsWrap = document.getElementById("inventorySortRows");
  if (!rowsWrap) return;
  rowsWrap.innerHTML = "";

  state.ui.inventorySortRules.forEach((rule, idx) => {
    const row = document.createElement("div");
    row.className = "sort-row";
    const fieldOptions = INVENTORY_SORT_FIELDS
      .map((f) => `<option value="${f.key}" ${f.key === rule.key ? "selected" : ""}>${f.label}</option>`)
      .join("");
    row.innerHTML = `
      <select class="cell-input" data-sort-kind="field" data-index="${idx}">${fieldOptions}</select>
      <select class="cell-input" data-sort-kind="dir" data-index="${idx}">
        <option value="asc" ${rule.dir === "asc" ? "selected" : ""}>First -> Last</option>
        <option value="desc" ${rule.dir === "desc" ? "selected" : ""}>Last -> First</option>
      </select>
      <button class="sort-remove" type="button" data-sort-kind="remove" data-index="${idx}">×</button>
    `;
    rowsWrap.appendChild(row);
  });
}

function sortInventoryRows_(rows) {
  if (!state.ui.inventorySortAuto) return rows;
  const rules = Array.isArray(state.ui.inventorySortRules) ? state.ui.inventorySortRules : [];
  if (!rules.length) return rows;
  return [...rows].sort((a, b) => {
    for (const rule of rules) {
      const av = normalizeSortValue_(a, rule.key);
      const bv = normalizeSortValue_(b, rule.key);
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), "ja");
      if (cmp !== 0) return rule.dir === "desc" ? -cmp : cmp;
    }
    return String(a.name || "").localeCompare(String(b.name || ""), "ja");
  });
}

function badge(label, kind) {
  return `<span class="tag ${kind}">${label}</span>`;
}

function renderTopBar() {
  const monthInput = document.getElementById("monthPicker");
  monthInput.value = state.ui.month;

  const b = ensureBudgetMonth(state.ui.month);
  const budgetInput = document.getElementById("budgetInput");
  budgetInput.value = b.budget_limit ?? "";

  const scriptUrlInput = document.getElementById("scriptUrlInput");
  if (scriptUrlInput) scriptUrlInput.value = state.ui.scriptUrl || "";
  const autoSyncToggle = document.getElementById("autoSyncToggle");
  if (autoSyncToggle) autoSyncToggle.checked = !!state.ui.autoSyncEnabled;
  const notifyBtn = document.getElementById("notifyPermissionBtn");
  if (notifyBtn) {
    const enabled = "Notification" in globalThis && Notification.permission === "granted";
    notifyBtn.textContent = enabled ? "通知許可済み" : "通知を許可";
  }
  updateSyncSaveButtonState_();
  setSyncStatus(state.ui.syncStatus || "ローカル保存モード");
}

function getMajorGroupTotals() {
  const groups = [
    { key: "clothes", label: "衣服", icon: "./assets/icons/clothes/icons8-t-shirt-1-50.png", count: 0 },
    { key: "cosmetics", label: "コスメ", icon: "./assets/icons/cosme/icons8-lipstick-50.png", count: 0 },
    { key: "gadgets", label: "ガジェット", icon: "./assets/icons/interface/icons8-gear-50.png", count: 0 },
    { key: "other", label: "その他", icon: "./assets/icons/interface/icons8-apps-50.png", count: 0 },
  ];

  const byId = {};
  state.categories.forEach((c) => {
    byId[c.id] = c;
  });

  const totals = groups.map((g) => ({ ...g }));
  let overall = 0;

  state.inventoryItems.forEach((item) => {
    overall += 1;
    const categoryType = byId[item.category_id]?.type || inferCategoryTypeFromName_(byId[item.category_id]?.name || "");
    const source = normalizeTypeLabel_(item.type || categoryType || "") || "衣服";
    if (source === "衣服") {
      totals[0].count += 1;
    } else if (source === "コスメ") {
      totals[1].count += 1;
    } else if (source === "ガジェット") {
      totals[2].count += 1;
    } else {
      totals[3].count += 1;
    }
  });

  return { totals, overall };
}

function dashboardCategoryBreakdown() {
  const rows = getSortedCategories()
    .filter((cat) => {
      if (state.ui.dashboardTypeFilter === "all") return true;
      return scopeFromTypeLabel_(cat.type) === state.ui.dashboardTypeFilter;
    })
    .map((cat) => {
      const count = state.inventoryItems.filter((item) => item.category_id === cat.id).length;
      return { cat, count };
    })
    .filter((x) => x.count > 0);

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const result = rows.map((row, idx) => ({
    name: row.cat.name,
    count: row.count,
    ratio: total > 0 ? row.count / total : 0,
    color: DASHBOARD_DONUT_COLORS[idx % DASHBOARD_DONUT_COLORS.length],
  }));
  return { rows: result, total };
}

function buildDashboardDonutCss(rows) {
  if (!rows.length) return "#e2e8f0";
  let start = 0;
  const segments = rows.map((row) => {
    const end = start + row.ratio * 100;
    const seg = `${row.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    start = end;
    return seg;
  });
  return `conic-gradient(${segments.join(", ")})`;
}

function renderDashboard() {
  const cards = document.getElementById("dashboardCards");
  cards.innerHTML = "";

  const major = getMajorGroupTotals();
  major.totals.forEach((g) => {
    const card = document.createElement("article");
    card.className = "fraction-card major";
    const ratio = major.overall > 0 ? `${Math.round((g.count / major.overall) * 100)}%` : "0%";
    card.innerHTML = `
      <p class="dashboard-major-label"><img src="${g.icon}" alt="" aria-hidden="true" />${g.label}</p>
      <strong>${g.count}</strong>
      <small>構成比 ${ratio}</small>
    `;
    cards.appendChild(card);
  });

  const budget = ensureBudgetMonth(state.ui.month);
  const actual = actualSpend(state.ui.month);
  const planned = plannedSpend(state.ui.month);
  const remaining =
    budget.budget_limit === null || budget.budget_limit === undefined
      ? null
      : budget.budget_limit - (actual + planned);

  const budgetCard = document.createElement("article");
  budgetCard.className = "fraction-card budget";
  budgetCard.innerHTML = `
    <p>予算 ${state.ui.month}</p>
    <strong>${budget.budget_limit == null ? "-" : yen(budget.budget_limit)}</strong>
    <small>実績 ${yen(actual)} / 予定 ${yen(planned)} / 残り ${remaining == null ? "-" : yen(remaining)}</small>
  `;
  cards.appendChild(budgetCard);

  const breakdown = dashboardCategoryBreakdown();
  const chartCard = document.createElement("article");
  chartCard.className = "fraction-card dashboard-chart-card";
  const dashboardTypeTabs = [
    { value: "all", label: "全体" },
    { value: "clothes", label: "衣服" },
    { value: "cosmetics", label: "コスメ" },
    { value: "gadgets", label: "ガジェット" },
  ];
  chartCard.innerHTML = `
    <div class="dashboard-chart-head">
      <p>カテゴリ内訳</p>
      <div class="dashboard-type-tabs" role="tablist" aria-label="ドーナツグラフ切替">
        ${dashboardTypeTabs
    .map((tab) => `
            <button
              class="dashboard-type-tab ${state.ui.dashboardTypeFilter === tab.value ? "active" : ""}"
              type="button"
              role="tab"
              aria-selected="${state.ui.dashboardTypeFilter === tab.value ? "true" : "false"}"
              data-dashboard-type-tab="${tab.value}">${tab.label}</button>
          `)
    .join("")}
      </div>
      <small>${breakdown.total} アイテム</small>
    </div>
    <div class="dashboard-chart-layout">
      <div class="dashboard-donut" style="background:${buildDashboardDonutCss(breakdown.rows)}">
        <div class="dashboard-donut-hole">
          <strong>${breakdown.total}</strong>
          <span>総アイテム数</span>
        </div>
      </div>
      <ul class="dashboard-legend">
        ${breakdown.rows.length
    ? breakdown.rows
      .map((row) => `
              <li class="dashboard-legend-row">
                <div class="dashboard-legend-left">
                  <span class="dashboard-legend-dot" style="background:${row.color}"></span>
                  <span>${row.name}</span>
                </div>
                <div class="dashboard-legend-right">${row.count} / ${Math.round(row.ratio * 100)}%</div>
              </li>
            `)
      .join("")
    : `<li class="dashboard-empty">データがありません</li>`}
      </ul>
    </div>
  `;
  cards.appendChild(chartCard);

  renderCategoryTable();
}

function renderCategoryTable() {
  const tbody = document.getElementById("categoryRows");
  tbody.innerHTML = "";

  getSortedCategories().forEach((cat) => {
    const tr = document.createElement("tr");
    tr.className = "category-row";
    tr.draggable = true;
    tr.dataset.categoryRow = cat.id;
    tr.innerHTML = `
      <td>
        <button class="category-drag-handle" type="button" data-kind="cat-drag" data-id="${cat.id}" aria-label="カテゴリ順序をドラッグで変更">⠿</button>
      </td>
      <td><input class="cell-input" data-kind="cat-name" data-id="${cat.id}" value="${cat.name}" /></td>
      <td>
        <select class="cell-input" data-kind="cat-type" data-id="${cat.id}">
          ${CATEGORY_TYPE_OPTIONS.map((type) => `<option value="${type}" ${normalizeCategoryType_(cat.type) === type ? "selected" : ""}>${type}</option>`).join("")}
        </select>
      </td>
      <td><input class="cell-input" data-kind="cat-limit" data-id="${cat.id}" type="number" min="0" value="${cat.limit_count ?? ""}" /></td>
      <td><input class="cell-input" data-kind="cat-ideal" data-id="${cat.id}" type="number" min="0" value="${cat.ideal_count ?? ""}" /></td>
      <td><button class="action-btn ghost" type="button" data-kind="cat-delete" data-id="${cat.id}">削除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInventory() {
  const sectionTitle = document.getElementById("inventorySectionTitle");
  if (sectionTitle) sectionTitle.textContent = SCOPE_TITLE[state.ui.inventoryScope] || "アイテム";

  const select = document.getElementById("inventoryCategorySelect");
  const scopeType = inferTypeFromScope(state.ui.inventoryScope);
  select.innerHTML = categoryOptionsHtml("", scopeType || "all");

  // 旧状態でIDが入っている場合はカテゴリ名に変換して互換維持
  if (state.ui.inventoryCategoryFilter !== "all") {
    const byId = getCategoryById(state.ui.inventoryCategoryFilter);
    if (byId) {
      state.ui.inventoryCategoryFilter = byId.name;
      saveContextFilter_();
    }
  }
  ensureCategoryFilterForScope_();
  renderInventoryCategoryTabs();
  const sortBtn = document.getElementById("inventorySortToggle");
  if (sortBtn) {
    sortBtn.innerHTML = `<img class="btn-icon sm" src="./assets/icons/interface/icons8-available-updates-50.png" alt="" aria-hidden="true" />並び替え (${state.ui.inventorySortRules.length})`;
  }
  renderInventorySortPanel();

  let rows = [...state.inventoryItems];
  rows = rows.filter((i) => matchInventoryScope(i, state.ui.inventoryScope));
  if (state.ui.inventoryScope === "lettinggo") {
    rows = rows.filter((i) => normalizeItemStatus_(i.status) === "手放す");
  } else {
    rows = rows.filter((i) => normalizeItemStatus_(i.status) === "もってる");
  }
  if (state.ui.inventoryCategoryFilter !== "all") {
    rows = rows.filter((i) => String(i.category || getCategoryName(i.category_id)) === state.ui.inventoryCategoryFilter);
  }
  rows = sortInventoryRows_(rows);

  const tbody = document.getElementById("inventoryRows");
  tbody.innerHTML = "";
  const headRow = document.getElementById("inventoryHeadRow");
  const isVisible = state.ui.inventoryVisibleFields || {};
  const baseColumns = [
    { key: "image", label: "画像", enabled: true },
    { key: "name", label: "名前", enabled: true },
  ];
  const dynamicColumns = getOrderedInventoryFieldDefs_().map((f) => ({
    key: f.key,
    label: f.label,
    enabled: !!isVisible[f.key],
  }));
  const columns = [...baseColumns, ...dynamicColumns];
  function itemDisplay(item, key) {
    if (key === "category") return item.category || getCategoryName(item.category_id);
    if (key === "price") return item.price == null || Number.isNaN(Number(item.price)) ? "-" : yen(Number(item.price));
    if (key === "purchase_date") return item.purchase_date || "-";
    if (key === "url") {
      const text = String(item.url || "").trim();
      if (!text) return "-";
      return `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    if (key === "color") {
      const colorHex = getColorHex(item.color);
      return `<span class="color-dot-mini" style="background:${colorHex}" title="${item.color || "-"}"></span> ${item.color || "-"}`;
    }
    if (key === "tag") return item.tag ? `<span class="category2-chip">${item.tag}</span>` : "-";
    if (key === "qty") return item.qty ?? "-";
    if (key === "status") return normalizeItemStatus_(item.status);
    return item[key] || "-";
  }
  function galleryMeta(item, key) {
    if (key === "color") {
      const colorHex = getColorHex(item.color);
      return `<p class="gallery-meta"><span class="color-dot-mini" style="background:${colorHex}" title="${item.color || "-"}"></span> ${item.color || "-"}</p>`;
    }
    if (key === "tag") {
      return `<p class="gallery-meta">${item.tag ? `<span class="category2-chip">${item.tag}</span>` : "-"}</p>`;
    }
    return `<p class="gallery-meta">${itemDisplay(item, key)}</p>`;
  }
  if (headRow) {
    headRow.innerHTML = columns.filter((c) => c.enabled).map((c) => `<th>${c.label}</th>`).join("");
  }
  const gallery = document.getElementById("inventoryGallery");
  gallery.innerHTML = "";

  rows.forEach((item) => {
    const imageSrc = coalesceImageSource(item);
    const img = imageSrc
      ? `<img class="thumb-xs" src="${imageSrc}" alt="" onerror="this.outerHTML='<span class=&quot;thumb-xs placeholder&quot; aria-hidden=&quot;true&quot;><img class=&quot;thumb-placeholder-icon&quot; src=&quot;./assets/icons/interface/icons8-picture-120.png&quot; alt=&quot;&quot; /></span>'" />`
      : `<span class="thumb-xs placeholder" aria-hidden="true"><img class="thumb-placeholder-icon" src="./assets/icons/interface/icons8-picture-120.png" alt="" /></span>`;

    const tr = document.createElement("tr");
    tr.dataset.id = item.id;
    const cells = [];
    if (columns.find((c) => c.key === "image" && c.enabled)) cells.push(`<td>${img}</td>`);
    if (columns.find((c) => c.key === "name" && c.enabled)) cells.push(`<td>${item.name}</td>`);
    dynamicColumns.filter((c) => c.enabled).forEach((c) => {
      cells.push(`<td>${itemDisplay(item, c.key)}</td>`);
    });
    tr.innerHTML = cells.join("");
    tbody.appendChild(tr);

    const card = document.createElement("article");
    card.className = "gallery-card";
    card.dataset.id = item.id;
    const imageClass = state.ui.inventoryImageFitMode === "fit" ? "gallery-image fit" : "gallery-image";
    const imageNode = imageSrc
      ? `<img class="${imageClass}" src="${imageSrc}" alt="" onerror="this.outerHTML='<div class=&quot;gallery-image empty&quot; aria-hidden=&quot;true&quot;><img class=&quot;gallery-empty-icon&quot; src=&quot;./assets/icons/interface/icons8-picture-120.png&quot; alt=&quot;&quot; /></div>'" />`
      : `<div class="gallery-image empty" aria-hidden="true"><img class="gallery-empty-icon" src="./assets/icons/interface/icons8-picture-120.png" alt="" /></div>`;
    const metas = dynamicColumns
      .filter((c) => c.enabled)
      .map((c) => galleryMeta(item, c.key))
      .join("");
    card.innerHTML = `
      ${imageNode}
      <p class="gallery-title">${item.name}</p>
      ${metas}
    `;
    gallery.appendChild(card);
  });

  const tableWrap = document.getElementById("inventoryListWrap");
  const viewBtn = document.getElementById("inventoryViewToggle");
  const isGallery = state.ui.inventoryView === "gallery";
  if (tableWrap) tableWrap.hidden = isGallery;
  if (gallery) gallery.hidden = !isGallery;
  if (viewBtn) {
    viewBtn.innerHTML = isGallery
      ? `<img class="btn-icon sm" src="./assets/icons/interface/icons8-list-50.png" alt="" aria-hidden="true" />リスト`
      : `<img class="btn-icon sm" src="./assets/icons/interface/icons8-four-squares-50.png" alt="" aria-hidden="true" />ギャラリー`;
  }
}

function renderInventoryFieldsPanel() {
  const panel = document.getElementById("inventoryFieldsPanel");
  if (!panel) return;
  panel.hidden = !state.ui.inventoryFieldsPanelOpen;
  const list = document.getElementById("inventoryFieldsList");
  if (list) {
    list.innerHTML = getOrderedInventoryFieldDefs_().map((f) => `
      <div class="field-row" data-drag-key="${f.key}">
        <input type="checkbox" data-field="${f.key}" ${state.ui.inventoryVisibleFields?.[f.key] ? "checked" : ""} />
        <span class="drag-handle" draggable="true" data-drag-key="${f.key}" title="ドラッグで並び替え">⋮⋮</span>
        <span>${f.label}</span>
      </div>
    `).join("");
  }
  panel.querySelectorAll("button[data-fit-mode]").forEach((btn) => {
    btn.classList.toggle("primary", btn.dataset.fitMode === state.ui.inventoryImageFitMode);
  });
}

function renderTrash() {
  const tbody = document.getElementById("trashRows");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!state.deletedInventoryItems.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">ゴミ箱は空です</td>`;
    tbody.appendChild(tr);
    return;
  }

  state.deletedInventoryItems
    .slice()
    .sort((a, b) => new Date(b.deleted_at || 0) - new Date(a.deleted_at || 0))
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.dataset.trashId = item.id;
      const categoryName = item.category || getCategoryName(item.category_id) || "-";
      const deletedAt = item.deleted_at ? new Date(item.deleted_at).toLocaleString("ja-JP") : "-";
      tr.innerHTML = `
        <td>${item.name || "-"}</td>
        <td>${categoryName}</td>
        <td>${deletedAt}</td>
        <td>
          <button class="action-btn ghost" type="button" data-trash-action="restore" data-id="${item.id}">復元</button>
          <button class="action-btn ghost" type="button" data-trash-action="purge" data-id="${item.id}">完全削除</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function openInventoryAddModal(prefill = {}) {
  state.ui.inventoryAddModalOpen = true;
  const form = document.getElementById("inventoryForm");
  if (form) {
    form.reset();
    const statusEl = form.querySelector('[name="status"]');
    if (statusEl) statusEl.value = normalizeItemStatus_(prefill.status, "もってる");
  }
  const select = document.getElementById("inventoryCategorySelect");
  if (select) {
    const typeFilter = state.ui.tab === "inventory" ? (inferTypeFromScope(state.ui.inventoryScope) || "all") : "all";
    select.innerHTML = categoryOptionsHtml("", typeFilter);
  }
  renderInventoryAddModal();
}

function closeInventoryAddModal() {
  state.ui.inventoryAddModalOpen = false;
  renderInventoryAddModal();
}

function renderInventoryAddModal() {
  const modal = document.getElementById("inventoryAddModal");
  if (!modal) return;
  modal.hidden = !state.ui.inventoryAddModalOpen;
}

function openInventoryModal(itemId) {
  const item = state.inventoryItems.find((i) => i.id === itemId);
  if (!item) return;

  state.ui.inventoryModalOpen = true;
  state.ui.inventoryModalItemId = item.id;
  state.ui.inventoryModalDraft = {
    ...item,
  };
  renderInventoryModal();
}

function trashInventoryItem_(itemId) {
  const idx = state.inventoryItems.findIndex((i) => i.id === itemId);
  if (idx < 0) return false;
  const [removed] = state.inventoryItems.splice(idx, 1);
  if (!Array.isArray(state.deletedInventoryItems)) state.deletedInventoryItems = [];
  state.deletedInventoryItems.unshift({
    ...removed,
    deleted_at: new Date().toISOString(),
  });
  return true;
}

function restoreInventoryItemFromTrash_(itemId) {
  const idx = state.deletedInventoryItems.findIndex((i) => i.id === itemId);
  if (idx < 0) return false;
  const [restored] = state.deletedInventoryItems.splice(idx, 1);
  const { deleted_at: _deletedAt, ...item } = restored;
  state.inventoryItems.unshift({
    ...item,
    updated_at: new Date().toISOString(),
  });
  return true;
}

function purgeInventoryItemFromTrash_(itemId) {
  const before = state.deletedInventoryItems.length;
  state.deletedInventoryItems = state.deletedInventoryItems.filter((i) => i.id !== itemId);
  return state.deletedInventoryItems.length !== before;
}

function purgeAllInventoryTrash_() {
  if (!state.deletedInventoryItems.length) return false;
  state.deletedInventoryItems = [];
  return true;
}

function closeInventoryModal() {
  state.ui.inventoryModalOpen = false;
  state.ui.inventoryModalItemId = null;
  state.ui.inventoryModalDraft = null;
  renderInventoryModal();
}

function deleteInventoryModalItem() {
  const id = state.ui.inventoryModalItemId;
  if (!id) return;
  const item = state.inventoryItems.find((i) => i.id === id);
  if (!item) return;
  const ok = confirm(`「${item.name || "このアイテム"}」をゴミ箱に移動します。よろしいですか？`);
  if (!ok) return;
  const moved = trashInventoryItem_(id);
  if (!moved) return;
  closeInventoryModal();
  persist();
  renderAll();
}

async function duplicateInventoryModalItem() {
  const draft = state.ui.inventoryModalDraft;
  if (!draft) return;

  let imageUrl = String(draft.image_url || "").trim();
  if (!imageUrl) {
    const input = document.getElementById("modalImageFile");
    const file = input instanceof HTMLInputElement ? (input.files || [])[0] : null;
    if (file) {
      try {
        imageUrl = await fileToDataUrl(file);
      } catch (error) {
        alert(error.message);
        return;
      }
    }
  }

  const typeName = normalizeTypeLabel_(draft.type || inferTypeFromCategoryName(getCategoryName(draft.category_id)) || "") || "衣服";
  const selectedCategoryName = getCategoryName(String(draft.category_id || ""));
  const normalizedCategoryName = normalizeCategoryNameForType_(selectedCategoryName === "-" ? "" : selectedCategoryName, typeName);
  const now = new Date().toISOString();
  const newItem = {
    id: uuid(),
    name: String(draft.name || "").trim() ? `${String(draft.name || "").trim()} (コピー)` : "コピー",
    category_id: ensureLocalCategoryIdByName_(normalizedCategoryName, typeName),
    category: normalizedCategoryName,
    type: typeName,
    brand: String(draft.brand || "").trim(),
    status: normalizeItemStatus_(draft.status),
    fav: String(draft.fav || "").trim(),
    color: String(draft.color || "").trim(),
    season: String(draft.season || "").trim(),
    tag: String(draft.tag || draft.category2 || "").trim(),
    category2: String(draft.tag || draft.category2 || "").trim(),
    remaining: String(draft.remaining || "").trim(),
    memo: String(draft.memo || "").trim(),
    purchase_date: String(draft.purchase_date || "").trim(),
    price: draft.price === "" || draft.price == null ? null : Number(draft.price),
    capacity: String(draft.capacity || "").trim(),
    url: String(draft.url || "").trim(),
    qty: Math.max(1, Number(draft.qty || 1)),
    image_url: coalesceImageSource({ image_url: imageUrl }),
    created_at: now,
    updated_at: now,
  };
  newItem.tags = [newItem.brand, newItem.color, newItem.season, newItem.tag].filter(Boolean);

  const currentIndex = state.inventoryItems.findIndex((i) => i.id === state.ui.inventoryModalItemId);
  if (currentIndex < 0) {
    state.inventoryItems.push(newItem);
  } else {
    state.inventoryItems.splice(currentIndex + 1, 0, newItem);
  }

  persist();
  renderAll();
  openInventoryModal(newItem.id);
}

function renderInventoryModal() {
  const modal = document.getElementById("inventoryModal");
  const draft = state.ui.inventoryModalDraft;
  const open = state.ui.inventoryModalOpen && !!draft;
  modal.hidden = !open;
  if (!open) return;

  document.getElementById("modalName").value = draft.name || "";
  const typeSelect = document.getElementById("modalType");
  let normalizedType = "衣服";
  if (typeSelect) {
    normalizedType = normalizeTypeLabel_(draft.type || inferTypeFromCategoryName(getCategoryName(draft.category_id)) || "") || "衣服";
    typeSelect.value = normalizedType;
  }
  const categorySelect = document.getElementById("modalCategory");
  categorySelect.innerHTML = categoryOptionsHtml(draft.category_id, normalizedType);
  if (!categorySelect.querySelector(`option[value="${draft.category_id}"]`)) {
    const first = categorySelect.querySelector("option");
    if (first) {
      categorySelect.value = first.value;
      draft.category_id = first.value;
    }
  }
  document.getElementById("modalBrand").value = draft.brand || "";
  document.getElementById("modalStatus").value = normalizeItemStatus_(draft.status);
  document.getElementById("modalFav").value = draft.fav || "";
  document.getElementById("modalColor").value = draft.color || "";
  document.getElementById("modalSeason").value = draft.season || "";
  document.getElementById("modalTag").value = draft.tag || draft.category2 || "";
  document.getElementById("modalRemaining").value = draft.remaining || "";
  document.getElementById("modalMemo").value = draft.memo || "";
  document.getElementById("modalPurchaseDate").value = draft.purchase_date || "";
  document.getElementById("modalPrice").value = draft.price ?? "";
  document.getElementById("modalCapacity").value = draft.capacity || "";
  document.getElementById("modalUrl").value = draft.url || "";
  document.getElementById("modalQty").value = String(draft.qty || 1);
  document.getElementById("modalImageUrl").value = draft.image_url || "";
  const urlOpenBtn = document.getElementById("modalUrlOpenBtn");
  if (urlOpenBtn) urlOpenBtn.disabled = !String(draft.url || "").trim();

  const preview = document.getElementById("modalImagePreview");
  const previewSrc = coalesceImageSource(draft);
  if (previewSrc) {
    preview.src = previewSrc;
    preview.style.display = "block";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
  }

  const ids = state.inventoryItems.map((i) => i.id);
  const currentIndex = ids.indexOf(state.ui.inventoryModalItemId);
  const prevBtn = document.getElementById("inventoryModalPrev");
  const nextBtn = document.getElementById("inventoryModalNext");
  if (prevBtn) prevBtn.disabled = currentIndex <= 0;
  if (nextBtn) nextBtn.disabled = currentIndex < 0 || currentIndex >= ids.length - 1;
}

async function saveInventoryModal(options = {}) {
  const { close = true, rerender = true } = options;
  const id = state.ui.inventoryModalItemId;
  const draft = state.ui.inventoryModalDraft;
  if (!id || !draft) return false;
  const item = state.inventoryItems.find((i) => i.id === id);
  if (!item) return false;

  let imageUrl = String(draft.image_url || "").trim();
  if (!imageUrl) {
    const input = document.getElementById("modalImageFile");
    const file = input instanceof HTMLInputElement ? (input.files || [])[0] : null;
    if (file) {
      try {
        imageUrl = await fileToDataUrl(file);
      } catch (error) {
        alert(error.message);
        return false;
      }
    }
  }

  item.name = String(draft.name || "").trim();
  const typeName = normalizeTypeLabel_(draft.type || item.type || inferTypeFromCategoryName(getCategoryName(draft.category_id)) || "") || "衣服";
  const selectedCategoryName = getCategoryName(String(draft.category_id || ""));
  const normalizedCategoryName = normalizeCategoryNameForType_(selectedCategoryName === "-" ? "" : selectedCategoryName, typeName);
  item.category_id = ensureLocalCategoryIdByName_(normalizedCategoryName, typeName);
  item.category = normalizedCategoryName;
  item.type = typeName;
  item.brand = String(draft.brand || "").trim();
  item.status = normalizeItemStatus_(draft.status);
  item.fav = String(draft.fav || "").trim();
  item.color = String(draft.color || "").trim();
  item.season = String(draft.season || "").trim();
  item.tag = String(draft.tag || draft.category2 || "").trim();
  item.category2 = item.tag;
  item.remaining = String(draft.remaining || "").trim();
  item.memo = String(draft.memo || "").trim();
  item.purchase_date = String(draft.purchase_date || "").trim();
  item.price = draft.price === "" || draft.price == null ? null : Number(draft.price);
  item.capacity = String(draft.capacity || "").trim();
  item.url = String(draft.url || "").trim();
  item.tags = [item.brand, item.color, item.season, item.tag].filter(Boolean);
  item.qty = Math.max(1, Number(draft.qty || 1));
  item.image_url = coalesceImageSource({ ...item, image_url: imageUrl });
  item.updated_at = new Date().toISOString();

  persist();
  if (close) {
    closeInventoryModal();
    renderAll();
  } else if (rerender) {
    renderAll();
    renderInventoryModal();
  }
  return true;
}

async function navigateInventoryModal(step) {
  const ids = state.inventoryItems.map((i) => i.id);
  const currentIndex = ids.indexOf(state.ui.inventoryModalItemId);
  if (currentIndex < 0) return;
  const targetIndex = currentIndex + step;
  if (targetIndex < 0 || targetIndex >= ids.length) return;
  const saved = await saveInventoryModal({ close: false, rerender: false });
  if (!saved) return;
  openInventoryModal(ids[targetIndex]);
}

function formatDuplicateCandidates(ids) {
  if (!ids || ids.length === 0) return "-";
  const names = ids
    .map((id) => state.inventoryItems.find((i) => i.id === id)?.name)
    .filter(Boolean);
  return names.join(" / ") || "-";
}

function renderWishlist() {
  const tabs = categoryTabsForScope("all");
  if (!tabs.some((t) => t.value === state.ui.wishlistCategoryFilter)) {
    state.ui.wishlistCategoryFilter = "all";
  }
  const tabWrap = document.getElementById("wishlistCategoryTabs");
  if (tabWrap) {
    tabWrap.innerHTML = tabs
      .map((tab) => `
        <button
          class="category-tab ${state.ui.wishlistCategoryFilter === tab.value ? "active" : ""}"
          type="button"
          role="tab"
          aria-selected="${state.ui.wishlistCategoryFilter === tab.value ? "true" : "false"}"
          data-wishlist-category-tab="${tab.value}">
          <span>${tab.name}</span>
        </button>
      `)
      .join("");
  }

  let rows = state.inventoryItems.filter((item) => normalizeItemStatus_(item.status) === "ほしい");
  if (state.ui.wishlistCategoryFilter !== "all") {
    rows = rows.filter((i) => String(i.category || getCategoryName(i.category_id)) === state.ui.wishlistCategoryFilter);
  }
  rows = sortInventoryRows_(rows);

  const tbody = document.getElementById("wishlistRows");
  if (!tbody) return;
  tbody.innerHTML = "";

  const headRow = document.getElementById("wishlistHeadRow");
  const isVisible = state.ui.inventoryVisibleFields || {};
  const baseColumns = [
    { key: "image", label: "画像", enabled: true },
    { key: "name", label: "名前", enabled: true },
  ];
  const dynamicColumns = getOrderedInventoryFieldDefs_().map((f) => ({
    key: f.key,
    label: f.label,
    enabled: !!isVisible[f.key],
  }));
  const columns = [...baseColumns, ...dynamicColumns];

  function itemDisplay(item, key) {
    if (key === "category") return item.category || getCategoryName(item.category_id);
    if (key === "price") return item.price == null || Number.isNaN(Number(item.price)) ? "-" : yen(Number(item.price));
    if (key === "purchase_date") return item.purchase_date || "-";
    if (key === "url") {
      const text = String(item.url || "").trim();
      if (!text) return "-";
      return `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    if (key === "color") {
      const colorHex = getColorHex(item.color);
      return `<span class="color-dot-mini" style="background:${colorHex}" title="${item.color || "-"}"></span> ${item.color || "-"}`;
    }
    if (key === "tag") return item.tag ? `<span class="category2-chip">${item.tag}</span>` : "-";
    if (key === "qty") return item.qty ?? "-";
    if (key === "status") return normalizeItemStatus_(item.status);
    return item[key] || "-";
  }

  function galleryMeta(item, key) {
    if (key === "color") {
      const colorHex = getColorHex(item.color);
      return `<p class="gallery-meta"><span class="color-dot-mini" style="background:${colorHex}" title="${item.color || "-"}"></span> ${item.color || "-"}</p>`;
    }
    if (key === "tag") {
      return `<p class="gallery-meta">${item.tag ? `<span class="category2-chip">${item.tag}</span>` : "-"}</p>`;
    }
    return `<p class="gallery-meta">${itemDisplay(item, key)}</p>`;
  }

  if (headRow) {
    headRow.innerHTML = columns.filter((c) => c.enabled).map((c) => `<th>${c.label}</th>`).join("");
  }

  const gallery = document.getElementById("wishlistGallery");
  if (gallery) gallery.innerHTML = "";

  rows.forEach((item) => {
    const imageSrc = coalesceImageSource(item);
    const img = imageSrc
      ? `<img class="thumb-xs" src="${imageSrc}" alt="" onerror="this.outerHTML='<span class=&quot;thumb-xs placeholder&quot; aria-hidden=&quot;true&quot;><img class=&quot;thumb-placeholder-icon&quot; src=&quot;./assets/icons/interface/icons8-picture-120.png&quot; alt=&quot;&quot; /></span>'" />`
      : `<span class="thumb-xs placeholder" aria-hidden="true"><img class="thumb-placeholder-icon" src="./assets/icons/interface/icons8-picture-120.png" alt="" /></span>`;

    const tr = document.createElement("tr");
    tr.dataset.id = item.id;
    const cells = [];
    if (columns.find((c) => c.key === "image" && c.enabled)) cells.push(`<td>${img}</td>`);
    if (columns.find((c) => c.key === "name" && c.enabled)) cells.push(`<td>${item.name}</td>`);
    dynamicColumns.filter((c) => c.enabled).forEach((c) => {
      cells.push(`<td>${itemDisplay(item, c.key)}</td>`);
    });
    tr.innerHTML = cells.join("");
    tbody.appendChild(tr);

    if (!gallery) return;
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.dataset.id = item.id;
    const imageClass = state.ui.inventoryImageFitMode === "fit" ? "gallery-image fit" : "gallery-image";
    const imageNode = imageSrc
      ? `<img class="${imageClass}" src="${imageSrc}" alt="" onerror="this.outerHTML='<div class=&quot;gallery-image empty&quot; aria-hidden=&quot;true&quot;><img class=&quot;gallery-empty-icon&quot; src=&quot;./assets/icons/interface/icons8-picture-120.png&quot; alt=&quot;&quot; /></div>'" />`
      : `<div class="gallery-image empty" aria-hidden="true"><img class="gallery-empty-icon" src="./assets/icons/interface/icons8-picture-120.png" alt="" /></div>`;
    const metas = dynamicColumns
      .filter((c) => c.enabled)
      .map((c) => galleryMeta(item, c.key))
      .join("");
    card.innerHTML = `
      ${imageNode}
      <p class="gallery-title">${item.name}</p>
      ${metas}
    `;
    gallery.appendChild(card);
  });

  const listWrap = document.getElementById("wishlistListWrap");
  const viewBtn = document.getElementById("wishlistViewToggle");
  const isGallery = state.ui.wishlistView !== "list";
  if (listWrap) listWrap.hidden = isGallery;
  if (gallery) gallery.hidden = !isGallery;
  if (viewBtn) {
    viewBtn.innerHTML = isGallery
      ? `<img class="btn-icon sm" src="./assets/icons/interface/icons8-list-50.png" alt="" aria-hidden="true" />リスト`
      : `<img class="btn-icon sm" src="./assets/icons/interface/icons8-four-squares-50.png" alt="" aria-hidden="true" />ギャラリー`;
  }
}

function renderLog() {
  const rows = [...state.behaviorEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
  const tbody = document.getElementById("eventRows");
  tbody.innerHTML = "";

  rows.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.event_type}</td>
      <td>${getCategoryName(e.category_id)}</td>
      <td>${e.item_name}</td>
      <td>${e.qty ?? 1}</td>
      <td>${e.amount == null ? "-" : yen(e.amount)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderOcr() {
  const source = document.getElementById("ocrSourceHint");
  if (source) source.value = state.ui.ocrSourceHint || "auto";

  const status = document.getElementById("ocrStatusText");
  if (status) status.textContent = state.ui.ocrStatusText || "";

  const raw = document.getElementById("ocrRawText");
  if (raw && raw.value !== String(state.ui.ocrRawText || "")) {
    raw.value = String(state.ui.ocrRawText || "");
  }

  const preview = document.getElementById("ocrPreviewImage");
  if (preview) {
    const src = String(state.ui.ocrImageDataUrl || "");
    if (src) {
      preview.src = src;
      preview.hidden = false;
    } else {
      preview.removeAttribute("src");
      preview.hidden = true;
    }
  }
  if (!state.ui.ocrResult) state.ui.ocrResult = buildOcrResultFromText_(state.ui.ocrRawText || "", state.ui.ocrSourceHint || "auto");
  const ocr = state.ui.ocrResult || emptyOcrResult_();
  if (!ocr.order) ocr.order = emptyOcrResult_().order;
  if (!Array.isArray(ocr.items)) ocr.items = [];

  const orderDate = document.getElementById("ocrOrderDate");
  const orderId = document.getElementById("ocrOrderId");
  const orderTotal = document.getElementById("ocrOrderTotal");
  const orderPayment = document.getElementById("ocrOrderPayment");
  if (orderDate) orderDate.value = ocr.order.order_date || "";
  if (orderId) orderId.value = ocr.order.order_id || "";
  if (orderTotal) orderTotal.value = ocr.order.total_paid ?? "";
  if (orderPayment) orderPayment.value = ocr.order.payment_method || "";

  const tbody = document.getElementById("ocrItemRows");
  if (tbody) {
    tbody.innerHTML = "";
    ocr.items.forEach((item, idx) => {
      const tr = document.createElement("tr");
      const categoryOptions = OCR_CATEGORY_OPTIONS
        .map((c) => `<option value="${c}" ${normalizeOcrCategory_(item.category) === c ? "selected" : ""}>${c}</option>`)
        .join("");
      const statusValue = OCR_STATUS_OPTIONS.includes(String(item.status || "").toUpperCase()) ? String(item.status || "").toUpperCase() : "OWNED";
      const statusOptions = OCR_STATUS_OPTIONS
        .map((s) => `<option value="${s}" ${statusValue === s ? "selected" : ""}>${s}</option>`)
        .join("");
      const subCategory = String(item.sub_category ?? item.variant ?? "").replace(/"/g, "&quot;");
      tr.innerHTML = `
        <td><textarea rows="2" class="cell-input ocr-plain-input ocr-name-input" data-ocr-item="${idx}" data-ocr-key="item_name">${String(item.item_name || "")}</textarea></td>
        <td><select class="cell-input" data-ocr-item="${idx}" data-ocr-key="category">${categoryOptions}</select></td>
        <td><input class="cell-input ocr-plain-input" data-ocr-item="${idx}" data-ocr-key="sub_category" value="${subCategory}" /></td>
        <td><input class="cell-input ocr-plain-input" data-ocr-item="${idx}" data-ocr-key="brand" value="${String(item.brand || "").replace(/"/g, "&quot;")}" /></td>
        <td><select class="cell-input" data-ocr-item="${idx}" data-ocr-key="status">${statusOptions}</select></td>
        <td><input class="cell-input ocr-plain-input ocr-narrow-input" type="number" min="1" data-ocr-item="${idx}" data-ocr-key="qty" value="${Math.max(1, Number(item.qty || 1))}" /></td>
        <td><input class="cell-input ocr-plain-input ocr-narrow-input" type="number" min="0" data-ocr-item="${idx}" data-ocr-key="price" value="${item.price ?? ""}" /></td>
        <td><button class="action-btn ghost" type="button" data-ocr-item-remove="${idx}">削除</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

async function runOcrFromImage_() {
  const src = String(state.ui.ocrImageDataUrl || "");
  if (!src) {
    alert("画像を選択してください。");
    return;
  }

  const TesseractLib = globalThis.Tesseract;
  if (!TesseractLib || typeof TesseractLib.recognize !== "function") {
    alert("OCRライブラリの読み込みに失敗しました。ネットワーク接続を確認してください。");
    return;
  }

  state.ui.ocrStatusText = "OCR実行中...";
  persist();
  renderOcr();

  try {
    const result = await TesseractLib.recognize(src, "jpn+eng", {
      logger: (msg) => {
        if (!msg || !msg.status) return;
        if (typeof msg.progress === "number") {
          const pct = Math.round(msg.progress * 100);
          state.ui.ocrStatusText = `${msg.status} ${pct}%`;
        } else {
          state.ui.ocrStatusText = String(msg.status);
        }
        renderOcr();
      },
    });
    const text = normalizeOcrTextSpacing_(String(result?.data?.text || ""));
    state.ui.ocrRawText = text;
    state.ui.ocrResult = buildOcrResultFromText_(text, state.ui.ocrSourceHint || "auto");
    state.ui.ocrStatusText = `OCR完了 ${new Date().toLocaleTimeString("ja-JP")}`;
    persist();
    renderOcr();
  } catch (error) {
    state.ui.ocrStatusText = "OCR失敗";
    persist();
    renderOcr();
    alert(`OCRに失敗しました: ${error.message}`);
  }
}

function renderAll() {
  renderTopBar();
  renderDashboard();
  renderInventoryFieldsPanel();
  renderInventory();
  renderInventoryAddModal();
  renderInventoryModal();
  renderWishlist();
  renderTrash();
  renderOcr();
}

function onBudgetChange(value) {
  const b = ensureBudgetMonth(state.ui.month);
  b.budget_limit = value === "" ? null : Number(value);
  b.updated_at = new Date().toISOString();
  persist();
  renderAll();
}

function handleWishBought(id) {
  const wish = state.wishlistItems.find((w) => w.id === id);
  if (!wish) return;

  wish.status = "bought";
  wish.updated_at = new Date().toISOString();

  addBehaviorEvent({
    event_type: "purchase",
    date: new Date().toISOString().slice(0, 10),
    category_id: wish.category_id,
    item_name: wish.name,
    qty: 1,
    amount: wish.price ?? null,
    source_wishlist_id: wish.id,
  });

  upsertInventoryOnBuy(wish);
}

function setupEvents() {
  const sidebarToggle = document.getElementById("sidebarMenuToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      state.ui.sidebarMenuOpen = !state.ui.sidebarMenuOpen;
      applySidebarMenuState_();
      persist();
    });
  }

  globalThis.addEventListener("resize", () => {
    applySidebarMenuState_();
  });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tab === "inventory") {
        state.ui.inventoryScope = "all";
        loadScopeView_();
        loadContextFilter_();
        loadContextCustomize_();
      }
      setTab(btn.dataset.tab);
      persist();
      renderAll();
    });
  });

  document.querySelectorAll(".sub-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ui.inventoryScope = btn.dataset.scope || "all";
      loadScopeView_();
      loadContextFilter_();
      loadContextCustomize_();
      setTab("inventory");
      persist();
      renderAll();
    });
  });

  document.getElementById("monthPicker").addEventListener("change", (e) => {
    state.ui.month = e.target.value || getCurrentMonth();
    ensureBudgetMonth(state.ui.month);
    persist();
    renderAll();
  });

  document.getElementById("budgetInput").addEventListener("input", (e) => {
    onBudgetChange(e.target.value);
  });

  document.getElementById("scriptUrlInput").addEventListener("change", (e) => {
    state.ui.scriptUrl = String(e.target.value || "").trim();
    persist();
    setSyncStatus(state.ui.scriptUrl ? "同期先URL設定済み" : "ローカル保存モード");
    startAutoSync_();
  });

  document.getElementById("syncLoadBtn").addEventListener("click", async () => {
    await syncLoadFromAppsScript();
  });

  document.getElementById("syncSaveBtn").addEventListener("click", async () => {
    await syncSaveToAppsScript();
  });

  document.getElementById("autoSyncToggle").addEventListener("change", (e) => {
    state.ui.autoSyncEnabled = !!e.target.checked;
    persist();
    startAutoSync_();
    setSyncStatus(state.ui.autoSyncEnabled ? "自動更新: ON" : "自動更新: OFF");
  });

  document.getElementById("notifyPermissionBtn").addEventListener("click", async () => {
    if (!("Notification" in globalThis)) {
      alert("このブラウザは通知に対応していません。");
      return;
    }
    if (Notification.permission === "granted") {
      state.ui.notifyOnAutoSync = true;
      persist();
      renderTopBar();
      return;
    }
    const result = await Notification.requestPermission();
    state.ui.notifyOnAutoSync = result === "granted";
    persist();
    renderTopBar();
  });

  document.getElementById("ocrSourceHint").addEventListener("change", (e) => {
    state.ui.ocrSourceHint = String(e.target.value || "auto");
    if (state.ui.ocrRawText) {
      state.ui.ocrResult = buildOcrResultFromText_(state.ui.ocrRawText, state.ui.ocrSourceHint);
    }
    persist();
    renderOcr();
  });

  document.getElementById("ocrImageInput").addEventListener("change", async (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = (input.files || [])[0];
    if (!file) return;
    try {
      state.ui.ocrImageDataUrl = await fileToDataUrl(file);
      state.ui.ocrStatusText = "OCR実行ボタンを押してください";
      persist();
      renderOcr();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("ocrRunBtn").addEventListener("click", async () => {
    await runOcrFromImage_();
  });

  document.getElementById("ocrParseBtn").addEventListener("click", () => {
    const rawEl = document.getElementById("ocrRawText");
    const text = normalizeOcrTextSpacing_(
      rawEl instanceof HTMLTextAreaElement ? rawEl.value : String(state.ui.ocrRawText || ""),
    );
    state.ui.ocrRawText = text;
    state.ui.ocrResult = buildOcrResultFromText_(text, state.ui.ocrSourceHint || "auto");
    state.ui.ocrStatusText = "テキスト再解析完了";
    persist();
    renderOcr();
  });

  document.getElementById("ocrOrderDate").addEventListener("input", (e) => {
    if (!state.ui.ocrResult) state.ui.ocrResult = emptyOcrResult_();
    if (!state.ui.ocrResult.order) state.ui.ocrResult.order = emptyOcrResult_().order;
    state.ui.ocrResult.order.order_date = String(e.target.value || "") || null;
    persist();
  });
  document.getElementById("ocrOrderId").addEventListener("input", (e) => {
    if (!state.ui.ocrResult) state.ui.ocrResult = emptyOcrResult_();
    if (!state.ui.ocrResult.order) state.ui.ocrResult.order = emptyOcrResult_().order;
    state.ui.ocrResult.order.order_id = String(e.target.value || "") || null;
    persist();
  });
  document.getElementById("ocrOrderTotal").addEventListener("input", (e) => {
    if (!state.ui.ocrResult) state.ui.ocrResult = emptyOcrResult_();
    if (!state.ui.ocrResult.order) state.ui.ocrResult.order = emptyOcrResult_().order;
    const n = String(e.target.value || "").trim();
    state.ui.ocrResult.order.total_paid = n === "" ? null : Number(n);
    persist();
  });
  document.getElementById("ocrOrderPayment").addEventListener("input", (e) => {
    if (!state.ui.ocrResult) state.ui.ocrResult = emptyOcrResult_();
    if (!state.ui.ocrResult.order) state.ui.ocrResult.order = emptyOcrResult_().order;
    state.ui.ocrResult.order.payment_method = String(e.target.value || "") || null;
    persist();
  });

  document.getElementById("ocrItemRows").addEventListener("input", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    const idx = Number(target.dataset.ocrItem || -1);
    const key = target.dataset.ocrKey || "";
    if (!state.ui.ocrResult || !Array.isArray(state.ui.ocrResult.items)) return;
    if (idx < 0 || idx >= state.ui.ocrResult.items.length) return;
    const item = state.ui.ocrResult.items[idx];
    if (!item) return;
    if (key === "qty") item.qty = Math.max(1, Number(target.value || 1));
    else if (key === "price") item.price = String(target.value || "").trim() === "" ? null : Number(target.value);
    else if (key === "category") item.category = normalizeOcrCategory_(target.value);
    else if (key === "status") item.status = OCR_STATUS_OPTIONS.includes(String(target.value || "").toUpperCase()) ? String(target.value).toUpperCase() : "OWNED";
    else item[key] = String(target.value || "");
    persist();
  });

  document.getElementById("ocrItemRows").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-ocr-item-remove]") : null;
    if (!btn) return;
    const idx = Number(btn.dataset.ocrItemRemove || -1);
    if (!state.ui.ocrResult || !Array.isArray(state.ui.ocrResult.items)) return;
    if (idx < 0 || idx >= state.ui.ocrResult.items.length) return;
    state.ui.ocrResult.items.splice(idx, 1);
    persist();
    renderOcr();
  });

  document.getElementById("ocrAddItemBtn").addEventListener("click", () => {
    if (!state.ui.ocrResult) state.ui.ocrResult = emptyOcrResult_();
    if (!Array.isArray(state.ui.ocrResult.items)) state.ui.ocrResult.items = [];
    state.ui.ocrResult.items.push({
      item_name: "",
      brand: null,
      sub_category: null,
      category: "その他",
      status: "OWNED",
      price: null,
      qty: 1,
    });
    persist();
    renderOcr();
  });

  document.getElementById("ocrSaveBtn").addEventListener("click", async () => {
    await saveOcrResultToAppsScript_();
  });

  document.getElementById("inventoryAddOpen").addEventListener("click", () => {
    openInventoryAddModal();
  });

  document.getElementById("inventoryFieldsToggle").addEventListener("click", () => {
    state.ui.inventoryFieldsPanelOpen = !state.ui.inventoryFieldsPanelOpen;
    if (state.ui.inventoryFieldsPanelOpen) state.ui.inventorySortPanelOpen = false;
    persist();
    renderAll();
  });

  document.getElementById("inventorySortToggle").addEventListener("click", () => {
    state.ui.inventorySortPanelOpen = !state.ui.inventorySortPanelOpen;
    if (state.ui.inventorySortPanelOpen) state.ui.inventoryFieldsPanelOpen = false;
    persist();
    renderAll();
  });

  document.getElementById("inventorySortPanel").addEventListener("change", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    const index = Number(target.dataset.index || -1);
    if (target.id === "inventorySortAuto") {
      state.ui.inventorySortAuto = target.checked;
      persist();
      renderAll();
      return;
    }
    if (index < 0 || index >= state.ui.inventorySortRules.length) return;
    const kind = target.dataset.sortKind;
    if (kind === "field") {
      state.ui.inventorySortRules[index].key = target.value;
    }
    if (kind === "dir") {
      state.ui.inventorySortRules[index].dir = target.value === "desc" ? "desc" : "asc";
    }
    persist();
    renderAll();
  });

  document.getElementById("inventorySortPanel").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-sort-kind][data-index]") : null;
    if (!btn) return;
    if (btn.dataset.sortKind !== "remove") return;
    const index = Number(btn.dataset.index || -1);
    if (index < 0 || index >= state.ui.inventorySortRules.length) return;
    if (state.ui.inventorySortRules.length <= 1) {
      alert("最低1つの並び替え条件が必要です。");
      return;
    }
    state.ui.inventorySortRules.splice(index, 1);
    persist();
    renderAll();
  });

  document.getElementById("inventorySortAddRule").addEventListener("click", () => {
    state.ui.inventorySortRules.push({ key: "name", dir: "asc" });
    persist();
    renderAll();
  });

  document.getElementById("inventoryFieldsPanel").addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.dataset.field) return;
    state.ui.inventoryVisibleFields[input.dataset.field] = input.checked;
    saveContextCustomize_();
    persist();
    renderAll();
  });

  document.getElementById("inventoryFieldsList").addEventListener("dragstart", (e) => {
    const handle = e.target instanceof HTMLElement ? e.target.closest("[data-drag-key]") : null;
    if (!handle) return;
    e.dataTransfer?.setData("text/plain", handle.dataset.dragKey || "");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });

  document.getElementById("inventoryFieldsList").addEventListener("dragover", (e) => {
    const handle = e.target instanceof HTMLElement ? e.target.closest("[data-drag-key]") : null;
    if (!handle) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  });

  document.getElementById("inventoryFieldsList").addEventListener("drop", (e) => {
    const handle = e.target instanceof HTMLElement ? e.target.closest("[data-drag-key]") : null;
    if (!handle) return;
    e.preventDefault();
    const dragKey = e.dataTransfer?.getData("text/plain");
    const dropKey = handle.dataset.dragKey || "";
    if (!dragKey || !dropKey) return;
    moveInventoryField_(dragKey, dropKey);
    saveContextCustomize_();
    persist();
    renderAll();
  });

  document.getElementById("inventoryFieldsPanel").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-fit-mode]") : null;
    if (!btn) return;
    state.ui.inventoryImageFitMode = btn.dataset.fitMode || "cover";
    saveContextCustomize_();
    persist();
    renderAll();
  });

  document.getElementById("inventoryFieldAddBtn").addEventListener("click", () => {
    const labelInput = document.getElementById("inventoryFieldAddLabel");
    const keyInput = document.getElementById("inventoryFieldAddKey");
    const label = String(labelInput.value || "").trim();
    const keyRaw = String(keyInput.value || "").trim();
    const key = keyRaw || keyFromLabel(label);
    if (!label || !key) {
      alert("項目名を入力してください。");
      return;
    }
    const exists = getInventoryFieldDefs().some((f) => f.key === key);
    if (exists) {
      alert("同じキーの項目が既にあります。");
      return;
    }
    state.ui.inventoryCustomFields.push({ key, label });
    normalizeInventoryFieldOrder_();
    state.ui.inventoryVisibleFields[key] = true;
    saveContextCustomize_();
    labelInput.value = "";
    keyInput.value = "";
    persist();
    renderAll();
  });

  document.getElementById("categoryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const maxSort = Math.max(0, ...state.categories.map((c) => c.sort_order || 0));
    state.categories.push({
      id: uuid(),
      name: String(fd.get("name") || "").trim(),
      type: normalizeCategoryType_(fd.get("type") || "衣服"),
      limit_count: fd.get("limit") === "" ? null : Number(fd.get("limit")),
      ideal_count: fd.get("ideal") === "" ? null : Number(fd.get("ideal")),
      sort_order: maxSort + 1,
    });

    e.currentTarget.reset();
    persist();
    renderAll();
  });

  document.getElementById("categoryRows").addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement)) return;

    const cat = state.categories.find((c) => c.id === t.dataset.id);
    if (!cat) return;

    if (t.dataset.kind === "cat-name") cat.name = t.value;
    if (t.dataset.kind === "cat-type") cat.type = normalizeCategoryType_(t.value);
    if (t.dataset.kind === "cat-limit") cat.limit_count = t.value === "" ? null : Number(t.value);
    if (t.dataset.kind === "cat-ideal") cat.ideal_count = t.value === "" ? null : Number(t.value);

    persist();
  });

  document.getElementById("categoryRows").addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement)) return;
    if (!t.dataset.kind || !t.dataset.id) return;
    renderAll();
  });

  document.getElementById("categoryRows").addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) return;
    if (t.dataset.kind !== "cat-delete") return;

    const inUse =
      state.inventoryItems.some((i) => i.category_id === t.dataset.id) ||
      state.wishlistItems.some((w) => w.category_id === t.dataset.id);
    if (inUse) {
      alert("このカテゴリは使用中のため削除できません。");
      return;
    }

    state.categories = state.categories.filter((c) => c.id !== t.dataset.id);
    normalizeCategorySortOrders_();
    persist();
    renderAll();
  });

  document.getElementById("categoryRows").addEventListener("dragstart", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("[data-category-row]") : null;
    if (!row) return;
    e.dataTransfer?.setData("text/plain", row.dataset.categoryRow || "");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    row.classList.add("is-dragging");
  });

  document.getElementById("categoryRows").addEventListener("dragover", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("[data-category-row]") : null;
    if (!row) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    row.classList.add("drag-over");
  });

  document.getElementById("categoryRows").addEventListener("dragleave", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("[data-category-row]") : null;
    if (!row) return;
    row.classList.remove("drag-over");
  });

  document.getElementById("categoryRows").addEventListener("drop", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("[data-category-row]") : null;
    if (!row) return;
    e.preventDefault();
    row.classList.remove("drag-over");
    const dragId = e.dataTransfer?.getData("text/plain");
    const dropId = row.dataset.categoryRow || "";
    if (!dragId || !dropId || dragId === dropId) return;

    const sorted = getSortedCategories();
    const dragIdx = sorted.findIndex((cat) => cat.id === dragId);
    const dropIdx = sorted.findIndex((cat) => cat.id === dropId);
    if (dragIdx < 0 || dropIdx < 0) return;

    const [dragCat] = sorted.splice(dragIdx, 1);
    const insertIdx = dragIdx < dropIdx ? Math.max(0, dropIdx - 1) : dropIdx;
    sorted.splice(insertIdx, 0, dragCat);
    normalizeCategorySortOrders_(sorted);
    persist();
    renderAll();
  });

  document.getElementById("categoryRows").addEventListener("dragend", () => {
    document.querySelectorAll("#categoryRows [data-category-row]").forEach((row) => {
      row.classList.remove("is-dragging");
      row.classList.remove("drag-over");
    });
  });

  document.getElementById("inventoryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let imageUrl = String(fd.get("imageUrl") || "").trim();
    const rawCategoryId = String(fd.get("category") || "");
    const selectedCategory = getCategoryById(rawCategoryId);
    const typeName = normalizeCategoryType_(selectedCategory?.type || inferTypeFromCategoryName(getCategoryName(rawCategoryId)) || "未分類");
    const rawCategoryName = selectedCategory?.name || getCategoryName(rawCategoryId);
    const categoryName = normalizeCategoryNameForType_(rawCategoryName === "-" ? "" : rawCategoryName, typeName);
    const categoryId = ensureLocalCategoryIdByName_(categoryName, typeName);

    const imageFile = fd.get("imageFile");
    if (!imageUrl && imageFile instanceof File && imageFile.size > 0) {
      try {
        imageUrl = await fileToDataUrl(imageFile);
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    state.inventoryItems.push({
      id: uuid(),
      name: String(fd.get("name") || "").trim(),
      category_id: categoryId,
      category: categoryName,
      type: typeName,
      brand: String(fd.get("brand") || "").trim(),
      status: normalizeItemStatus_(fd.get("status"), "もってる"),
      fav: String(fd.get("fav") || "").trim(),
      color: String(fd.get("color") || "").trim(),
      season: String(fd.get("season") || "").trim(),
      tag: String(fd.get("tag") || "").trim(),
      category2: String(fd.get("tag") || "").trim(),
      remaining: String(fd.get("remaining") || "").trim(),
      memo: String(fd.get("memo") || "").trim(),
      purchase_date: String(fd.get("purchase_date") || "").trim(),
      price: fd.get("price") === "" ? null : Number(fd.get("price")),
      capacity: String(fd.get("capacity") || "").trim(),
      url: String(fd.get("url") || "").trim(),
      tags: [
        String(fd.get("brand") || "").trim(),
        String(fd.get("color") || "").trim(),
        String(fd.get("season") || "").trim(),
        String(fd.get("tag") || "").trim(),
      ].filter(Boolean),
      image_url: coalesceImageSource({ image_url: imageUrl }),
      qty: Number(fd.get("qty") || 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    e.currentTarget.reset();
    closeInventoryAddModal();
    persist();
    renderAll();
  });

  document.getElementById("inventoryAddModalBackdrop").addEventListener("click", () => {
    closeInventoryAddModal();
  });
  document.getElementById("inventoryAddModalCancel").addEventListener("click", () => {
    closeInventoryAddModal();
  });

  document.getElementById("inventoryCategoryTabs").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("[data-category-tab]") : null;
    if (!btn) return;
    state.ui.inventoryCategoryFilter = btn.dataset.categoryTab || "all";
    saveContextFilter_();
    persist();
    renderAll();
  });

  document.getElementById("dashboardCards").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("[data-dashboard-type-tab]") : null;
    if (!btn) return;
    state.ui.dashboardTypeFilter = btn.dataset.dashboardTypeTab || "all";
    persist();
    renderDashboard();
  });

  document.getElementById("inventoryViewToggle").addEventListener("click", () => {
    state.ui.inventoryView = state.ui.inventoryView === "list" ? "gallery" : "list";
    saveScopeView_();
    loadContextFilter_();
    loadContextCustomize_();
    persist();
    renderAll();
  });

  document.addEventListener("click", (e) => {
    if (!state.ui.inventoryFieldsPanelOpen && !state.ui.inventorySortPanelOpen) return;
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const panel = target.closest("#inventoryFieldsPanel");
    const toggle = target.closest("#inventoryFieldsToggle");
    const sortPanel = target.closest("#inventorySortPanel");
    const sortToggle = target.closest("#inventorySortToggle");
    if (panel || toggle || sortPanel || sortToggle) return;
    state.ui.inventoryFieldsPanelOpen = false;
    state.ui.inventorySortPanelOpen = false;
    persist();
    renderAll();
  });

  document.getElementById("trashRows").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-trash-action][data-id]") : null;
    if (!btn) return;
    const id = btn.dataset.id || "";
    const action = btn.dataset.trashAction || "";
    if (!id || !action) return;
    if (action === "restore") {
      const ok = restoreInventoryItemFromTrash_(id);
      if (!ok) return;
      persist();
      renderAll();
      return;
    }
    if (action === "purge") {
      const item = state.deletedInventoryItems.find((i) => i.id === id);
      const ok = confirm(`「${item?.name || "このアイテム"}」を完全削除します。元に戻せません。`);
      if (!ok) return;
      const deleted = purgeInventoryItemFromTrash_(id);
      if (!deleted) return;
      persist();
      renderAll();
    }
  });

  document.getElementById("trashPurgeAllBtn").addEventListener("click", () => {
    if (!state.deletedInventoryItems.length) return;
    const ok = confirm("ゴミ箱を全件完全削除します。元に戻せません。");
    if (!ok) return;
    const deleted = purgeAllInventoryTrash_();
    if (!deleted) return;
    persist();
    renderAll();
  });

  document.getElementById("inventoryRows").addEventListener("click", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("tr[data-id]") : null;
    if (!row) return;
    openInventoryModal(row.dataset.id);
  });

  document.getElementById("inventoryGallery").addEventListener("click", (e) => {
    const card = e.target instanceof HTMLElement ? e.target.closest(".gallery-card[data-id]") : null;
    if (!card) return;
    openInventoryModal(card.dataset.id);
  });

  document.getElementById("inventoryModalBackdrop").addEventListener("click", async () => {
    await saveInventoryModal();
  });
  document.getElementById("inventoryModalClose").addEventListener("click", async () => {
    await saveInventoryModal();
  });
  document.getElementById("inventoryModalDuplicate").addEventListener("click", async () => {
    await duplicateInventoryModalItem();
  });
  document.getElementById("inventoryModalDelete").addEventListener("click", () => {
    deleteInventoryModalItem();
  });
  document.getElementById("inventoryModalPrev").addEventListener("click", async () => {
    await navigateInventoryModal(-1);
  });
  document.getElementById("inventoryModalNext").addEventListener("click", async () => {
    await navigateInventoryModal(1);
  });
  document.addEventListener("keydown", async (e) => {
    if (!state.ui.inventoryModalOpen || e.key !== "Escape" || e.isComposing) return;
    e.preventDefault();
    await saveInventoryModal();
  });

  document.getElementById("modalName").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.name = e.target.value;
  });
  document.getElementById("modalType").addEventListener("change", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.type = normalizeTypeLabel_(e.target.value) || "衣服";
    const filtered = getSortedCategories().filter((c) => normalizeCategoryType_(c.type) === state.ui.inventoryModalDraft.type);
    if (filtered.length) {
      const exists = filtered.some((c) => c.id === state.ui.inventoryModalDraft.category_id);
      if (!exists) state.ui.inventoryModalDraft.category_id = filtered[0].id;
    }
    renderInventoryModal();
  });
  document.getElementById("modalCategory").addEventListener("change", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.category_id = e.target.value;
  });
  document.getElementById("modalBrand").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.brand = e.target.value;
  });
  document.getElementById("modalStatus").addEventListener("change", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.status = normalizeItemStatus_(e.target.value);
  });
  document.getElementById("modalFav").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.fav = e.target.value;
  });
  document.getElementById("modalColor").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.color = e.target.value;
    renderInventoryModal();
  });
  document.getElementById("modalSeason").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.season = e.target.value;
  });
  document.getElementById("modalTag").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.tag = e.target.value;
    state.ui.inventoryModalDraft.category2 = e.target.value;
  });
  document.getElementById("modalRemaining").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.remaining = e.target.value;
  });
  document.getElementById("modalMemo").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.memo = e.target.value;
  });
  document.getElementById("modalPurchaseDate").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.purchase_date = e.target.value;
  });
  document.getElementById("modalPrice").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.price = e.target.value;
  });
  document.getElementById("modalCapacity").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.capacity = e.target.value;
  });
  document.getElementById("modalUrl").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.url = e.target.value;
    const urlOpenBtn = document.getElementById("modalUrlOpenBtn");
    if (urlOpenBtn) urlOpenBtn.disabled = !String(e.target.value || "").trim();
  });
  document.getElementById("modalUrlOpenBtn").addEventListener("click", () => {
    if (!state.ui.inventoryModalDraft) return;
    const targetUrl = normalizeUrlForOpen_(state.ui.inventoryModalDraft.url);
    if (!targetUrl) return;
    try {
      const parsed = new URL(targetUrl);
      globalThis.open(parsed.toString(), "_blank", "noopener,noreferrer");
    } catch {
      alert("URL形式が正しくありません。");
    }
  });
  document.getElementById("modalQty").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.qty = e.target.value;
  });
  document.getElementById("modalImageUrl").addEventListener("input", (e) => {
    if (!state.ui.inventoryModalDraft) return;
    state.ui.inventoryModalDraft.image_url = e.target.value;
    renderInventoryModal();
  });
  document.getElementById("modalImageFile").addEventListener("change", async (e) => {
    if (!state.ui.inventoryModalDraft) return;
    const [file] = e.target.files || [];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      state.ui.inventoryModalDraft.image_url = dataUrl;
      renderInventoryModal();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("wishlistAddOpen").addEventListener("click", () => {
    openInventoryAddModal({ status: "ほしい" });
  });

  document.getElementById("wishlistViewToggle").addEventListener("click", () => {
    state.ui.wishlistView = state.ui.wishlistView === "list" ? "gallery" : "list";
    persist();
    renderWishlist();
  });

  document.getElementById("wishlistCategoryTabs").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("[data-wishlist-category-tab]") : null;
    if (!btn) return;
    state.ui.wishlistCategoryFilter = btn.dataset.wishlistCategoryTab || "all";
    persist();
    renderWishlist();
  });

  document.getElementById("wishlistRows").addEventListener("click", (e) => {
    const row = e.target instanceof HTMLElement ? e.target.closest("tr[data-id]") : null;
    if (!row) return;
    openInventoryModal(row.dataset.id);
  });

  document.getElementById("wishlistGallery").addEventListener("click", (e) => {
    const card = e.target instanceof HTMLElement ? e.target.closest(".gallery-card[data-id]") : null;
    if (!card) return;
    openInventoryModal(card.dataset.id);
  });
}

function boot() {
  seedIfNeeded();
  ensureInventoryUiDefaults();
  loadScopeView_();
  loadContextFilter_();
  loadContextCustomize_();
  state.ui.inventoryFieldsPanelOpen = false;
  if (state.ui.tab === "log") state.ui.tab = "dashboard";
  if (!state.ui.lastSavedDataFingerprint) {
    state.ui.lastSavedDataFingerprint = syncFingerprint_(exportSyncData());
  }
  setupEvents();
  setTab(state.ui.tab);
  applySidebarMenuState_();
  startAutoSync_();
  renderAll();
}

boot();
