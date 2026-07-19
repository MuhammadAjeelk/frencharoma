"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import UniversalModal from "@/components/UniversalModal";
import QuickAddModal from "@/components/QuickAddModal";

const BOX_SIZE = 5;
const DISCOUNT_PERCENT = 25;
const MAX_TESTERS = 30; // safety cap — up to 6 boxes

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

function get5mlVariant(editions) {
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (v.isActive && v.size === "5ml") return { edition: ed, variant: v };
    }
  }
  return null;
}

function getPerfumePrice(p) {
  const match = get5mlVariant(p.editions);
  return match?.variant?.price ?? null;
}

// The Discovery Box sells the 5ml tester, so show that variant's own photo
// when it has one; otherwise fall back to the product's default image.
function get5mlImage(p) {
  const match = get5mlVariant(p?.editions);
  return match?.variant?.images?.main || p?.images?.main || "";
}

// A tester is only pickable while its 5ml variant has stock.
function is5mlInStock(p) {
  const match = get5mlVariant(p?.editions);
  return (match?.variant?.stock ?? 0) > 0;
}

// ── Search / filter options ────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: "all", label: "All Genders" },
  { value: "men", label: "For Men" },
  { value: "women", label: "For Women" },
  { value: "unisex", label: "Unisex" },
];

const SEASON_OPTIONS = [
  { value: "all", label: "All Seasons" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
];

function matchesQuery(p, q) {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const hay = [p.name, p.impressionName, p.brand, ...(p.brands || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(term);
}

// Perfumes tagged for a combined or all-season range also match the individual season.
function matchesSeason(p, season) {
  if (season === "all") return true;
  const tags = p.tags || [];
  if (tags.includes("all-seasons") || tags.includes(season)) return true;
  if (season === "spring" || season === "summer") return tags.includes("spring-summer");
  if (season === "autumn" || season === "winter") return tags.includes("autumn-winter");
  return false;
}

// ── Empty slot placeholder ─────────────────────────────────────────────────
function EmptySlot({ index }) {
  return (
    <div className="w-11 h-11 rounded-md border border-dashed border-gray-300 bg-white flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-gray-300">{index + 1}</span>
    </div>
  );
}

// ── Filled slot — click to scroll to the card, × to remove ──────────────────
function FilledSlot({ perfume, onRemove, onScrollTo, tone = "active" }) {
  const border = tone === "done" ? "border-green-300" : "border-[#b8964e]";
  return (
    <button
      type="button"
      onClick={onScrollTo}
      title={perfume.name}
      className={`relative w-11 h-11 rounded-md overflow-hidden border ${border} group shrink-0`}
    >
      {get5mlImage(perfume) ? (
        <Image src={get5mlImage(perfume)} alt={perfume.name} fill className="object-cover" sizes="44px" />
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
      <span
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-0 right-0 w-4 h-4 bg-black/70 text-white rounded-bl flex items-center justify-center text-[11px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        ×
      </span>
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DiscoveryBoxPage() {
  const { addItem } = useCart();

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // flat list of picked IDs, grouped into boxes of 5
  const [addedToCart, setAddedToCart] = useState(false);
  const [checkoutPromptOpen, setCheckoutPromptOpen] = useState(false);
  const [modalPerfume, setModalPerfume] = useState(null); // Quick View target
  const [modalOpen, setModalOpen] = useState(false);

  // ── Search / filters ─────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [season, setSeason] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);

  const hasActiveFilters =
    query.trim() !== "" || gender !== "all" || season !== "all" || onlyInStock;

  const resetFilters = () => {
    setQuery("");
    setGender("all");
    setSeason("all");
    setOnlyInStock(false);
  };

  // Filtering only changes what's visible — `perfumes` stays the source of
  // truth for slots and selection, so a picked tester survives a filter change.
  const visiblePerfumes = useMemo(
    () =>
      perfumes.filter(
        (p) =>
          matchesQuery(p, query) &&
          (gender === "all" || p.gender === gender) &&
          matchesSeason(p, season) &&
          (!onlyInStock || is5mlInStock(p))
      ),
    [perfumes, query, gender, season, onlyInStock]
  );

  // Fetch available perfumes
  useEffect(() => {
    fetch("/api/perfumes?limit=200&sort=global-admire-desc")
      .then((r) => r.json())
      .then((data) => {
        const all = data.perfumes || [];
        // Only perfumes that actually offer a 5ml tester belong in the box.
        // Sold-out 5ml still show (marked "Sold out"); perfumes with no 5ml
        // variant at all are never listed. Available testers sort first so
        // shoppers see what they can actually pick.
        const testers = all.filter((p) => get5mlVariant(p.editions));
        testers.sort((a, b) => Number(is5mlInStock(b)) - Number(is5mlInStock(a)));
        setPerfumes(testers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const perfumeById = useCallback(
    (id) => perfumes.find((p) => p._id === id) || null,
    [perfumes]
  );

  // ── Selection logic — pick/unpick; picks auto-group into boxes of 5 ───────
  const handlePerfumeClick = useCallback((perfumeId) => {
    setSelected((prev) => {
      if (prev.includes(perfumeId)) return prev.filter((id) => id !== perfumeId);
      const perfume = perfumes.find((p) => p._id === perfumeId);
      if (perfume && !is5mlInStock(perfume)) return prev; // sold out — not pickable
      if (prev.length >= MAX_TESTERS) return prev; // safety cap
      return [...prev, perfumeId];
    });
  }, [perfumes]);

  const removeTester = useCallback((perfumeId) => {
    setSelected((prev) => prev.filter((id) => id !== perfumeId));
  }, []);

  const scrollToPerfume = useCallback((perfumeId) => {
    const el = document.getElementById(`disc-card-${perfumeId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ── Boxes (groups of 5) ──────────────────────────────────────────────────
  const packs = chunk(selected, BOX_SIZE);
  const completePacks = packs.filter((pk) => pk.length === BOX_SIZE);
  const completeCount = completePacks.length;
  const boxedIds = completePacks.flat();
  const activePackIds =
    selected.length % BOX_SIZE === 0 ? [] : packs[packs.length - 1] || [];
  const activeCount = activePackIds.length;
  const hasPartial = activeCount > 0;
  const canCheckout = completeCount >= 1;

  // ── Checkout — only complete boxes are charged (25% off) ──────────────────
  const commitBoxes = () => {
    for (const id of boxedIds) {
      const p = perfumeById(id);
      if (!p) continue;
      const match = get5mlVariant(p.editions);
      const basePrice = match?.variant?.price ?? getPerfumePrice(p) ?? 0;
      const finalPrice = Math.round(basePrice * (1 - DISCOUNT_PERCENT / 100));
      addItem({
        perfumeId: p._id,
        slug: p.slug,
        name: p.name,
        image: get5mlImage(p),
        edition: match?.edition?.key || "classic",
        size: "5ml",
        price: finalPrice,
        isDiscoveryBox: true,
      });
    }
    setSelected(activePackIds); // keep the half-filled box for later
    setCheckoutPromptOpen(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    if (hasPartial) { setCheckoutPromptOpen(true); return; }
    commitBoxes();
  };

  // ── Pricing (complete boxes only) ─────────────────────────────────────────
  const totalOriginal = boxedIds.reduce(
    (sum, id) => sum + (getPerfumePrice(perfumeById(id)) || 0),
    0
  );
  const totalDiscounted = Math.round(totalOriginal * (1 - DISCOUNT_PERCENT / 100));
  const savings = totalOriginal - totalDiscounted;

  // Active box slots (the box currently being filled)
  const slots = Array.from({ length: BOX_SIZE }, (_, i) => {
    const id = activePackIds[i];
    return id ? perfumeById(id) : null;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1a1a2e] text-white py-10 md:py-14 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#b8964e]/10" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#b8964e]/10" />
        </div>
        <nav className="flex justify-center items-center gap-2 text-xs text-white/40 mb-3">
          <Link href="/" className="hover:text-white/70">Home</Link>
          <span>/</span>
          <span className="text-white/60">Discovery Box</span>
        </nav>
        <div className="inline-flex items-center gap-2 bg-[#b8964e]/20 border border-[#b8964e]/40 rounded-full px-4 py-1 mb-4">
          <span className="text-[#b8964e] text-xs font-semibold uppercase tracking-widest">Limited Offer</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
          Discovery Box
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Build your personal tester kit. Choose exactly&nbsp;
          <strong className="text-[#b8964e]">5 fragrances</strong> in 5ml bottles and get&nbsp;
          <strong className="text-[#b8964e]">{DISCOUNT_PERCENT}% off</strong> — explore before you commit.
        </p>

        {/* Step guide */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {[
            { n: "1", label: "Pick 5 to fill a box" },
            { n: "2", label: "Add as many boxes as you like" },
            { n: "3", label: "Checkout your boxes" },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-5 h-5 rounded-full bg-[#b8964e]/30 text-[#b8964e] flex items-center justify-center font-bold text-[10px]">
                {s.n}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky box builder ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Completed boxes + the box being filled (scrolls sideways) */}
            <div className="flex items-stretch gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-thin pb-1">
              {/* Completed boxes */}
              {completePacks.map((pack, bi) => (
                <div key={bi} className="shrink-0 rounded-xl border-2 border-green-300 bg-green-50/70 p-1.5">
                  <div className="flex items-center justify-between gap-2 mb-1 px-0.5">
                    <span className="text-[10px] font-bold text-green-700 whitespace-nowrap">Box {bi + 1} ✓</span>
                    <span className="text-[9px] font-semibold text-green-600 whitespace-nowrap">{DISCOUNT_PERCENT}% off</span>
                  </div>
                  <div className="flex gap-1">
                    {pack.map((id) => {
                      const p = perfumeById(id);
                      return p ? (
                        <FilledSlot
                          key={id}
                          perfume={p}
                          tone="done"
                          onRemove={() => removeTester(id)}
                          onScrollTo={() => scrollToPerfume(id)}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              ))}

              {/* Box currently being filled */}
              <div className="shrink-0 rounded-xl border-2 border-dashed border-[#b8964e]/50 bg-[#fbf8f1] p-1.5">
                <div className="flex items-center justify-between gap-2 mb-1 px-0.5">
                  <span className="text-[10px] font-bold text-[#b8964e] whitespace-nowrap">Box {completeCount + 1}</span>
                  <span className="text-[9px] font-semibold text-gray-400 whitespace-nowrap">{activeCount}/{BOX_SIZE}</span>
                </div>
                <div className="flex gap-1">
                  {slots.map((perfume, i) =>
                    perfume ? (
                      <FilledSlot
                        key={i}
                        perfume={perfume}
                        onRemove={() => removeTester(perfume._id)}
                        onScrollTo={() => scrollToPerfume(perfume._id)}
                      />
                    ) : (
                      <EmptySlot key={i} index={i} />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Progress + CTA */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                {completeCount > 0
                  ? `${completeCount} box${completeCount > 1 ? "es" : ""} ready`
                  : `${activeCount}/${BOX_SIZE} in this box`}
              </p>
              {hasPartial && (
                <p className="text-[11px] text-[#b8964e] font-medium whitespace-nowrap">
                  {BOX_SIZE - activeCount} more to fill Box {completeCount + 1}
                </p>
              )}
              <button
                onClick={handleCheckout}
                disabled={!canCheckout}
                className={`mt-0.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  canCheckout
                    ? "bg-[#1a1a2e] text-white hover:bg-[#b8964e]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {addedToCart
                  ? "✓ Added!"
                  : canCheckout
                  ? `Add ${completeCount} Box${completeCount > 1 ? "es" : ""} to Cart →`
                  : "Pick 5 to build a box"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Section heading */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] uppercase tracking-wide">
              Choose Your Fragrances
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading
                ? "Loading…"
                : hasActiveFilters
                ? `${visiblePerfumes.length} of ${perfumes.length} testers`
                : `${perfumes.length} testers available`}
            </p>
          </div>
          {hasPartial && (
            <span className="text-xs text-[#b8964e] font-semibold">
              {BOX_SIZE - activeCount} more to fill Box {completeCount + 1}
            </span>
          )}
        </div>

        {/* ── Search + Filters ── */}
        {!loading && perfumes.length > 0 && (
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrance, brand or impression…"
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[#e8e4df] bg-white text-sm text-[#1f1a16] placeholder:text-gray-400 focus:outline-none focus:border-[#b8964e] transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-[#1a1a2e] hover:bg-gray-100 transition-colors text-sm leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Gender */}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              aria-label="Filter by gender"
              className="py-2.5 px-3 rounded-lg border border-[#e8e4df] bg-white text-sm text-[#1f1a16] focus:outline-none focus:border-[#b8964e] cursor-pointer transition-colors"
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Season */}
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              aria-label="Filter by season"
              className="py-2.5 px-3 rounded-lg border border-[#e8e4df] bg-white text-sm text-[#1f1a16] focus:outline-none focus:border-[#b8964e] cursor-pointer transition-colors"
            >
              {SEASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* In-stock only */}
            <button
              onClick={() => setOnlyInStock((v) => !v)}
              aria-pressed={onlyInStock}
              className={`py-2.5 px-4 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors ${
                onlyInStock
                  ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                  : "bg-white text-[#6b6560] border-[#e8e4df] hover:border-[#1a1a2e]"
              }`}
            >
              In stock only
            </button>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="py-2.5 px-4 rounded-lg border border-[#e8e4df] bg-white text-sm font-semibold text-[#6b6560] hover:border-[#1a1a2e] hover:text-[#1a1a2e] whitespace-nowrap transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[6.818/7.5] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && perfumes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No testers available yet</h3>
            <p className="text-sm text-gray-400 mb-6">We're stocking up. Check back soon!</p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-[#1a1a2e] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Browse All Perfumes
            </Link>
          </div>
        )}

        {/* No search/filter matches */}
        {!loading && perfumes.length > 0 && visiblePerfumes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No testers match your search</h3>
            <p className="text-sm text-gray-400 mb-5">Try a different name, brand or filter.</p>
            <button
              onClick={resetFilters}
              className="inline-block bg-[#1a1a2e] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Perfume cards */}
        {!loading && visiblePerfumes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePerfumes.map((p) => (
              <div key={p._id} id={`disc-card-${p._id}`} className="scroll-mt-40">
                <ProductCard
                  name={p.name}
                  brand={p.brands?.[0] || p.brand}
                  image={get5mlImage(p)}
                  impressionName={p.impressionName}
                  href={`/products/${p.slug}`}
                  slug={p.slug}
                  perfumeId={p._id}
                  gender={p.gender}
                  tags={p.tags}
                  globalAdmirePercent={p.globalAdmirePercent}
                  discountPercent={DISCOUNT_PERCENT}
                  isBestSeller={Boolean(p.isBestSeller)}
                  onQuickView={() => { setModalPerfume(p); setModalOpen(true); }}
                  boxMode
                  boxPrice={getPerfumePrice(p)}
                  boxSelected={selected.includes(p._id)}
                  boxSoldOut={!is5mlInStock(p)}
                  onAddToBox={() => handlePerfumeClick(p._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky bottom summary (shown when ≥1 box is complete) ─────────── */}
      {completeCount >= 1 && (
        <div className="sticky bottom-0 z-30 bg-[#1a1a2e] border-t border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="hidden sm:flex gap-1.5">
                {boxedIds.slice(0, 10).map((id, i) => {
                  const p = perfumeById(id);
                  return (
                    <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0">
                      {get5mlImage(p) ? (
                        <Image src={get5mlImage(p)} alt={p?.name || ""} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
                      )}
                    </div>
                  );
                })}
                {boxedIds.length > 10 && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 text-[10px] font-bold shrink-0">
                    +{boxedIds.length - 10}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">
                  {completeCount} Discovery Box{completeCount > 1 ? "es" : ""} · {boxedIds.length} × 5ml
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/40 text-xs line-through">PKR {totalOriginal.toLocaleString()}</span>
                  <span className="text-[#b8964e] text-xs font-bold">PKR {totalDiscounted.toLocaleString()}</span>
                  <span className="bg-[#b8964e]/20 text-[#b8964e] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Save PKR {savings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="px-6 py-3 bg-[#b8964e] text-white font-bold text-sm rounded-xl hover:bg-[#a07c3e] transition-colors whitespace-nowrap shadow-lg"
            >
              {addedToCart
                ? "✓ Added to Cart!"
                : `Add ${completeCount} Box${completeCount > 1 ? "es" : ""} to Cart →`}
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout prompt when a box is half-filled ─────────────────────── */}
      <UniversalModal
        isOpen={checkoutPromptOpen}
        onClose={() => setCheckoutPromptOpen(false)}
        heading="Finish your last box?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4a4540] leading-relaxed">
            You have <strong className="text-[#1f1a16]">{completeCount} complete box{completeCount > 1 ? "es" : ""}</strong> ready
            ({DISCOUNT_PERCENT}% off), plus a box that&apos;s only <strong className="text-[#1f1a16]">{activeCount}/{BOX_SIZE}</strong> filled.
          </p>
          <p className="text-sm text-[#4a4540] leading-relaxed">
            Check out the completed box{completeCount > 1 ? "es" : ""} now, or keep building to finish the last one?
            The {activeCount} tester{activeCount > 1 ? "s" : ""} in the unfinished box will stay in your builder.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={commitBoxes}
              className="w-full py-3 rounded-lg bg-[#1a1a2e] text-white font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Checkout {completeCount} completed box{completeCount > 1 ? "es" : ""} →
            </button>
            <button
              onClick={() => setCheckoutPromptOpen(false)}
              className="w-full py-3 rounded-lg border border-[#e8e4df] text-[#1f1a16] font-semibold text-sm hover:bg-[#faf8f5] transition-colors"
            >
              Keep building — finish this box
            </button>
          </div>
        </div>
      </UniversalModal>

      {/* ── Quick View Modal (box-aware: 5ml + Add to Box) ────────────────── */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        heading={modalPerfume?.name || ""}
      >
        {modalPerfume && (
          <QuickAddModal
            key={modalPerfume._id}
            perfume={modalPerfume}
            onClose={() => setModalOpen(false)}
            boxMode
            boxImage={get5mlImage(modalPerfume)}
            boxPrice={getPerfumePrice(modalPerfume)}
            boxDiscountPercent={DISCOUNT_PERCENT}
            boxSelected={selected.includes(modalPerfume._id)}
            boxSoldOut={!is5mlInStock(modalPerfume)}
            onAddToBox={() => handlePerfumeClick(modalPerfume._id)}
          />
        )}
      </UniversalModal>
    </div>
  );
}
