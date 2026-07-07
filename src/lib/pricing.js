// Shared pricing helpers for perfume cards and listings.
//
// Full-size cards (Shop All, Best Sellers, "You may also like") must price the
// actual bottle, NOT the cheap 5ml tester — otherwise the range starts at the
// tester price and looks misleading. The Discovery Box handles 5ml separately.

export const TESTER_SIZE = "5ml";

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
