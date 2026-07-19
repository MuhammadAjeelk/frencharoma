// Shared pricing helpers for perfume cards and listings.
//
// Full-size cards (Shop All, Best Sellers, "You may also like") must price the
// actual bottle, NOT the cheap 5ml tester — otherwise the range starts at the
// tester price and looks misleading. The Discovery Box handles 5ml separately.

export const TESTER_SIZE = "5ml";

// Format a number as "Rs. 2,680.00".
export function formatRs(n) {
  return (
    "Rs. " +
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// Flatten active variants across enabled editions, excluding the 5ml tester.
// Each entry carries its editionKey so callers can label / add to cart.
// If a perfume has ONLY 5ml variants (tester-only), fall back to those so it
// still shows a price instead of nothing.
export function getFullSizeVariants(editions) {
  const fullSize = [];
  const testers = [];
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (!v.isActive) continue;
      const entry = { ...v, editionKey: ed.key };
      if (v.size === TESTER_SIZE) testers.push(entry);
      else fullSize.push(entry);
    }
  }
  return fullSize.length > 0 ? fullSize : testers;
}

// Min/max price across full-size variants. Returns null when nothing is sellable.
export function getPriceRange(editions) {
  const variants = getFullSizeVariants(editions);
  if (variants.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const v of variants) {
    if (v.price < min) min = v.price;
    if (v.price > max) max = v.price;
  }
  return { min, max };
}

// Lowest full-size price, or null.
export function getLowestPrice(editions) {
  const range = getPriceRange(editions);
  return range ? range.min : null;
}

// Fixed display order for editions (Luxury on top / gold, then Premium / silver).
export const EDITION_ORDER = ["luxury", "premium", "classic"];

// Enabled editions that have at least one active full-size variant, each with a
// representative variant (prefer 50ml, else cheapest full-size) and its price.
// Returned in EDITION_ORDER so banners render Luxury-first.
export function getSellableEditions(editions) {
  const out = [];
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    const full = (ed.variants || []).filter((v) => v.isActive && v.size !== TESTER_SIZE);
    if (full.length === 0) continue;
    const variant =
      full.find((v) => v.size === "50ml") ||
      full.reduce((m, v) => (v.price < m.price ? v : m), full[0]);
    out.push({ key: ed.key, variant });
  }
  out.sort((a, b) => EDITION_ORDER.indexOf(a.key) - EDITION_ORDER.indexOf(b.key));
  return out;
}

// Card headline edition: Premium's price by default, else Luxury, else the first
// sellable edition. Returns { key, variant } or null.
export function getCardEdition(editions) {
  const eds = getSellableEditions(editions);
  if (eds.length === 0) return null;
  return eds.find((e) => e.key === "premium") || eds.find((e) => e.key === "luxury") || eds[0];
}

// Single "Best For" season label derived from tags.
export function getBestFor(tags) {
  const t = tags || [];
  if (t.includes("all-seasons")) return "All Seasons";
  if (t.includes("spring-summer") || t.includes("spring") || t.includes("summer")) return "Spring & Summer";
  if (t.includes("autumn-winter") || t.includes("autumn") || t.includes("winter")) return "Autumn & Winter";
  return null;
}
