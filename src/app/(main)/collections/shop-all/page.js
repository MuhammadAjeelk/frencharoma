"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UniversalModal from "@/components/UniversalModal";
import ProductCard from "@/components/ProductCard";
import QuickAddModal from "@/components/QuickAddModal";

const PAGE_SIZE = 20;

// ── Filter options ─────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: "all",    label: "All"      },
  { value: "men",    label: "For Men"  },
  { value: "women",  label: "For Women"},
  { value: "unisex", label: "Unisex"  },
];

const EDITION_OPTIONS = [
  { value: "all",     label: "All"             },
  { value: "luxury",  label: "Luxury Edition"  },
  { value: "premium", label: "Premium Edition" },
  { value: "classic", label: "Classic Edition" },
];

const SEASON_OPTIONS = [
  { value: "spring",      label: "Spring"      },
  { value: "summer",      label: "Summer"      },
  { value: "autumn",      label: "Autumn"      },
  { value: "winter",      label: "Winter"      },
  { value: "all-seasons", label: "All Seasons" },
];

const SORT_OPTIONS = [
  { value: "global-admire-desc", label: "Globally Admired (High – Low)" },
  { value: "newest",     label: "All (Newest first)"      },
  { value: "name-asc",   label: "Alphabetically (A – Z)" },
  { value: "name-desc",  label: "Alphabetically (Z – A)" },
  { value: "price-asc",  label: "Price (Low – High)"     },
  { value: "price-desc", label: "Price (High – Low)"     },
  { value: "discount-desc", label: "Discount (High – Low)" },
];

// ── Reusable filter dropdown ───────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected  = options.find((o) => o.value === value);
  const isActive  = value !== "all" && value !== "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none ${
          isActive
            ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
            : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
        }`}
      >
        <span>{label}</span>
        {isActive && (
          <span className="opacity-80">: {selected?.label}</span>
        )}
        <svg
          className={`w-3 h-3 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e8e4df] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-30 min-w-[180px] py-1.5 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[12px] transition-colors hover:bg-[#faf8f5] ${
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

function MultiSelectDropdown({ label, options, values, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = values.length > 0;
  const toggleValue = (value) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none ${
          isActive
            ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
            : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
        }`}
      >
        <span>{label}</span>
        {isActive && <span className="opacity-80">: {values.length} selected</span>}
        <svg
          className={`w-3 h-3 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e8e4df] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-30 min-w-[180px] py-1.5 overflow-hidden">
          {options.map((opt) => {
            const active = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleValue(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-[12px] transition-colors hover:bg-[#faf8f5] flex items-center justify-between ${
                  active ? "font-semibold text-[#1a1a2e] bg-[#faf8f5]" : "text-[#6b6560]"
                }`}
              >
                <span>{opt.label}</span>
                {active && (
                  <svg className="w-3.5 h-3.5 text-[#b8964e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────
function ShopAllContent() {
  const searchParams = useSearchParams();
  const DEFAULT_SORT = "global-admire-desc";

  // Products state
  const [perfumes,    setPerfumes]    = useState([]);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters — initialise from URL
  const [gender,      setGender]      = useState("all");
  const [edition,     setEdition]     = useState("all");
  const [seasons,     setSeasons]     = useState([]);
  const [brand,       setBrand]       = useState(() => searchParams.get("search") || "");
  const [bestSeller,  setBestSeller]  = useState(() => searchParams.get("bestSeller") === "true");
  const [specialOffer, setSpecialOffer] = useState(() => searchParams.get("specialOffer") === "true");

  // Keep URL-driven filters in sync whenever query params change
  useEffect(() => {
    setBestSeller(searchParams.get("bestSeller") === "true");
    setSpecialOffer(searchParams.get("specialOffer") === "true");
  }, [searchParams]);
  const [sort,        setSort]        = useState(DEFAULT_SORT);

  // Debounce brand search
  const [debouncedBrand, setDebouncedBrand] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBrand(brand.trim()), 400);
    return () => clearTimeout(t);
  }, [brand]);

  // Quick view modal
  const [modalOpen,       setModalOpen]       = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Sentinel for IntersectionObserver
  const sentinelRef = useRef(null);

  // Derived
  const hasMore           = !loading && perfumes.length < total;
  const hasActiveFilters  = gender !== "all" || edition !== "all" || seasons.length > 0 || brand.trim() || bestSeller || specialOffer;
  const hasControlChanges = hasActiveFilters || sort !== DEFAULT_SORT;
  const getOptionLabel = (options, value) => options.find((o) => o.value === value)?.label || value;
  const activeFilterChips = [
    gender !== "all" && {
      key: "gender",
      label: `Gender: ${getOptionLabel(GENDER_OPTIONS, gender)}`,
      clear: () => setGender("all"),
    },
    edition !== "all" && {
      key: "edition",
      label: `Category: ${getOptionLabel(EDITION_OPTIONS, edition)}`,
      clear: () => setEdition("all"),
    },
    ...seasons.map((seasonValue) => ({
      key: `season-${seasonValue}`,
      label: `Season: ${getOptionLabel(SEASON_OPTIONS, seasonValue)}`,
      clear: () => setSeasons((prev) => prev.filter((v) => v !== seasonValue)),
    })),
    brand.trim() && {
      key: "brand",
      label: `Brand: ${brand.trim()}`,
      clear: () => setBrand(""),
    },
    bestSeller && {
      key: "bestSeller",
      label: "Best Sellers",
      clear: () => setBestSeller(false),
    },
    specialOffer && {
      key: "specialOffer",
      label: "Special Offer",
      clear: () => setSpecialOffer(false),
    },
  ].filter(Boolean);

  // ── Build fetch URL ──────────────────────────────────────────────────────
  const buildUrl = useCallback((pageNum) => {
    const p = new URLSearchParams();
    if (gender !== "all")    p.set("gender",     gender);
    if (edition !== "all")   p.set("edition",    edition);
    if (seasons.length > 0)  p.set("tags",       seasons.join(","));
    if (debouncedBrand)      p.set("search",     debouncedBrand);
    if (bestSeller)          p.set("bestSeller", "true");
    if (specialOffer)        p.set("specialOffer", "true");
    p.set("sort",  sort);
    p.set("limit", PAGE_SIZE.toString());
    p.set("page",  pageNum.toString());
    return `/api/perfumes?${p.toString()}`;
  }, [gender, edition, seasons, debouncedBrand, bestSeller, specialOffer, sort]);

  // ── Fetch page 1 whenever filters change ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPerfumes([]);
    setPage(1);

    fetch(buildUrl(1))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
      setPerfumes(data.perfumes || []);
      setTotal(data.total || 0);
        setPage(1);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [buildUrl]);

  // ── Load more ────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    fetch(buildUrl(nextPage))
      .then((r) => r.json())
      .then((data) => {
        setPerfumes((prev) => [...prev, ...(data.perfumes || [])]);
        setPage(nextPage);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, page, buildUrl]);

  // ── IntersectionObserver ─────────────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Clear filters ────────────────────────────────────────────────────────
  const clearFilters = () => {
    setGender("all");
    setEdition("all");
    setSeasons([]);
    setBrand("");
    setBestSeller(false);
    setSpecialOffer(false);
    setSort(DEFAULT_SORT);
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-[#f8f5ef] via-white to-white">

        {/* ── Page Header ── */}
        <div className="relative py-12 md:py-16 text-center overflow-hidden bg-linear-to-b from-[#f3efe8] to-[#f7f5f2] border-b border-[#e8e4df]">
          <div className="absolute -left-16 -top-16 w-56 h-56 bg-[#d8c7ae]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-12 bottom-0 w-64 h-64 bg-[#eadbc6]/30 rounded-full blur-3xl pointer-events-none" />
          <nav className="relative flex justify-center items-center gap-2 text-[11px] text-[#8a847e] mb-4 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#1f1a16] transition-colors">Home</Link>
            <span className="text-[#ccc8c2]">/</span>
            <Link href="/collections/shop-all" className="hover:text-[#1f1a16] transition-colors">Shop</Link>
            {bestSeller && (
              <>
                <span className="text-[#ccc8c2]">/</span>
                <span className="text-[#1f1a16] font-semibold">Best Sellers</span>
              </>
            )}
            {specialOffer && (
              <>
                <span className="text-[#ccc8c2]">/</span>
                <span className="text-[#1f1a16] font-semibold">Special Offer</span>
              </>
            )}
            {!bestSeller && !specialOffer && hasControlChanges && (
              <>
                <span className="text-[#ccc8c2]">/</span>
                <span className="text-[#1f1a16] font-semibold">Refined</span>
              </>
            )}
          </nav>
          <h1 className="relative text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[0.04em] text-[#1a1a2e]">
            All Perfumes
          </h1>
          <div className="relative mt-2 w-10 h-[2px] bg-[#b8964e] mx-auto" />
          <p className="relative mt-3 text-sm md:text-base text-[#6b6560] tracking-wide">
            Discover signature impressions curated by mood, season and style.
          </p>
        </div>

        {/* ── Sticky Filter Bar ── */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e4df]/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="rounded-xl border border-[#e8e4df] bg-white p-3 md:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex flex-wrap items-center gap-2.5">

              {/* Label */}
              <span className="text-[10px] font-bold text-[#b8964e] uppercase tracking-[0.18em] mr-1 shrink-0">
                Filters
              </span>

              {/* Gender */}
              <FilterDropdown
                label="Gender"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
              />

              {/* Category (Edition) */}
              <FilterDropdown
                label="Category"
                options={EDITION_OPTIONS}
                value={edition}
                onChange={setEdition}
              />

              {/* Season */}
              <MultiSelectDropdown
                label="Season"
                options={SEASON_OPTIONS}
                values={seasons}
                onChange={setSeasons}
              />

              {/* Best Sellers toggle */}
              <button
                onClick={() => setBestSeller((b) => !b)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none ${
                  bestSeller
                    ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                    : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
                }`}
              >
                Best Sellers
              </button>

              {/* Special Offer toggle */}
              <button
                onClick={() => setSpecialOffer((s) => !s)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none ${
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
                    brand ? "border-[#1a1a2e] text-[#1f1a16]" : "border-[#e8e4df] text-[#4a4540] hover:border-[#ccc8c2] focus:border-[#1a1a2e]"
                  }`}
                />
                <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Spacer */}
              <div className="flex-1" />

              {/* Clear All Filters */}
              <button
                onClick={clearFilters}
                disabled={!hasControlChanges}
                className={`text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200 shrink-0 font-semibold ${
                  hasControlChanges
                    ? "border-[#ccc8c2] text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
                    : "border-[#f0ece7] text-[#ccc8c2] cursor-default"
                }`}
              >
                Reset
              </button>
              </div>

              {activeFilterChips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f0ece7] flex flex-wrap gap-2">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={chip.clear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border border-[#e8e4df] bg-[#faf8f5] text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-all duration-200"
                    >
                      <span>{chip.label}</span>
                      <svg className="w-3 h-3 text-[#a09890]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Sort + Count Row */}
          <div className="flex items-center justify-between gap-3 mb-7">
            <p className="text-[13px] text-[#6b6560]">
              {loading
                ? <span className="inline-block w-16 h-4 bg-[#f0ece7] rounded animate-pulse" />
                : (
                  <>
                    Showing <span className="font-semibold text-[#1f1a16]">{perfumes.length.toLocaleString()}</span> of{" "}
                    <span className="font-semibold text-[#1f1a16]">{total.toLocaleString()}</span> products
                  </>
                )
              }
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-[#8a847e] uppercase tracking-wide hidden sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-[12px] border border-[#e8e4df] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a1a2e] bg-white cursor-pointer font-medium text-[#1f1a16] appearance-none pr-8"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6560'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[6.818/7.5] bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && perfumes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No perfumes found</h3>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your filters or search term.</p>
              {hasControlChanges && (
                <button
                  onClick={clearFilters}
                  className="text-sm border border-black text-black px-5 py-2 rounded hover:bg-black hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {/* ── Product Grid ── */}
          {!loading && perfumes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {perfumes.map((perfume) => {
                const brandLabel = Array.isArray(perfume.brands) && perfume.brands.length > 0
                  ? perfume.brands.join(", ")
                  : perfume.brand || "";
                const hasSpecialOfferTag = (perfume.tags || []).some((t) =>
                  /special\s*-?\s*offer/i.test(t)
                );
                return (
                  <ProductCard
                    key={perfume._id}
                    name={perfume.name}
                    brand={brandLabel}
                    image={perfume.images?.main || ""}
                    impressionName={perfume.impressionName || ""}
                    slug={perfume.slug}
                    perfumeId={perfume._id}
                    editions={perfume.editions || []}
                    gender={perfume.gender || ""}
                    avgRating={perfume.avgRating || 0}
                    reviewCount={perfume.reviewCount || 0}
                    isBestSeller={Boolean(perfume.isBestSeller)}
                    discountPercent={perfume.discountPercent || 0}
                    globalAdmirePercent={perfume.globalAdmirePercent ?? 60}
                    isSpecialOffer={Boolean(perfume.isSpecialOffer || hasSpecialOfferTag)}
                    tags={perfume.tags || []}
                    href={`/products/${perfume.slug}`}
                    onQuickView={() => {
                      setSelectedPerfume(perfume);
                      setModalOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* ── Infinite Scroll Sentinel ── */}
          <div ref={sentinelRef} className="flex justify-center items-center py-10 mt-4 min-h-[80px]">
            {loadingMore && (
              <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            )}
            {!hasMore && !loading && perfumes.length > 0 && (
              <p className="text-sm text-gray-400">
                Showing all <span className="font-semibold text-gray-600">{total.toLocaleString()}</span> perfumes
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ── Quick View Modal ── */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        heading={selectedPerfume?.name || ""}
      >
        {selectedPerfume && (
          <QuickAddModal
            key={selectedPerfume._id}
            perfume={selectedPerfume}
            onClose={() => setModalOpen(false)}
          />
        )}
      </UniversalModal>
    </>
  );
}

function ShopAllFallback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8f5ef] via-white to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="h-16 w-full bg-gray-100 rounded-2xl animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[6.818/7.5] bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopAllPage() {
  return (
    <Suspense fallback={<ShopAllFallback />}>
      <ShopAllContent />
    </Suspense>
  );
}
