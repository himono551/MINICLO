const SHEET_NAMES = {
  categories: 'categories',
  inventoryItems: 'inventoryItems',
  deletedInventoryItems: 'deletedInventoryItems',
  ocrImports: 'ocrImports',
  manualCaptures: 'manualCaptures',
  wishlistItems: 'wishlistItems',
  budgetMonths: 'budgetMonths',
  behaviorEvents: 'behaviorEvents',
};

const INVENTORY_HEADERS = [
  'id', 'name', 'category_id', 'category', 'type', 'brand', 'status', 'fav', 'color', 'season',
  'category2', 'remaining', 'purchase_date', 'price', 'capacity', 'url', 'tags', 'image_url',
  'qty', 'created_at', 'updated_at',
];
const MANUAL_CAPTURE_HEADERS = [
  'created_at', 'source', 'site', 'url', 'image_url', 'name', 'brand', 'type', 'category',
  'category2', 'color', 'purchase_date', 'price', 'memo', 'raw_text',
];
const INVENTORY_HEADER_ALIASES = {
  name: ['Product Name'],
  brand: ['barand', 'Brand'],
  category2: ['tag'],
  purchase_date: ['Purchase date'],
  image_url: ['image', 'product_image'],
};
const MANUAL_CAPTURE_HEADER_ALIASES = {
  category2: ['tag'],
};

const LEGACY_HEADERS = [
  'id',
  'name',
  'brand',
  'type',
  'category',
  'category2',
  'status',
  'fav',
  'color',
  'season',
  'remaining',
  'purchase_date',
  'price',
  'capacity',
  'url',
  'image_url',
  'image',
  'purchase_screenshot',
  '入力日',
];
const LEGACY_HEADERS_TAG = [
  'id',
  'name',
  'brand',
  'type',
  'category',
  'tag',
  'status',
  'fav',
  'color',
  'season',
  'remaining',
  'purchase_date',
  'price',
  'capacity',
  'url',
  'image_url',
  'image',
  'purchase_screenshot',
  '入力日',
];
const LEGACY_HEADERS_TYPO = [
  'id',
  'name',
  'barand',
  'type',
  'category',
  'category2',
  'status',
  'fav',
  'color',
  'season',
  'remaining',
  'purchase_date',
  'price',
  'capacity',
  'url',
  'image_url',
  'image',
  'purchase_screenshot',
  '入力日',
];
const LEGACY_HEADERS_TYPO_TAG = [
  'id',
  'name',
  'barand',
  'type',
  'category',
  'tag',
  'status',
  'fav',
  'color',
  'season',
  'remaining',
  'purchase_date',
  'price',
  'capacity',
  'url',
  'image_url',
  'image',
  'purchase_screenshot',
  '入力日',
];
const LEGACY_HEADERS_OLD = [
  'id',
  'Product Name',
  'Brand',
  'status',
  'fav',
  'Color',
  'category',
  'category2',
  'Season',
  'remaining',
  'Purchase date',
  'price',
  'Capacity',
  'url',
  'product_image',
];

const WISHLIST_STATUSES = ['wish', 'approved', 'hold', 'dropped', 'bought'];
// 既存の手入力シートにも保存結果を反映する
const WRITE_BACK_LEGACY_SHEET = true;
// 必要なら対象スプレッドシートIDを固定する（通常は空推奨）
const TARGET_SPREADSHEET_ID = '';

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  if (action === 'debug') {
    try {
      const ss = getSpreadsheet_();
      return jsonOutput({
        ok: true,
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); }),
      });
    } catch (err) {
      return jsonOutput({ ok: false, error: String(err) });
    }
  }

  if (action !== 'load') {
    return jsonOutput({ ok: false, error: 'Unsupported action. Use ?action=load or ?action=debug' });
  }

  try {
    const data = loadData_();
    return jsonOutput({ ok: true, data: data });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}


function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (body.action === 'save') {
      saveData_(body.data || {});
      return jsonOutput({ ok: true });
    }

    if (body.action === 'addItems') {
      const added = appendOcrItems_(body);
      return jsonOutput({ ok: true, added: added });
    }

    if (body.action === 'appendManualItem') {
      const appended = appendManualItem_(body);
      return jsonOutput({ ok: true, appended: appended });
    }

    return jsonOutput({ ok: false, error: 'Unsupported action. Use action=save, action=addItems, or action=appendManualItem' });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function appendManualItem_(payload) {
  const sheet = ensureCanonicalSheetSchema_(
    SHEET_NAMES.manualCaptures,
    MANUAL_CAPTURE_HEADERS,
    MANUAL_CAPTURE_HEADER_ALIASES
  );

  const name = String(payload.name || '').trim();
  if (!name) {
    throw new Error('name is required');
  }

  const headers = MANUAL_CAPTURE_HEADERS;
  const category2 = String(payload.category2 || payload.tag || '');
  const createdAt = new Date().toISOString();
  const purchaseDate = toDateString_(payload.purchase_date);
  const price = toIntOrNull_(payload.price);
  const row = headers.map(function(header) {
    const normalized = normalizeManualHeader_(header);
    if (normalized === 'created_at') return createdAt;
    if (normalized === 'source') return 'manual_extension';
    if (normalized === 'site') return String(payload.site || '');
    if (normalized === 'url') return String(payload.url || '');
    if (normalized === 'image_url') return String(payload.image_url || '');
    if (normalized === 'name') return name;
    if (normalized === 'brand') return String(payload.brand || '');
    if (normalized === 'type') return String(payload.type || '');
    if (normalized === 'category') return String(payload.category || '');
    if (normalized === 'category2') return category2;
    if (normalized === 'color') return String(payload.color || '');
    if (normalized === 'purchase_date') return purchaseDate;
    if (normalized === 'price') return price;
    if (normalized === 'memo') return String(payload.memo || '');
    if (normalized === 'raw_text') return String(payload.raw_text || '');
    return '';
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var startRow = 0;
  var inventoryStartRow = 0;
  var inventorySheetName = '';
  try {
    startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, 1, headers.length).setValues([row]);

    // manual captureをアプリ本体にも即反映するため、inventoryItemsにも追記する。
    const inventoryHeaders = INVENTORY_HEADERS;
    const inventorySheet = ensureCanonicalSheetSchema_(
      SHEET_NAMES.inventoryItems,
      INVENTORY_HEADERS,
      INVENTORY_HEADER_ALIASES
    );
    const categoryName = String(payload.category || '').trim() || '未分類';
    const categoryId = ensureCategoryIdByName_(categoryName);
    const tags = normalizeTags_([String(payload.brand || ''), String(payload.color || ''), category2].filter(function(v) {
      return String(v || '').trim() !== '';
    }));
    const inventoryRow = [
      makeId_('manual_inv', startRow),
      name,
      categoryId,
      categoryName,
      String(payload.type || ''),
      String(payload.brand || ''),
      'owned',
      '',
      String(payload.color || ''),
      '',
      category2,
      '1',
      purchaseDate,
      price,
      '',
      String(payload.url || ''),
      tags,
      String(payload.image_url || ''),
      1,
      createdAt,
      createdAt,
    ];
    inventoryStartRow = inventorySheet.getLastRow() + 1;
    inventorySheet.getRange(inventoryStartRow, 1, 1, inventoryHeaders.length).setValues([inventoryRow]);
    inventorySheetName = inventorySheet.getName();
  } finally {
    lock.releaseLock();
  }

  return {
    count: 1,
    spreadsheetId: sheet.getParent().getId(),
    spreadsheetName: sheet.getParent().getName(),
    sheetName: sheet.getName(),
    row: startRow,
    inventorySheetName: inventorySheetName,
    inventoryRow: inventoryStartRow,
  };
}

function normalizeManualHeader_(header) {
  const h = String(header || '').trim().toLowerCase();
  if (h === 'tag') return 'category2';
  return h;
}

function getEffectiveManualCaptureHeaders_(sheet, fallbackHeaders) {
  const width = Math.max(sheet.getLastColumn(), fallbackHeaders.length);
  const row = sheet.getRange(1, 1, 1, width).getValues()[0];
  let lastHeaderIndex = -1;
  for (var i = 0; i < row.length; i += 1) {
    if (String(row[i] || '').trim() !== '') lastHeaderIndex = i;
  }

  if (lastHeaderIndex < 0) return fallbackHeaders;

  const rawHeaders = row.slice(0, lastHeaderIndex + 1).map(function(v) {
    return String(v || '').trim();
  });
  const hasName = rawHeaders.some(function(h) { return normalizeManualHeader_(h) === 'name'; });
  if (!hasName) return fallbackHeaders;
  return rawHeaders;
}

function normalizeOcrSource_(value) {
  const v = String(value || '').toLowerCase();
  if (v === 'amazon') return 'amazon';
  if (v === 'qoo10') return 'qoo10';
  return 'other';
}

function normalizeOcrCategory_(value) {
  const text = String(value || '').trim();
  if (text === '服' || text === 'コスメ' || text === 'ガジェット' || text === 'その他') return text;
  return '服';
}

function defaultCategoryNameForType_(type) {
  if (type === 'コスメ') return 'コスメその他';
  if (type === 'ガジェット') return 'ガジェットその他';
  return '衣服その他';
}

function normalizeCategoryNameForType_(categoryName, type) {
  const text = String(categoryName || '').trim();
  if (text === '服') return '衣服その他';
  if (text === 'コスメ') return 'コスメその他';
  if (text === 'ガジェット') return 'ガジェットその他';
  if (!text || text === '-' || text === 'その他') return defaultCategoryNameForType_(type || '衣服');
  return text;
}

function normalizeOcrStatus_(value) {
  const v = String(value || '').toUpperCase();
  if (v === 'OWNED' || v === 'WISHLIST' || v === 'HISTORY' || v === 'DISPOSED') return v;
  return 'OWNED';
}

function appendOcrItems_(payload) {
  const headers = [
    'created_at',
    'source',
    'order_date',
    'order_id',
    'item_name',
    'brand',
    'variant',
    'category',
    'status',
    'qty',
    'price',
    'total_paid',
    'payment_method',
    'image_url',
    'raw_text',
  ];
  const sheet = getOrCreateSheet_(SHEET_NAMES.ocrImports, headers);
  const inventoryHeaders = INVENTORY_HEADERS;
  const inventorySheet = ensureCanonicalSheetSchema_(
    SHEET_NAMES.inventoryItems,
    INVENTORY_HEADERS,
    INVENTORY_HEADER_ALIASES
  );

  const source = normalizeOcrSource_(payload.source);
  const order = payload.order || {};
  const rawText = payload.raw_text ? String(payload.raw_text) : '';
  const imageUrl = payload.image_url ? String(payload.image_url) : '';
  const createdAt = new Date().toISOString();
  const totalPaid = toIntOrNull_(order.total_paid);
  const qtyDefault = 1;

  const items = Array.isArray(payload.items) ? payload.items : [];
  const rows = items
    .filter(function(item) {
      return item && String(item.item_name || '').trim() !== '';
    })
    .map(function(item) {
      return [
        createdAt,
        source,
        order.order_date ? String(order.order_date) : '',
        order.order_id ? String(order.order_id) : '',
        String(item.item_name || ''),
        item.brand ? String(item.brand) : '',
        item.variant ? String(item.variant) : '',
        normalizeOcrCategory_(item.category),
        normalizeOcrStatus_(item.status),
        toIntOrNull_(item.qty) || qtyDefault,
        toIntOrNull_(item.price),
        totalPaid,
        order.payment_method ? String(order.payment_method) : '',
        imageUrl,
        rawText,
      ];
    });

  if (!rows.length) {
    throw new Error('No valid items to append');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, headers.length).setValues(rows);

    const inventoryRows = items
      .filter(function(item) {
        return item && String(item.item_name || '').trim() !== '' && normalizeOcrStatus_(item.status) === 'OWNED';
      })
      .map(function(item, idx) {
        const ocrCategory = normalizeOcrCategory_(item.category);
        const type = ocrCategory === 'コスメ' ? 'コスメ' : (ocrCategory === 'ガジェット' ? 'ガジェット' : '衣服');
        const catName = normalizeCategoryNameForType_(ocrCategory, type);
        const categoryId = ensureCategoryIdByName_(catName);
        const created = new Date().toISOString();
        const qty = toIntOrNull_(item.qty) || qtyDefault;
        const brand = item.brand ? String(item.brand) : '';
        const variant = item.variant ? String(item.variant) : '';
        const tags = normalizeTags_([brand, variant].filter(Boolean));
        return [
          makeId_('ocr_inv', idx + 1),
          String(item.item_name || ''),
          categoryId,
          catName,
          type,
          brand,
          'owned',
          '',
          '',
          '',
          variant,
          '',
          order.order_date ? String(order.order_date) : '',
          toIntOrNull_(item.price),
          '',
          '',
          tags,
          imageUrl,
          qty,
          created,
          created,
        ];
      });
    if (inventoryRows.length) {
      const startInvRow = inventorySheet.getLastRow() + 1;
      inventorySheet.getRange(startInvRow, 1, inventoryRows.length, inventoryHeaders.length).setValues(inventoryRows);
    }
  } finally {
    lock.releaseLock();
  }

  return rows.length;
}

function ensureCategoryIdByName_(name) {
  const categoriesHeaders = ['id', 'name', 'limit_count', 'ideal_count', 'sort_order'];
  const categoriesSheet = getOrCreateSheet_(SHEET_NAMES.categories, categoriesHeaders);
  const rows = readRowsAsObjects_(categoriesSheet);
  const hit = rows.find(function(row) {
    return String(row.name || '').trim() === String(name || '').trim();
  });
  if (hit && String(hit.id || '').trim() !== '') {
    return String(hit.id);
  }

  const maxSort = rows.reduce(function(max, row) {
    const n = toIntOrNull_(row.sort_order) || 0;
    return n > max ? n : max;
  }, 0);
  const id = makeId_('cat', maxSort + 1);
  const row = [id, String(name || 'その他'), null, null, maxSort + 1];
  const start = categoriesSheet.getLastRow() + 1;
  categoriesSheet.getRange(start, 1, 1, categoriesHeaders.length).setValues([row]);
  return id;
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  const propId = PropertiesService.getScriptProperties().getProperty('TARGET_SPREADSHEET_ID') || '';
  const id = String(TARGET_SPREADSHEET_ID || propId).trim();
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Spreadsheet not found. Set TARGET_SPREADSHEET_ID in script or Script Properties.');
}

function getOrCreateSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const currentHeader = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const mismatch = headers.some(function(h, i) { return currentHeader[i] !== h; });
  if (mismatch) {
    // 既存データを消さないため、ヘッダー不一致でもシート全体はクリアしない。
    // データ行がない場合のみヘッダーを整える。
    if (sheet.getLastRow() <= 1) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function normalizeHeaderKey_(value) {
  return String(value || '').trim().toLowerCase();
}

function findHeaderValue_(row, targetHeader, aliasMap) {
  const normalizedMap = {};
  Object.keys(row || {}).forEach(function(key) {
    normalizedMap[normalizeHeaderKey_(key)] = row[key];
  });
  const candidates = [targetHeader].concat(aliasMap[targetHeader] || []);
  for (var i = 0; i < candidates.length; i += 1) {
    const hit = normalizedMap[normalizeHeaderKey_(candidates[i])];
    if (hit !== undefined) return hit;
  }
  return '';
}

function isHeaderExactMatch_(sheet, headers) {
  const width = Math.max(sheet.getLastColumn(), headers.length);
  const current = sheet.getRange(1, 1, 1, width).getValues()[0].slice(0, headers.length);
  const exact = headers.every(function(h, idx) {
    return String(current[idx] || '') === h;
  });
  if (!exact) return false;
  for (var i = headers.length; i < width; i += 1) {
    if (String(sheet.getRange(1, i + 1).getValue() || '').trim() !== '') return false;
  }
  return true;
}

function ensureCanonicalSheetSchema_(name, headers, aliasMap) {
  const sheet = getOrCreateSheet_(name, headers);
  const aliases = aliasMap || {};
  if (isHeaderExactMatch_(sheet, headers)) return sheet;

  const existingRows = readRowsAsObjects_(sheet);
  const migratedRows = existingRows.map(function(row) {
    return headers.map(function(header) {
      return findHeaderValue_(row, header, aliases);
    });
  });

  sheet.clearContents();
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (migratedRows.length) {
    sheet.getRange(2, 1, migratedRows.length, headers.length).setValues(migratedRows);
  }
  return sheet;
}

function findSheetByHeaders_(headers) {
  const ss = getSpreadsheet_();
  const sheets = ss.getSheets();

  for (var i = 0; i < sheets.length; i += 1) {
    const sheet = sheets[i];
    if (sheet.getLastRow() < 1 || sheet.getLastColumn() < headers.length) continue;

    const row = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const match = headers.every(function(h, idx) {
      return String(row[idx] || '') === h;
    });

    if (match) return sheet;
  }

  return null;
}

function findSheetByAnyHeaders_(headersList) {
  for (var i = 0; i < headersList.length; i += 1) {
    const sheet = findSheetByHeaders_(headersList[i]);
    if (sheet) return sheet;
  }
  return null;
}

function writeRows_(sheet, headers, rows) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  if (!rows || rows.length === 0) return;
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function readRowsAsObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1)
    .filter(function(row) {
      return row.some(function(cell) { return String(cell).trim() !== ''; });
    })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = row[idx];
      });
      return obj;
    });
}

function normalizeTags_(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (value === null || value === undefined) return '[]';
  const text = String(value).trim();
  if (text === '') return '[]';
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return JSON.stringify(parsed);
  } catch (err) {}
  return JSON.stringify(text.split(',').map(function(s) { return s.trim(); }).filter(Boolean));
}

function toIntOrNull_(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function toDateString_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return '';
  return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function makeId_(prefix, index) {
  return prefix + '_' + index + '_' + new Date().getTime();
}

function firstNonEmpty_(row, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

function loadFromLegacySheet_(sheet) {
  const rows = readRowsAsObjects_(sheet);
  const categoryMap = {};
  const categories = [];

  function ensureCategory(name) {
    const n = String(name || '').trim();
    if (!n) return null;
    if (!categoryMap[n]) {
      const id = 'legacy_cat_' + String(categories.length + 1);
      categoryMap[n] = id;
      categories.push({
        id: id,
        name: n,
        limit_count: null,
        ideal_count: null,
        sort_order: categories.length + 1,
      });
    }
    return categoryMap[n];
  }

  const inventoryItems = [];
  const wishlistItems = [];
  const behaviorEvents = [];

  rows.forEach(function(row, idx) {
    const name = String(firstNonEmpty_(row, ['name', 'Product Name'])).trim();
    if (!name) return;

    const categoryName = String(firstNonEmpty_(row, ['category', 'category2', 'tag', 'type']) || 'Uncategorized').trim() || 'Uncategorized';
    const categoryId = ensureCategory(categoryName);
    const statusRaw = String(firstNonEmpty_(row, ['status'])).trim().toLowerCase();
    const isWishlist = WISHLIST_STATUSES.indexOf(statusRaw) >= 0;

    const type = String(firstNonEmpty_(row, ['type']) || '');
    const brand = String(firstNonEmpty_(row, ['barand', 'brand', 'Brand']) || '');
    const color = String(firstNonEmpty_(row, ['color', 'Color']) || '');
    const season = String(firstNonEmpty_(row, ['season', 'Season']) || '');
    const category2 = String(firstNonEmpty_(row, ['category2', 'tag']) || '');
    const imageUrl = String(firstNonEmpty_(row, ['image_url', 'product_image']) || '');

    const tags = [];
    if (brand) tags.push(brand);
    if (color) tags.push(color);
    if (season) tags.push(season);
    if (category2) tags.push(category2);

    const qty = toIntOrNull_(firstNonEmpty_(row, ['remaining', 'capacity', 'Capacity'])) || 1;
    const createdAt = new Date().toISOString();

    if (isWishlist) {
      wishlistItems.push({
        id: String(row.id || makeId_('wish', idx + 1)),
        name: name,
        category_id: categoryId,
        price: toIntOrNull_(firstNonEmpty_(row, ['price'])),
        priority: 2,
        need_by: null,
        notes: row['url'] ? String(row['url']) : null,
        status: statusRaw || 'wish',
        created_at: createdAt,
        updated_at: createdAt,
      });
    } else {
      inventoryItems.push({
        id: String(row.id || makeId_('inv', idx + 1)),
        name: name,
        category_id: categoryId,
        category: String(firstNonEmpty_(row, ['category']) || categoryName),
        type: type,
        brand: brand,
        status: String(firstNonEmpty_(row, ['status']) || ''),
        fav: String(firstNonEmpty_(row, ['fav']) || ''),
        color: color,
        season: season,
        category2: category2,
        remaining: String(firstNonEmpty_(row, ['remaining']) || qty),
        purchase_date: toDateString_(firstNonEmpty_(row, ['purchase_date', 'Purchase date'])),
        price: toIntOrNull_(firstNonEmpty_(row, ['price'])),
        capacity: String(firstNonEmpty_(row, ['capacity', 'Capacity']) || ''),
        url: String(firstNonEmpty_(row, ['url']) || ''),
        tags: tags,
        image_url: imageUrl,
        qty: qty,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    const purchaseDate = toDateString_(firstNonEmpty_(row, ['purchase_date', 'Purchase date']));
    const amount = toIntOrNull_(firstNonEmpty_(row, ['price']));
    if (purchaseDate && amount !== null) {
      behaviorEvents.push({
        id: makeId_('evt', idx + 1),
        event_type: 'purchase',
        date: purchaseDate,
        category_id: categoryId,
        item_name: name,
        qty: 1,
        amount: amount,
        source_wishlist_id: null,
        created_at: createdAt,
      });
    }
  });

  return {
    categories: categories,
    inventoryItems: inventoryItems,
    deletedInventoryItems: [],
    wishlistItems: wishlistItems,
    budgetMonths: [],
    behaviorEvents: behaviorEvents,
  };
}

function projectToLegacyRows_(data) {
  const categoryById = {};
  (data.categories || []).forEach(function(c) {
    categoryById[c.id] = c;
  });

  const rows = [];

  (data.inventoryItems || []).forEach(function(item, idx) {
    const category = categoryById[item.category_id];
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const brand = item.brand || tags[0] || '';
    const color = item.color || tags[1] || '';
    const season = item.season || tags[2] || '';
    const category2 = item.category2 || tags[3] || '';

    rows.push([
      item.id || makeId_('inv', idx + 1),
      item.name || '',
      brand,
      item.type || '',
      category ? category.name : '',
          category2,
      item.status || 'owned',
      item.fav || '',
      color,
      season,
      item.remaining || item.qty || 1,
      item.purchase_date || '',
      item.price == null ? '' : item.price,
      item.capacity || item.qty || 1,
      item.url || '',
      item.image_url || '',
      '',
      '',
      '',
    ]);
  });

  (data.wishlistItems || []).forEach(function(item, idx) {
    const category = categoryById[item.category_id];

    rows.push([
      item.id || makeId_('wish', idx + 1),
      item.name || '',
      '',
      category ? category.name : '',
      category ? category.name : '',
      '',
      item.status || 'wish',
      '',
      '',
      '',
      '',
      '',
      item.price == null ? '' : item.price,
      1,
      item.notes || '',
      '',
      '',
      '',
      '',
    ]);
  });

  return rows;
}

function projectToLegacyRowsOld_(data) {
  const categoryById = {};
  (data.categories || []).forEach(function(c) {
    categoryById[c.id] = c;
  });

  const rows = [];

  (data.inventoryItems || []).forEach(function(item, idx) {
    const category = categoryById[item.category_id];
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const brand = item.brand || tags[0] || '';
    const color = item.color || tags[1] || '';
    const season = item.season || tags[2] || '';
    const category2 = item.category2 || tags[3] || '';

    rows.push([
      item.id || makeId_('inv', idx + 1),
      item.name || '',
      brand,
      'owned',
      '',
      color,
      category ? category.name : '',
      category2,
      season,
      '',
      '',
      '',
      item.qty || 1,
      '',
      item.image_url || '',
    ]);
  });

  (data.wishlistItems || []).forEach(function(item, idx) {
    const category = categoryById[item.category_id];

    rows.push([
      item.id || makeId_('wish', idx + 1),
      item.name || '',
      '',
      item.status || 'wish',
      '',
      '',
      category ? category.name : '',
      '',
      '',
      '',
      '',
      item.price == null ? '' : item.price,
      1,
      item.notes || '',
      '',
    ]);
  });

  return rows;
}

function saveData_(data) {
  const categoriesHeaders = ['id', 'name', 'limit_count', 'ideal_count', 'sort_order'];
  const inventoryHeaders = INVENTORY_HEADERS;
  const deletedInventoryHeaders = ['id', 'name', 'category_id', 'category', 'type', 'brand', 'status', 'fav', 'color', 'season', 'category2', 'remaining', 'purchase_date', 'price', 'capacity', 'url', 'tags', 'image_url', 'qty', 'created_at', 'updated_at', 'deleted_at'];
  const wishlistHeaders = ['id', 'name', 'category_id', 'price', 'priority', 'need_by', 'notes', 'status', 'created_at', 'updated_at'];
  const budgetHeaders = ['id', 'month', 'budget_limit', 'created_at', 'updated_at'];
  const eventHeaders = ['id', 'event_type', 'date', 'category_id', 'item_name', 'qty', 'amount', 'source_wishlist_id', 'created_at'];

  const categoriesSheet = getOrCreateSheet_(SHEET_NAMES.categories, categoriesHeaders);
  const inventorySheet = ensureCanonicalSheetSchema_(
    SHEET_NAMES.inventoryItems,
    INVENTORY_HEADERS,
    INVENTORY_HEADER_ALIASES
  );
  const deletedInventorySheet = getOrCreateSheet_(SHEET_NAMES.deletedInventoryItems, deletedInventoryHeaders);
  const wishlistSheet = getOrCreateSheet_(SHEET_NAMES.wishlistItems, wishlistHeaders);
  const budgetSheet = getOrCreateSheet_(SHEET_NAMES.budgetMonths, budgetHeaders);
  const eventSheet = getOrCreateSheet_(SHEET_NAMES.behaviorEvents, eventHeaders);

  const categoriesRows = (data.categories || []).map(function(c) {
    return [c.id, c.name, c.limit_count, c.ideal_count, c.sort_order];
  });

  const inventoryRows = (data.inventoryItems || []).map(function(i) {
    const tag = i.tag || i.category2 || '';
    return [
      i.id,
      i.name,
      i.category_id,
      i.category || '',
      i.type || '',
      i.brand || '',
      i.status || '',
      i.fav || '',
      i.color || '',
      i.season || '',
      tag,
      i.remaining || '',
      i.purchase_date || '',
      i.price == null ? '' : i.price,
      i.capacity || '',
      i.url || '',
      normalizeTags_(i.tags),
      i.image_url || '',
      i.qty,
      i.created_at,
      i.updated_at,
    ];
  });

  const deletedInventoryRows = (data.deletedInventoryItems || []).map(function(i) {
    const tag = i.tag || i.category2 || '';
    return [
      i.id,
      i.name,
      i.category_id,
      i.category || '',
      i.type || '',
      i.brand || '',
      i.status || '',
      i.fav || '',
      i.color || '',
      i.season || '',
      tag,
      i.remaining || '',
      i.purchase_date || '',
      i.price == null ? '' : i.price,
      i.capacity || '',
      i.url || '',
      normalizeTags_(i.tags),
      i.image_url || '',
      i.qty,
      i.created_at,
      i.updated_at,
      i.deleted_at || '',
    ];
  });

  const wishlistRows = (data.wishlistItems || []).map(function(w) {
    return [w.id, w.name, w.category_id, w.price, w.priority, w.need_by, w.notes, w.status, w.created_at, w.updated_at];
  });

  const budgetRows = (data.budgetMonths || []).map(function(b) {
    return [b.id, b.month, b.budget_limit, b.created_at, b.updated_at];
  });

  const eventRows = (data.behaviorEvents || []).map(function(ev) {
    return [ev.id, ev.event_type, ev.date, ev.category_id, ev.item_name, ev.qty, ev.amount, ev.source_wishlist_id, ev.created_at];
  });

  writeRows_(categoriesSheet, categoriesHeaders, categoriesRows);
  writeRows_(inventorySheet, inventoryHeaders, inventoryRows);
  writeRows_(deletedInventorySheet, deletedInventoryHeaders, deletedInventoryRows);
  writeRows_(wishlistSheet, wishlistHeaders, wishlistRows);
  writeRows_(budgetSheet, budgetHeaders, budgetRows);
  writeRows_(eventSheet, eventHeaders, eventRows);

  if (WRITE_BACK_LEGACY_SHEET) {
    const legacySheet = findSheetByAnyHeaders_([
      LEGACY_HEADERS_TAG,
      LEGACY_HEADERS,
      LEGACY_HEADERS_TYPO_TAG,
      LEGACY_HEADERS_TYPO,
      LEGACY_HEADERS_OLD,
    ]);
    if (legacySheet) {
      const headerRow = legacySheet.getRange(1, 1, 1, legacySheet.getLastColumn()).getValues()[0].map(function(v) {
        return String(v || '');
      });
      const useOld = LEGACY_HEADERS_OLD.every(function(h, idx) { return headerRow[idx] === h; });
      const useTag = LEGACY_HEADERS_TAG.every(function(h, idx) { return headerRow[idx] === h; });
      const useTypo = LEGACY_HEADERS_TYPO.every(function(h, idx) { return headerRow[idx] === h; });
      const useTypoTag = LEGACY_HEADERS_TYPO_TAG.every(function(h, idx) { return headerRow[idx] === h; });
      if (useOld) {
        writeRows_(legacySheet, LEGACY_HEADERS_OLD, projectToLegacyRowsOld_(data));
      } else if (useTag) {
        writeRows_(legacySheet, LEGACY_HEADERS_TAG, projectToLegacyRows_(data));
      } else if (useTypoTag) {
        writeRows_(legacySheet, LEGACY_HEADERS_TYPO_TAG, projectToLegacyRows_(data));
      } else if (useTypo) {
        writeRows_(legacySheet, LEGACY_HEADERS_TYPO, projectToLegacyRows_(data));
      } else {
        writeRows_(legacySheet, LEGACY_HEADERS, projectToLegacyRows_(data));
      }
    }
  }
}

function loadData_() {
  const categoriesSheet = getOrCreateSheet_(SHEET_NAMES.categories, ['id', 'name', 'limit_count', 'ideal_count', 'sort_order']);
  const inventorySheet = ensureCanonicalSheetSchema_(
    SHEET_NAMES.inventoryItems,
    INVENTORY_HEADERS,
    INVENTORY_HEADER_ALIASES
  );
  const deletedInventorySheet = getOrCreateSheet_(SHEET_NAMES.deletedInventoryItems, ['id', 'name', 'category_id', 'category', 'type', 'brand', 'status', 'fav', 'color', 'season', 'category2', 'remaining', 'purchase_date', 'price', 'capacity', 'url', 'tags', 'image_url', 'qty', 'created_at', 'updated_at', 'deleted_at']);
  const wishlistSheet = getOrCreateSheet_(SHEET_NAMES.wishlistItems, ['id', 'name', 'category_id', 'price', 'priority', 'need_by', 'notes', 'status', 'created_at', 'updated_at']);
  const budgetSheet = getOrCreateSheet_(SHEET_NAMES.budgetMonths, ['id', 'month', 'budget_limit', 'created_at', 'updated_at']);
  const eventSheet = getOrCreateSheet_(SHEET_NAMES.behaviorEvents, ['id', 'event_type', 'date', 'category_id', 'item_name', 'qty', 'amount', 'source_wishlist_id', 'created_at']);

  const categories = readRowsAsObjects_(categoriesSheet).map(function(c) {
    return {
      id: String(c.id || ''),
      name: String(c.name || ''),
      limit_count: toIntOrNull_(c.limit_count),
      ideal_count: toIntOrNull_(c.ideal_count),
      sort_order: toIntOrNull_(c.sort_order) || 0,
    };
  });

  const inventoryItems = readRowsAsObjects_(inventorySheet).map(function(i) {
    let tags = [];
    try {
      tags = JSON.parse(i.tags || '[]');
      if (!Array.isArray(tags)) tags = [];
    } catch (err) {
      tags = [];
    }

    return {
      id: String(i.id || ''),
      name: String(i.name || ''),
      category_id: String(i.category_id || ''),
      category: String(i.category || ''),
      type: String(i.type || ''),
      brand: String(i.brand || tags[0] || ''),
      status: String(i.status || ''),
      fav: String(i.fav || ''),
      color: String(i.color || tags[1] || ''),
      season: String(i.season || tags[2] || ''),
      tag: String(i.tag || i.category2 || tags[3] || ''),
      category2: String(i.tag || i.category2 || tags[3] || ''),
      remaining: String(i.remaining || i.qty || ''),
      purchase_date: String(i.purchase_date || ''),
      price: toIntOrNull_(i.price),
      capacity: String(i.capacity || ''),
      url: String(i.url || ''),
      tags: tags,
      image_url: String(i.image_url || ''),
      qty: toIntOrNull_(i.qty) || 0,
      created_at: String(i.created_at || ''),
      updated_at: String(i.updated_at || ''),
    };
  });

  const deletedInventoryItems = readRowsAsObjects_(deletedInventorySheet).map(function(i) {
    let tags = [];
    try {
      tags = JSON.parse(i.tags || '[]');
      if (!Array.isArray(tags)) tags = [];
    } catch (err) {
      tags = [];
    }

    return {
      id: String(i.id || ''),
      name: String(i.name || ''),
      category_id: String(i.category_id || ''),
      category: String(i.category || ''),
      type: String(i.type || ''),
      brand: String(i.brand || tags[0] || ''),
      status: String(i.status || ''),
      fav: String(i.fav || ''),
      color: String(i.color || tags[1] || ''),
      season: String(i.season || tags[2] || ''),
      tag: String(i.tag || i.category2 || tags[3] || ''),
      category2: String(i.tag || i.category2 || tags[3] || ''),
      remaining: String(i.remaining || i.qty || ''),
      purchase_date: String(i.purchase_date || ''),
      price: toIntOrNull_(i.price),
      capacity: String(i.capacity || ''),
      url: String(i.url || ''),
      tags: tags,
      image_url: String(i.image_url || ''),
      qty: toIntOrNull_(i.qty) || 0,
      created_at: String(i.created_at || ''),
      updated_at: String(i.updated_at || ''),
      deleted_at: String(i.deleted_at || ''),
    };
  });

  const wishlistItems = readRowsAsObjects_(wishlistSheet).map(function(w) {
    return {
      id: String(w.id || ''),
      name: String(w.name || ''),
      category_id: String(w.category_id || ''),
      price: toIntOrNull_(w.price),
      priority: toIntOrNull_(w.priority) || 2,
      need_by: w.need_by ? String(w.need_by) : null,
      notes: w.notes ? String(w.notes) : null,
      status: String(w.status || 'wish'),
      created_at: String(w.created_at || ''),
      updated_at: String(w.updated_at || ''),
    };
  });

  const budgetMonths = readRowsAsObjects_(budgetSheet).map(function(b) {
    return {
      id: String(b.id || ''),
      month: String(b.month || ''),
      budget_limit: toIntOrNull_(b.budget_limit),
      created_at: String(b.created_at || ''),
      updated_at: String(b.updated_at || ''),
    };
  });

  const behaviorEvents = readRowsAsObjects_(eventSheet).map(function(ev) {
    return {
      id: String(ev.id || ''),
      event_type: String(ev.event_type || ''),
      date: String(ev.date || ''),
      category_id: String(ev.category_id || ''),
      item_name: String(ev.item_name || ''),
      qty: toIntOrNull_(ev.qty) || 1,
      amount: toIntOrNull_(ev.amount),
      source_wishlist_id: ev.source_wishlist_id ? String(ev.source_wishlist_id) : null,
      created_at: String(ev.created_at || ''),
    };
  });

  const hasData = categories.length || inventoryItems.length || deletedInventoryItems.length || wishlistItems.length || budgetMonths.length || behaviorEvents.length;
  if (hasData) {
    return {
      categories: categories,
      inventoryItems: inventoryItems,
      deletedInventoryItems: deletedInventoryItems,
      wishlistItems: wishlistItems,
      budgetMonths: budgetMonths,
      behaviorEvents: behaviorEvents,
    };
  }

  // 標準シート側にデータがない場合のみ、旧フォーマットシートをフォールバックとして読む
  const legacySheet = findSheetByAnyHeaders_([
    LEGACY_HEADERS_TAG,
    LEGACY_HEADERS,
    LEGACY_HEADERS_TYPO_TAG,
    LEGACY_HEADERS_TYPO,
    LEGACY_HEADERS_OLD,
  ]);
  if (legacySheet && readRowsAsObjects_(legacySheet).length > 0) {
    return loadFromLegacySheet_(legacySheet);
  }

  return {
    categories: [],
    inventoryItems: [],
    deletedInventoryItems: [],
    wishlistItems: [],
    budgetMonths: [],
    behaviorEvents: [],
  };
}
