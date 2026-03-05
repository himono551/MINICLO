function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function text(sel) {
  const el = document.querySelector(sel);
  return normalizeText(el ? (el.textContent || "") : "");
}

function queryMeta(keys) {
  for (const key of keys) {
    const byProp = document.querySelector(`meta[property="${key}"]`);
    const byName = document.querySelector(`meta[name="${key}"]`);
    const value = normalizeText((byProp && byProp.getAttribute("content")) || (byName && byName.getAttribute("content")) || "");
    if (value) return value;
  }
  return "";
}

function queryFirstText(selectors) {
  for (const sel of selectors) {
    const v = text(sel);
    if (v) return v;
  }
  return "";
}

function uniqueNonEmpty(list) {
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const v = normalizeText(item);
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function cleanAmazonBrand(value) {
  let v = normalizeText(value);
  if (!v) return "";
  v = v.replace(/^ブランド[:：]\s*/i, "");
  v = v.replace(/^Brand[:：]\s*/i, "");
  v = v.replace(/^Visit the\s+(.+?)\s+Store$/i, "$1");
  return normalizeText(v);
}

function cleanName(value) {
  let v = normalizeText(value);
  if (!v) return "";
  v = v.replace(/\s+/g, " ");
  v = v.replace(/\s*[\|\-｜]\s*(Amazon|ZOZOTOWN|UNIQLO).*/i, "");
  if (/^(商品概要|商品の説明|詳細情報|商品情報)/.test(v)) return "";
  return normalizeText(v);
}

function parseJsonLd() {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  let name = "";
  let brand = "";

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script.textContent || "{}");
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of arr) {
        const target = node?.["@type"] === "Product"
          ? node
          : (node?.mainEntity?.["@type"] === "Product" ? node.mainEntity : null);
        if (!target) continue;
        if (!name) name = normalizeText(target.name || "");
        if (!brand) {
          brand = normalizeText(
            typeof target.brand === "string" ? target.brand : (target.brand?.name || "")
          );
        }
        if (name && brand) return { name, brand };
      }
    } catch (_) {
      // ignore invalid blocks
    }
  }
  return { name, brand };
}

function isAmazonHost() {
  return /(^|\.)amazon\./i.test(location.hostname || "");
}

setTimeout(() => {
  const ld = parseJsonLd();
  let amazonName = "";
  let amazonBrand = "";

  if (isAmazonHost()) {
    amazonName = queryFirstText([
      "#productTitle",
      "#title",
      "[data-cy='title-recipe']",
      "h1.a-size-large",
      "h1"
    ]);
    amazonBrand = cleanAmazonBrand(queryFirstText([
      "#bylineInfo",
      "#brand",
      "a#bylineInfo"
    ]));
  }

  const nameCandidates = uniqueNonEmpty([
    amazonName,
    ld.name,
    queryMeta(["og:title", "twitter:title"]),
    queryFirstText([
      "[itemprop='name']",
      "[data-testid='item-title']",
      ".p-goods-information__name",
      "h1"
    ]),
    document.title
  ]).map(cleanName).filter(Boolean);

  const brandCandidates = uniqueNonEmpty([
    amazonBrand,
    ld.brand,
    queryMeta(["product:brand", "brand", "og:brand"]),
    queryFirstText([
      "[itemprop='brand']",
      "[data-testid='item-brand-name']",
      ".p-goods-information__brand",
      ".brand-name",
      "#bylineInfo",
      "#brand",
      "a#bylineInfo",
      "[class*='brand']"
    ])
  ]).map(cleanAmazonBrand).filter(Boolean);

  completion({
    name: nameCandidates[0] || "NO_NAME",
    brand: brandCandidates[0] || "",
    url: location.href
  });
}, 700);
