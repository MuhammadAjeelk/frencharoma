"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import UniversalModal from "@/components/UniversalModal";
import ProductCard from "@/components/ProductCard";
import QuickAddModal from "@/components/QuickAddModal";
import PerfumeFilterBar, {
  SortSelect,
  seasonFromTags,
  tagsForSeason,
  FEATURED_OPTIONS,
  GENDER_OPTIONS,
  EDITION_OPTIONS,
  SEASON_OPTIONS,
} from "@/components/PerfumeFilterBar";

const labelOf = (opts, v) => opts.find((o) => o.value === v)?.label || v;
const getFeaturedLabel = (v) => labelOf(FEATURED_OPTIONS, v);

const PAGE_SIZE = 20;

// ── Main Page ──────────────────────────────────────────────────────────────
function ShopAllContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const DEFAULT_SORT = "global-admire-desc";

  // Products state
  const [perfumes, setPerfumes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters — initialise from URL
  const [gender, setGender] = useState(
    () => searchParams.get("gender") || "all",
  );
  const [edition, setEdition] = useState(
    () => searchParams.get("edition") || "all",
  );
  const [season, setSeason] = useState(() =>
    seasonFromTags(searchParams.get("tags")),
  );
  const [scentFamily, setScentFamily] = useState(
    () => searchParams.get("scentFamily") || "",
  );
  const [brand, setBrand] = useState(() => searchParams.get("search") || "");
  // "Shop All" featured filter — single value backed by the URL param.
  const featuredFromParams = (sp) =>
    sp.get("bestSeller") === "true"
      ? "bestSeller"
      : sp.get("specialOffer") === "true"
        ? "specialOffer"
        : sp.get("signature") === "true"
          ? "signature"
          : sp.get("newArrival") === "true"
            ? "newArrival"
            : "all";
  const [featured, setFeatured] = useState(() => featuredFromParams(searchParams));

  // Keep URL-driven filters in sync whenever query params change (e.g. Shop menu)
  useEffect(() => {
    setGender(searchParams.get("gender") || "all");
    setEdition(searchParams.get("edition") || "all");
    setSeason(seasonFromTags(searchParams.get("tags")));
    setScentFamily(searchParams.get("scentFamily") || "");
    setBrand(searchParams.get("search") || "");
    setFeatured(featuredFromParams(searchParams));
  }, [searchParams]);

  // Change the featured filter and reflect it in the URL so the nav's active
  // tab (which reads the URL) stays in sync.
  const changeFeatured = (v) => {
    setFeatured(v);
    const p = new URLSearchParams(searchParams.toString());
    ["bestSeller", "specialOffer", "signature", "newArrival"].forEach((k) =>
      p.delete(k),
    );
    if (v !== "all") p.set(v, "true");
    const qs = p.toString();
    router.replace(`/collections/shop-all${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const [sort, setSort] = useState(DEFAULT_SORT);

  // Debounce brand search (init from URL so we don't wipe an incoming ?search=)
  const [debouncedBrand, setDebouncedBrand] = useState(
    () => searchParams.get("search") || "",
  );
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBrand(brand.trim()), 400);
    return () => clearTimeout(t);
  }, [brand]);

  // Keep the ?search= URL param in sync with the brand filter, so clearing it
  // removes the param (and the SHOP BY BRAND nav tab de-activates).
  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (current === debouncedBrand) return;
    const p = new URLSearchParams(searchParams.toString());
    if (debouncedBrand) p.set("search", debouncedBrand);
    else p.delete("search");
    const qs = p.toString();
    router.replace(`/collections/shop-all${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }, [debouncedBrand]);

  // Quick view modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Sentinel for IntersectionObserver
  const sentinelRef = useRef(null);

  // Derived
  const hasMore = !loading && perfumes.length < total;
  const hasActiveFilters =
    gender !== "all" ||
    edition !== "all" ||
    season !== "all" ||
    brand.trim() ||
    featured !== "all" ||
    scentFamily;
  const hasControlChanges = hasActiveFilters || sort !== DEFAULT_SORT;

  // Applied filters as an ordered breadcrumb (the "filter stack")
  const filterCrumbs = [
    featured !== "all" && getFeaturedLabel(featured),
    gender !== "all" && labelOf(GENDER_OPTIONS, gender),
    edition !== "all" && labelOf(EDITION_OPTIONS, edition),
    season !== "all" && labelOf(SEASON_OPTIONS, season),
    scentFamily && scentFamily,
    brand.trim() && `“${brand.trim()}”`,
  ].filter(Boolean);

  // ── Build fetch URL ──────────────────────────────────────────────────────
  const buildUrl = useCallback(
    (pageNum) => {
      const p = new URLSearchParams();
      if (gender !== "all") p.set("gender", gender);
      if (edition !== "all") p.set("edition", edition);
      if (season !== "all") p.set("tags", tagsForSeason(season).join(","));
      if (scentFamily) p.set("scentFamily", scentFamily);
      if (debouncedBrand) p.set("search", debouncedBrand);
      if (featured !== "all") p.set(featured, "true");
      p.set("sort", sort);
      p.set("limit", PAGE_SIZE.toString());
      p.set("page", pageNum.toString());
      return `/api/perfumes?${p.toString()}`;
    },
    [
      gender,
      edition,
      season,
      scentFamily,
      debouncedBrand,
      featured,
      sort,
    ],
  );

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
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0 },
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
    setFeatured("all");
    setScentFamily("");
    setSort(DEFAULT_SORT);
    // Clear the URL params too, so the address bar returns to plain Shop All
    // (SHOP ALL tab becomes active and no stale ?signature=true etc. remain).
    router.replace("/collections/shop-all", { scroll: false });
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
            <Link href="/" className="hover:text-[#1f1a16] transition-colors">
              Home
            </Link>
            <span className="text-[#ccc8c2]">/</span>
            <Link
              href="/collections/shop-all"
              className="hover:text-[#1f1a16] transition-colors"
            >
              Shop
            </Link>
            {featured !== "all" ? (
              <>
                <span className="text-[#ccc8c2]">/</span>
                <span className="text-[#1f1a16] font-semibold">
                  {getFeaturedLabel(featured)}
                </span>
              </>
            ) : hasControlChanges ? (
              <>
                <span className="text-[#ccc8c2]">/</span>
                <span className="text-[#1f1a16] font-semibold">Refined</span>
              </>
            ) : null}
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
            <PerfumeFilterBar
              gender={gender}
              setGender={setGender}
              edition={edition}
              setEdition={setEdition}
              season={season}
              setSeason={setSeason}
              featured={featured}
              setFeatured={changeFeatured}
              brand={brand}
              setBrand={setBrand}
              scentFamily={scentFamily}
              setScentFamily={setScentFamily}
              onReset={clearFilters}
              hasControlChanges={hasControlChanges}
            />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Filter breadcrumb + Sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <nav className="flex items-center gap-1.5 text-[12px] flex-wrap min-w-0">
              <span className="text-[#8a847e] uppercase tracking-wide text-[11px] font-medium shrink-0">
                Filters:
              </span>
              {filterCrumbs.length > 0 ? (
                filterCrumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-[#ccc8c2]">›</span>}
                    <span className="font-semibold text-[#1f1a16] px-2 py-0.5 rounded-full bg-[#f4f0e8]">
                      {c}
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-[#6b6560]">All Perfumes</span>
              )}
            </nav>
            <SortSelect sort={sort} setSort={setSort} />
          </div>

          {/* Count */}
          <p className="text-[13px] text-[#6b6560] mb-7">
            {loading ? (
              <span className="inline-block w-16 h-4 bg-[#f0ece7] rounded animate-pulse" />
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-[#1f1a16]">
                  {perfumes.length.toLocaleString()}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#1f1a16]">
                  {total.toLocaleString()}
                </span>{" "}
                products
              </>
            )}
          </p>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg overflow-hidden animate-pulse"
                >
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
              <svg
                className="w-16 h-16 text-gray-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No perfumes found
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Try adjusting your filters or search term.
              </p>
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
                const brandLabel =
                  Array.isArray(perfume.brands) && perfume.brands.length > 0
                    ? perfume.brands.join(", ")
                    : perfume.brand || "";
                const hasSpecialOfferTag = (perfume.tags || []).some((t) =>
                  /special\s*-?\s*offer/i.test(t),
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
                    isSpecialOffer={Boolean(
                      perfume.isSpecialOffer || hasSpecialOfferTag,
                    )}
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
          <div
            ref={sentinelRef}
            className="flex justify-center items-center py-10 mt-4 min-h-[80px]"
          >
            {loadingMore && (
              <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            )}
            {!hasMore && !loading && perfumes.length > 0 && (
              <p className="text-sm text-gray-400">
                Showing all{" "}
                <span className="font-semibold text-gray-600">
                  {total.toLocaleString()}
                </span>{" "}
                perfumes
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
            <div
              key={i}
              className="border border-gray-200 rounded-lg overflow-hidden animate-pulse"
            >
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
