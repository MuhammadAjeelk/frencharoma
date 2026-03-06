"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import UniversalModal from "@/components/UniversalModal";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

const PAGE_SIZE = 20;

// ── Helpers ────────────────────────────────────────────────────────────────
function getPriceRange(editions) {
  let min = Infinity, max = -Infinity;
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (!v.isActive) continue;
      if (v.price < min) min = v.price;
      if (v.price > max) max = v.price;
    }
  }
  if (min === Infinity) return null;
  return { min, max };
}

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
  { value: "all",           label: "All"              },
  { value: "spring-summer", label: "Spring & Summer"  },
  { value: "autumn-winter", label: "Autumn & Winter"  },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "All (Newest first)"       },
  { value: "best-sellers", label: "Best Sellers"           },
  { value: "name-asc",   label: "Alphabetically (A – Z)"  },
  { value: "name-desc",  label: "Alphabetically (Z – A)"  },
  { value: "price-asc",  label: "Price (Low – High)"      },
  { value: "price-desc", label: "Price (High – Low)"      },
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
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors select-none ${
          isActive
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black"
        }`}
      >
        <span>{label}</span>
        {isActive && (
          <span className="opacity-70">: {selected?.label}</span>
        )}
        <svg
          className={`w-3 h-3 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[160px] py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-gray-50 ${
                value === opt.value
                  ? "font-semibold text-black bg-gray-50"
                  : "text-gray-600"
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

// ── Quick view modal content ───────────────────────────────────────────────
function QuickViewContent({ perfume, onClose }) {
  const { addItem } = useCart();
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);

  const enabledEditions = (perfume.editions || []).filter((e) => e.enabled);

  useEffect(() => {
    if (enabledEditions.length > 0) {
      const first = enabledEditions[0];
      setSelectedEdition(first);
      setSelectedVariant((first.variants || []).filter((v) => v.isActive)[0] || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfume]);

  const handleEditionChange = (edition) => {
    setSelectedEdition(edition);
    setSelectedVariant((edition.variants || []).filter((v) => v.isActive)[0] || null);
  };

  const image      = perfume?.images?.main || null;
  const brandLabel = Array.isArray(perfume.brands)
    ? perfume.brands.join(", ")
    : perfume.brand || "";

  return (
    <div>
      {image && (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
          <Image src={image} alt={perfume.name} fill className="object-cover" sizes="480px" />
        </div>
      )}

      {brandLabel && (
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{brandLabel}</p>
      )}
      <h2 className="text-lg font-bold text-gray-900 mb-3">{perfume.name}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {perfume.gender    && <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700 capitalize">{perfume.gender}</span>}
        {perfume.scentFamily && <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700">{perfume.scentFamily}</span>}
      </div>

      {perfume.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{perfume.description}</p>
      )}

      {enabledEditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Edition</p>
          <div className="flex flex-wrap gap-2">
            {enabledEditions.map((ed) => (
              <button
                key={ed.key}
                onClick={() => handleEditionChange(ed)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors capitalize ${
                  selectedEdition?.key === ed.key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                {ed.key}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEdition && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {(selectedEdition.variants || []).filter((v) => v.isActive).map((v) => (
                <button
                  key={v.size}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    selectedVariant?.size === v.size
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  {v.size}
                </button>
              ))}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="text-xl font-bold text-gray-900 mb-4">PKR {selectedVariant.price.toLocaleString()}</p>
      )}

      {(perfume.notes?.top?.length > 0 || perfume.notes?.middle?.length > 0 || perfume.notes?.base?.length > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Scent Notes</p>
          <div className="space-y-1">
            {perfume.notes?.top?.length    > 0 && <p className="text-xs text-gray-600"><span className="font-medium">Top:</span> {perfume.notes.top.join(", ")}</p>}
            {perfume.notes?.middle?.length > 0 && <p className="text-xs text-gray-600"><span className="font-medium">Heart:</span> {perfume.notes.middle.join(", ")}</p>}
            {perfume.notes?.base?.length   > 0 && <p className="text-xs text-gray-600"><span className="font-medium">Base:</span> {perfume.notes.base.join(", ")}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          disabled={!selectedVariant}
          onClick={() => {
            if (!selectedVariant) return;
            addItem({
              perfumeId: perfume._id,
              slug:      perfume.slug,
              name:      perfume.name,
              image:     perfume.images?.main || "",
              edition:   selectedEdition?.key || "",
              size:      selectedVariant.size,
              price:     selectedVariant.price,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className="w-full bg-black text-white py-3 rounded font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>
        <Link
          href={`/products/${perfume.slug}`}
          onClick={onClose}
          className="w-full text-center border border-black text-black py-3 rounded font-semibold text-sm hover:bg-black hover:text-white transition-colors"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ShopAllPage() {
  // Products state
  const [perfumes,    setPerfumes]    = useState([]);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [gender,  setGender]  = useState("all");
  const [edition, setEdition] = useState("all");
  const [season,  setSeason]  = useState("all");
  const [brand,   setBrand]   = useState("");
  const [sort,    setSort]    = useState("newest");

  // Debounce brand search
  const [debouncedBrand, setDebouncedBrand] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBrand(brand), 400);
    return () => clearTimeout(t);
  }, [brand]);

  // Quick view modal
  const [modalOpen,       setModalOpen]       = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Sentinel for IntersectionObserver
  const sentinelRef = useRef(null);

  // Derived
  const hasMore       = !loading && perfumes.length < total;
  const hasActiveFilters = gender !== "all" || edition !== "all" || season !== "all" || debouncedBrand;

  // ── Build fetch URL ──────────────────────────────────────────────────────
  const buildUrl = useCallback((pageNum) => {
    const p = new URLSearchParams();
    if (gender !== "all")    p.set("gender",  gender);
    if (edition !== "all")   p.set("edition", edition);
    if (season !== "all")    p.set("tag",     season);
    if (debouncedBrand)      p.set("search",  debouncedBrand);
    if (sort === "best-sellers") {
      p.set("bestSeller", "true");
      p.set("sort", "newest");
    } else {
      p.set("sort", sort);
    }
    p.set("limit", PAGE_SIZE.toString());
    p.set("page",  pageNum.toString());
    return `/api/perfumes?${p.toString()}`;
  }, [gender, edition, season, debouncedBrand, sort]);

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
    setSeason("all");
    setBrand("");
    setSort("newest");
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-white">

        {/* ── Page Header ── */}
        <div className="py-8 md:py-12 text-center" style={{ backgroundColor: "#f3f3f3" }}>
          <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/collections/shop-all" className="hover:text-gray-800 transition-colors">Shop</Link>
            {hasActiveFilters && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">Filtered</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide" style={{ color: "#1a1a2e" }}>
            All Perfumes
          </h1>
        </div>

        {/* ── Sticky Filter Bar ── */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2 py-3">

              {/* Label */}
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1 shrink-0">
                Filters:
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
              <FilterDropdown
                label="Season"
                options={SEASON_OPTIONS}
                value={season}
                onChange={setSeason}
              />

              {/* Brand search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Brand..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={`px-3 py-1.5 text-xs border rounded focus:outline-none transition-colors w-28 ${
                    brand ? "border-black" : "border-gray-300 hover:border-gray-400 focus:border-black"
                  }`}
                />
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
                disabled={!hasActiveFilters}
                className={`text-xs px-3 py-1.5 rounded border transition-colors shrink-0 ${
                  hasActiveFilters
                    ? "border-gray-400 text-gray-600 hover:border-black hover:text-black"
                    : "border-gray-200 text-gray-300 cursor-default"
                }`}
              >
                Clear All Filters
                </button>
            </div>
          </div>
            </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Sort + Count Row */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading
                ? <span className="inline-block w-16 h-4 bg-gray-100 rounded animate-pulse" />
                : <><span className="font-semibold text-gray-900">{total.toLocaleString()}</span> Products</>
              }
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-black bg-white cursor-pointer"
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
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm border border-black text-black px-5 py-2 rounded hover:bg-black hover:text-white transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* ── Product Grid ── */}
          {!loading && perfumes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {perfumes.map((perfume) => {
                const range      = getPriceRange(perfume.editions);
                const brandLabel = Array.isArray(perfume.brands) && perfume.brands.length > 0
                  ? perfume.brands.join(", ")
                  : perfume.brand || "";
                return (
                  <ProductCard
                    key={perfume._id}
                    name={perfume.name}
                    brand={brandLabel}
                    image={perfume.images?.main || ""}
                    salePrice={range ? range.min : 0}
                    originalPrice={range && range.max !== range.min ? range.max : undefined}
                    hasSale={range ? range.max !== range.min : false}
                    href={`/products/${perfume.slug}`}
                    rating={0}
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
          <QuickViewContent
            perfume={selectedPerfume}
            onClose={() => setModalOpen(false)}
          />
        )}
      </UniversalModal>
    </>
  );
}
