"use client";

import { useState, useEffect, useRef } from "react";

// ── Filter options (shared by Shop All + Discovery Box) ─────────────────────
export const GENDER_OPTIONS = [
  { value: "all", label: "For All" },
  { value: "men", label: "For Men" },
  { value: "women", label: "For Women" },
  { value: "unisex", label: "For Unisex" },
];

export const EDITION_OPTIONS = [
  { value: "all", label: "All Editions" },
  { value: "luxury", label: "Luxury Editions" },
  { value: "premium", label: "Premium Editions" },
];

export const SEASON_OPTIONS = [
  { value: "all", label: "All" },
  { value: "spring-summer", label: "Spring & Summer" },
  { value: "autumn-winter", label: "Autumn & Winter" },
  { value: "all-seasons", label: "All Seasons (Four Seasons)" },
];

export const SORT_OPTIONS = [
  { value: "global-admire-desc", label: "Globally Admired (High – Low)" },
  { value: "newest", label: "All (Newest first)" },
  { value: "name-asc", label: "Alphabetically (A – Z)" },
  { value: "name-desc", label: "Alphabetically (Z – A)" },
  { value: "price-asc", label: "Price (Low – High)" },
  { value: "price-desc", label: "Price (High – Low)" },
  { value: "discount-desc", label: "Discount (High – Low)" },
];

// Perfumes are tagged by *individual* season in the DB (spring/summer/autumn/
// winter/all-seasons). The grouped options map to those tags.
export const SEASON_TAGS = {
  "spring-summer": ["spring", "summer"],
  "autumn-winter": ["autumn", "winter"],
  "all-seasons": ["all-seasons"],
};

export function tagsForSeason(season) {
  return SEASON_TAGS[season] || [];
}

// Reverse-map a `tags` query param back to a grouped season value.
export function seasonFromTags(t) {
  if (!t) return "all";
  const set = new Set(
    t.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  if (set.has("spring") || set.has("summer")) return "spring-summer";
  if (set.has("autumn") || set.has("winter")) return "autumn-winter";
  if (set.has("all-seasons")) return "all-seasons";
  return "all";
}

// Client-side season match against a perfume's tags.
export function matchesSeasonGroup(tags, season) {
  if (season === "all") return true;
  const want = SEASON_TAGS[season] || [];
  const set = new Set((tags || []).map((x) => String(x).toLowerCase()));
  return want.some((w) => set.has(w));
}

const getLabel = (opts, v) => opts.find((o) => o.value === v)?.label || v;

// ── Single-select pill dropdown ─────────────────────────────────────────────
export function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const isActive = value !== "all" && value !== "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none hover:underline underline-offset-4 decoration-1 ${
          isActive
            ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
            : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
        }`}
      >
        <span>{label}</span>
        {isActive && <span className="opacity-80">: {selected?.label}</span>}
        <svg
          className={`w-3 h-3 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e8e4df] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-40 min-w-[180px] py-1.5 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[12px] transition-colors hover:bg-[#faf8f5] hover:underline underline-offset-4 decoration-1 ${
                value === opt.value
                  ? "font-semibold text-[#1a1a2e] bg-[#faf8f5]"
                  : "text-[#6b6560]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sort select (native) ────────────────────────────────────────────────────
export function SortSelect({ sort, setSort }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-[#8a847e] uppercase tracking-wide hidden sm:inline">
        Sort by
      </span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="text-[12px] border border-[#e8e4df] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a1a2e] bg-white cursor-pointer font-medium text-[#1f1a16] appearance-none pr-8 hover:underline underline-offset-4 decoration-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6560'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          backgroundSize: "14px",
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── The filter bar (pills + brand search + optional extras + reset + chips) ──
export default function PerfumeFilterBar({
  gender,
  setGender,
  edition,
  setEdition,
  season,
  setSeason,
  bestSeller,
  setBestSeller,
  specialOffer,
  setSpecialOffer,
  brand,
  setBrand,
  scentFamily,
  setScentFamily,
  signature,
  setSignature,
  onReset,
  hasControlChanges,
  extraControls = null,
  extraChips = [],
}) {
  const chips = [
    gender !== "all" && {
      key: "gender",
      label: `Gender: ${getLabel(GENDER_OPTIONS, gender)}`,
      clear: () => setGender("all"),
    },
    edition !== "all" && {
      key: "edition",
      label: `Category: ${getLabel(EDITION_OPTIONS, edition)}`,
      clear: () => setEdition("all"),
    },
    season !== "all" && {
      key: "season",
      label: `Season: ${getLabel(SEASON_OPTIONS, season)}`,
      clear: () => setSeason("all"),
    },
    brand?.trim() && {
      key: "brand",
      label: `Brand: ${brand.trim()}`,
      clear: () => setBrand(""),
    },
    bestSeller && { key: "bestSeller", label: "Best Sellers", clear: () => setBestSeller(false) },
    specialOffer && { key: "specialOffer", label: "Special Offer", clear: () => setSpecialOffer(false) },
    signature && { key: "signature", label: "Signature Scent", clear: () => setSignature?.(false) },
    scentFamily && {
      key: "scentFamily",
      label: `Family: ${scentFamily}`,
      clear: () => setScentFamily?.(""),
    },
    ...extraChips,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-[#e8e4df] bg-white p-3 md:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[10px] font-bold text-[#b8964e] uppercase tracking-[0.18em] mr-1 shrink-0">
          Filters
        </span>

        <FilterDropdown label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
        <FilterDropdown label="Category" options={EDITION_OPTIONS} value={edition} onChange={setEdition} />
        <FilterDropdown label="Season" options={SEASON_OPTIONS} value={season} onChange={setSeason} />

        <button
          onClick={() => setBestSeller((b) => !b)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none hover:underline underline-offset-4 decoration-1 ${
            bestSeller
              ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
              : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
          }`}
        >
          Best Sellers
        </button>

        <button
          onClick={() => setSpecialOffer((s) => !s)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none hover:underline underline-offset-4 decoration-1 ${
            specialOffer
              ? "border-[#c2185b] bg-[#c2185b] text-white"
              : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#c2185b] hover:text-[#c2185b]"
          }`}
        >
          Special Offer
        </button>

        {/* Brand search */}
        <div className="relative min-w-[170px]">
          <input
            type="text"
            placeholder="Brand..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className={`w-full pl-8 pr-7 py-2 text-[11px] font-medium border rounded-full focus:outline-none transition-colors duration-200 ${
              brand
                ? "border-[#1a1a2e] text-[#1f1a16]"
                : "border-[#e8e4df] text-[#4a4540] hover:border-[#ccc8c2] focus:border-[#1a1a2e]"
            }`}
          />
          <svg
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M16.65 10.5a6.15 6.15 0 1 1-12.3 0 6.15 6.15 0 0 1 12.3 0z" />
          </svg>
          {brand && (
            <button
              onClick={() => setBrand("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {extraControls}

        <div className="flex-1" />

        <button
          onClick={onReset}
          disabled={!hasControlChanges}
          className={`text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200 shrink-0 font-semibold ${
            hasControlChanges
              ? "border-[#ccc8c2] text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e] hover:underline underline-offset-4 decoration-1"
              : "border-[#f0ece7] text-[#ccc8c2] cursor-default"
          }`}
        >
          Reset
        </button>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#f0ece7] flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border border-[#e8e4df] bg-[#faf8f5] text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e] hover:underline underline-offset-4 decoration-1 transition-all duration-200"
            >
              <span>{chip.label}</span>
              <svg className="w-3 h-3 text-[#a09890]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
