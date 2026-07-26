"use client";

import { useState, useEffect, useRef } from "react";

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

const getLabel = (opts, v) => opts.find((o) => o.value === v)?.label || v;

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
        <span>{standalone && isActive ? selected?.label : label}</span>
        {isActive && !standalone && (
          <span className="opacity-80">: {selected?.label}</span>
        )}
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
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e8e4df] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-40 min-w-[180px] py-1.5 max-h-72 overflow-y-auto scrollbar-always">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-1.5 text-[12px] transition-colors hover:bg-[#faf8f5] hover:underline underline-offset-4 decoration-1 hover:font-bold ${
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
  featured,
  setFeatured,
  brand,
  setBrand,
  scentFamily,
  setScentFamily,
  onReset,
  hasControlChanges,
  extraControls = null,
  extraChips = [],
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

  const chips = [
    gender !== "all" && {
      key: "gender",
      label: `Gender: ${getLabel(GENDER_OPTIONS, gender)}`,
      clear: () => setGender("all"),
    },
    edition !== "all" && {
      key: "edition",
      label: `Collections: ${getLabel(EDITION_OPTIONS, edition)}`,
      clear: () => setEdition("all"),
    },
    season !== "all" && {
      key: "season",
      label: `Seasons: ${getLabel(SEASON_OPTIONS, season)}`,
      clear: () => setSeason("all"),
    },
    brand?.trim() && {
      key: "brand",
      label: `Brand: ${brand.trim()}`,
      clear: () => setBrand(""),
    },
    featured &&
      featured !== "all" && {
        key: "featured",
        label: getLabel(FEATURED_OPTIONS, featured),
        clear: () => setFeatured("all"),
      },
    scentFamily && {
      key: "scentFamily",
      label: `Fragrance: ${scentFamily}`,
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

        <FilterDropdown
          label="Gender"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={setGender}
        />
        <FilterDropdown
          label="Collections"
          options={EDITION_OPTIONS}
          value={edition}
          onChange={setEdition}
        />
        <FilterDropdown
          label="Seasons"
          options={SEASON_OPTIONS}
          value={season}
          onChange={setSeason}
        />
        {setScentFamily && (
          <FilterDropdown
            label="Fragrance"
            options={familyOptions}
            value={scentFamily || "all"}
            onChange={(v) => setScentFamily(v === "all" ? "" : v)}
          />
        )}

        <FilterDropdown
          label="Shop All"
          standalone
          options={FEATURED_OPTIONS}
          value={featured || "all"}
          onChange={setFeatured}
        />

        {/* Brand search */}
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
                setBrandActive(
                  (i) => (i - 1 + brandMatches.length) % brandMatches.length,
                );
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
            className={`w-full pl-8 pr-7 py-2 text-[11px] font-medium border rounded-full focus:outline-none transition-colors duration-200 ${
              brand
                ? "border-[#1a1a2e] text-[#1f1a16]"
                : "border-[#1a1a2e] text-[#4a4540] focus:border-[#1a1a2e]"
            }`}
          />
          <svg
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.35-4.35M16.65 10.5a6.15 6.15 0 1 1-12.3 0 6.15 6.15 0 0 1 12.3 0z"
            />
          </svg>
          {brand && (
            <button
              onClick={() => setBrand("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Brand suggestions */}
          {brandFocused && brandMatches.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-full min-w-[180px] bg-white border border-[#e8e4df] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-40 py-1.5 max-h-60 overflow-y-auto scrollbar-always">
              {brandMatches.map((b, i) => (
                <button
                  key={b}
                  type="button"
                  onMouseDown={() => setBrand(b)}
                  onMouseEnter={() => setBrandActive(i)}
                  className={`w-full text-left px-4 py-1.5 text-[12px] transition-colors underline-offset-4 decoration-1 ${
                    i === brandActive
                      ? "bg-[#faf8f5] text-[#1a1a2e] font-bold underline"
                      : "text-[#6b6560] hover:bg-[#faf8f5] hover:text-[#1a1a2e] hover:font-bold hover:underline"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        {extraControls}

        <div className="flex-1" />

        <button
          onClick={onReset}
          disabled={!hasControlChanges}
          className={`text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200 shrink-0 font-semibold ${
            hasControlChanges
              ? "border-[#1a1a2e] text-[#1a1a2e] hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:underline underline-offset-4 decoration-1"
              : "border-[#f0ece7] text-[#ccc8c2] cursor-default"
          }`}
        >
          Clear Filters
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
              <svg
                className="w-3 h-3 text-[#a09890]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
