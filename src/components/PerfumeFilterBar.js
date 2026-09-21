"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ── Filter options (shared by Shop All + Discovery Box) ─────────────────────
export const GENDER_OPTIONS = [
  { value: "all", label: "All Genders" },
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
  { value: "all", label: "All Seasons" },
  { value: "spring-summer", label: "Summer & Spring" },
  { value: "autumn-winter", label: "Winter & Autumn" },
  { value: "all-seasons", label: "Four Seasons (Versatile)" },
];

// The "Shop All" dropdown — single-select featured filters (map to URL params).
export const FEATURED_OPTIONS = [
  { value: "all", label: "Shop All" },
  { value: "bestSeller", label: "Best Sellers" },
  { value: "specialOffer", label: "Special Offers" },
  { value: "signature", label: "Signature Scents" },
  { value: "newArrival", label: "New Arrivals" },
];

export const SORT_OPTIONS = [
  { value: "global-admire-desc", label: "Globally Admired (High – Low)" },
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
    t
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
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

// ── Single-select pill dropdown ─────────────────────────────────────────────
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  standalone = false,
}) {
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
  const resetValue = options[0]?.value ?? "all";
  // Inactive label shows the "All …" first option (e.g. "All Genders",
  // "All Editions") rather than the short category name.
  const defaultLabel = options[0]?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 pl-3.5 py-2 text-[11px] font-semibold border rounded-full transition-colors duration-200 select-none ${
          isActive ? "pr-2" : "pr-3.5"
        } ${
          isActive
            ? "border-[#c9a25a] bg-[#c9a25a] text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489]"
            : "border-[#c9a25a]/45 bg-[#3d3d3d] text-[#cbbfae] hover:border-[#e3c489] hover:text-[#e3c489]"
        }`}
      >
        <span>{isActive ? selected?.label : defaultLabel}</span>
        {isActive ? (
          // ✕ clears this filter (doesn't toggle the dropdown)
          <span
            role="button"
            aria-label={`Clear ${label} filter`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(resetValue);
              setOpen(false);
            }}
            className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[#211d18]/70 hover:bg-[#b3261e] hover:text-[#f7ece9] transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ) : (
          <svg
            className={`w-3 h-3 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-[#2e2e2e] border border-[#c9a25a]/50 shadow-[0_8px_30px_rgba(0,0,0,0.45)] z-40 min-w-[180px] max-w-[calc(100vw-2rem)] py-1.5 max-h-72 overflow-y-auto scrollbar-always [scrollbar-color:rgba(209,174,109,0.55)_rgba(255,255,255,0.08)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-1.5 text-[12px] transition-colors hover:bg-[#3d3d3d] hover:text-[#e3c489] ${
                value === opt.value
                  ? "font-semibold text-[#e3c489] bg-[#3d3d3d]"
                  : "text-[#cbbfae]"
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
      <span className="text-[11px] font-medium text-[#a99d8c] hidden sm:inline">
        Sort by
      </span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="text-[12px] border border-[#c9a25a]/45 rounded-md px-3 py-2 focus:outline-none focus:border-[#e3c489] bg-[#3d3d3d] cursor-pointer font-medium text-[#efe7db] appearance-none pr-8 [color-scheme:dark] transition-colors hover:border-[#e3c489]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23c9a25a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
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
  featured,
  setFeatured,
  brand,
  setBrand,
  scentFamily,
  setScentFamily,
  onReset,
  hasControlChanges,
  extraControls = null,
}) {
  // Fragrance families for the "Family" dropdown (only when scentFamily is wired)
  const [families, setFamilies] = useState([]);
  useEffect(() => {
    if (!setScentFamily) return;
    fetch("/api/scent-families")
      .then((r) => r.json())
      .then((d) => setFamilies(d.families || []))
      .catch(() => {});
  }, [setScentFamily]);
  const familyOptions = [
    { value: "all", label: "All Fragrances" },
    ...families.map((f) => ({ value: f, label: f })),
  ];

  // Brand suggestions for the search box
  const [brands, setBrands] = useState([]);
  const [brandFocused, setBrandFocused] = useState(false);
  const [brandActive, setBrandActive] = useState(-1);
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => {});
  }, []);
  const brandMatches = brand?.trim()
    ? brands
        .filter(
          (b) =>
            b.toLowerCase().includes(brand.trim().toLowerCase()) &&
            b.toLowerCase() !== brand.trim().toLowerCase(),
        )
        .slice(0, 8)
    : [];

  // Right-side filter drawer (mobile/tablet) + applied-filter count badge
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const activeCount = [
    gender !== "all",
    edition !== "all",
    season !== "all",
    !!scentFamily,
    featured && featured !== "all",
    (brand || "").trim() !== "",
  ].filter(Boolean).length;

  // Filter controls, reused inline (desktop) and inside the drawer (mobile).
  const dropdowns = (
    <>
      <FilterDropdown label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
      <FilterDropdown label="Collections" options={EDITION_OPTIONS} value={edition} onChange={setEdition} />
      <FilterDropdown label="Seasons" options={SEASON_OPTIONS} value={season} onChange={setSeason} />
      {setScentFamily && (
        <FilterDropdown
          label="Fragrance"
          options={familyOptions}
          value={scentFamily || "all"}
          onChange={(v) => setScentFamily(v === "all" ? "" : v)}
        />
      )}
      <FilterDropdown label="Shop All" standalone options={FEATURED_OPTIONS} value={featured || "all"} onChange={setFeatured} />
    </>
  );

  const brandSearch = (
    <div className="relative min-w-[170px]">
      <input
        type="text"
        placeholder="Brand..."
        value={brand}
        onChange={(e) => {
          setBrand(e.target.value);
          setBrandActive(-1);
        }}
        onFocus={() => setBrandFocused(true)}
        onBlur={() => setTimeout(() => setBrandFocused(false), 150)}
        onKeyDown={(e) => {
          if (!brandFocused || brandMatches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setBrandActive((i) => (i + 1) % brandMatches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setBrandActive((i) => (i - 1 + brandMatches.length) % brandMatches.length);
          } else if (e.key === "Enter") {
            if (brandActive >= 0 && brandActive < brandMatches.length) {
              e.preventDefault();
              setBrand(brandMatches[brandActive]);
              setBrandFocused(false);
              setBrandActive(-1);
            }
          } else if (e.key === "Escape") {
            setBrandFocused(false);
            setBrandActive(-1);
          }
        }}
        className={`w-full pl-8 pr-7 py-2 text-[11px] font-medium border rounded-full bg-[#3d3d3d] text-[#efe7db] placeholder:text-[#a99d8c] focus:outline-none transition-colors duration-200 ${
          brand
            ? "border-[#e3c489]"
            : "border-[#c9a25a]/45 hover:border-[#e3c489] focus:border-[#e3c489]"
        }`}
      />
      <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a99d8c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M16.65 10.5a6.15 6.15 0 1 1-12.3 0 6.15 6.15 0 0 1 12.3 0z" />
      </svg>
      {brand && (
        <button onClick={() => setBrand("")} aria-label="Clear brand search" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a99d8c] hover:text-[#e3c489] transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {brandFocused && brandMatches.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[180px] max-w-[calc(100vw-2rem)] bg-[#2e2e2e] border border-[#c9a25a]/50 shadow-[0_8px_30px_rgba(0,0,0,0.45)] z-40 py-1.5 max-h-60 overflow-y-auto scrollbar-always [scrollbar-color:rgba(209,174,109,0.55)_rgba(255,255,255,0.08)]">
          {brandMatches.map((b, i) => (
            <button
              key={b}
              type="button"
              onMouseDown={() => setBrand(b)}
              onMouseEnter={() => setBrandActive(i)}
              className={`w-full text-left px-4 py-1.5 text-[12px] transition-colors ${
                i === brandActive
                  ? "bg-[#3d3d3d] text-[#e3c489] font-semibold"
                  : "text-[#cbbfae] hover:bg-[#3d3d3d] hover:text-[#e3c489]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const clearButton = (
    <button
      onClick={onReset}
      disabled={!hasControlChanges}
      className={`text-[11px] px-3.5 py-2 rounded-full border transition-colors duration-200 shrink-0 font-semibold ${
        hasControlChanges
          ? "hover-vibrate border-[#d4685f] text-[#e8938c] hover:bg-[#b3261e] hover:border-[#b3261e] hover:text-[#f7ece9]"
          : "border-[#5a564f] text-[#7d7669] cursor-default"
      }`}
    >
      Clear Filters
    </button>
  );

  return (
    <>
      {/* Desktop — inline filter bar (unchanged) */}
      <div className="hidden lg:block border border-[#c9a25a]/40 bg-[#2e2e2e] p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.30)]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-[family-name:var(--font-playfair)] italic text-base text-[#c9a25a] mr-1 shrink-0">
            Filters
          </span>
          {dropdowns}
          {brandSearch}
          {extraControls}
          <div className="flex-1" />
          {clearButton}
        </div>
      </div>

      {/* Mobile/tablet — a Filters button (with applied count) opens a right drawer */}
      <div className="lg:hidden flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative inline-flex items-center gap-2 rounded-full border border-[#c9a25a] bg-[#c9a25a] text-[#211d18] px-4 py-2.5 text-xs font-bold tracking-[0.06em] shadow-sm active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-[#211d18] text-[#e3c489] text-[11px] font-bold leading-none">
              {activeCount}
            </span>
          )}
        </button>
        {hasControlChanges && (
          <button
            onClick={onReset}
            className="text-[11px] px-3.5 py-2.5 rounded-full border border-[#d4685f] text-[#e8938c] font-semibold hover:bg-[#b3261e] hover:border-[#b3261e] hover:text-[#f7ece9] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right-side filter drawer (mobile/tablet) */}
      {mounted &&
        drawerOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-[86vw] max-w-sm bg-[#373838] border-l border-[#c9a25a]/40 z-[70] lg:hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.45)] animate-[slideInRight_0.28s_ease-out]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9a25a]/30">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-playfair)] italic text-lg text-[#c9a25a]">
                    Filters
                  </span>
                  {activeCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-[#c9a25a] text-[#211d18] text-[11px] font-bold leading-none">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 rounded-full text-[#cbbfae] hover:text-[#e3c489] hover:bg-white/10 active:scale-90 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3.5">
                {dropdowns}
                {brandSearch}
                {extraControls}
              </div>

              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#c9a25a]/30">
                <button
                  onClick={onReset}
                  disabled={!hasControlChanges}
                  className={`flex-1 py-3 rounded-full border text-sm font-semibold transition-colors ${
                    hasControlChanges
                      ? "border-[#d4685f] text-[#e8938c] hover:bg-[#b3261e] hover:border-[#b3261e] hover:text-[#f7ece9]"
                      : "border-[#5a564f] text-[#7d7669] cursor-default"
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#c9a25a] text-[#211d18] text-sm font-bold hover:bg-[#e3c489] transition-colors"
                >
                  Show Results
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
