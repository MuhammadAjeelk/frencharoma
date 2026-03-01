"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import UniversalModal from "@/components/UniversalModal";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

// Helper: get main image
function getMainImage(perfume) {
  return perfume?.images?.main || null;
}

// Helper: get price range across all enabled editions/variants
function getPriceRange(editions) {
  let min = Infinity;
  let max = -Infinity;
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

// Quick view modal content
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
      const firstVariant = (first.variants || []).filter((v) => v.isActive)[0];
      setSelectedVariant(firstVariant || null);
    }
  }, [perfume]);

  const handleEditionChange = (edition) => {
    setSelectedEdition(edition);
    const firstVariant = (edition.variants || []).filter((v) => v.isActive)[0];
    setSelectedVariant(firstVariant || null);
  };

  const image = getMainImage(perfume);
  const brandLabel = Array.isArray(perfume.brands)
    ? perfume.brands.join(", ")
    : perfume.brand || "";

  return (
    <div>
      {/* Product image */}
      {image && (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-white">
          <Image
            src={image}
            alt={perfume.name}
            fill
            className="object-contain p-4"
            sizes="500px"
          />
        </div>
      )}

      {/* Brand */}
      {brandLabel && (
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {brandLabel}
        </p>
      )}

      {/* Name */}
      <h2 className="text-lg font-bold text-gray-900 mb-2">{perfume.name}</h2>

      {/* Gender + scent */}
      <div className="flex flex-wrap gap-2 mb-4">
        {perfume.gender && (
          <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700 capitalize">
            {perfume.gender}
          </span>
        )}
        {perfume.scentFamily && (
          <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700">
            {perfume.scentFamily}
          </span>
        )}
      </div>

      {/* Description */}
      {perfume.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {perfume.description}
        </p>
      )}

      {/* Edition selector */}
      {enabledEditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Edition
          </p>
          <div className="flex gap-2">
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

      {/* Size selector */}
      {selectedEdition && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {(selectedEdition.variants || [])
              .filter((v) => v.isActive)
              .map((v) => (
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

      {/* Price */}
      {selectedVariant && (
        <p className="text-xl font-bold text-gray-900 mb-4">
          PKR {selectedVariant.price.toFixed(2)}
        </p>
      )}

      {/* Notes preview */}
      {(perfume.notes?.top?.length > 0 ||
        perfume.notes?.middle?.length > 0 ||
        perfume.notes?.base?.length > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Scent Notes
          </p>
          <div className="space-y-1">
            {perfume.notes?.top?.length > 0 && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Top:</span>{" "}
                {perfume.notes.top.join(", ")}
              </p>
            )}
            {perfume.notes?.middle?.length > 0 && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Heart:</span>{" "}
                {perfume.notes.middle.join(", ")}
              </p>
            )}
            {perfume.notes?.base?.length > 0 && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Base:</span>{" "}
                {perfume.notes.base.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-2">
        <button
          className="w-full bg-black text-white py-3 rounded font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40"
          disabled={!selectedVariant}
          onClick={() => {
            if (!selectedVariant) return;
            addItem({
              perfumeId: perfume._id,
              slug: perfume.slug,
              name: perfume.name,
              image: perfume.images?.main || "",
              edition: selectedEdition?.key || "",
              size: selectedVariant.size,
              price: selectedVariant.price,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
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

const GENDERS = ["all", "men", "women", "unisex"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "best-sellers", label: "⭐ Best Sellers" },
];

export default function ShopAllPage() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [scentFamily, setScentFamily] = useState("");
  const [sort, setSort] = useState("newest");

  // Quick view modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  const fetchPerfumes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (gender !== "all") params.set("gender", gender);
      if (scentFamily) params.set("scentFamily", scentFamily);
      if (sort === "best-sellers") {
        params.set("bestSeller", "true");
        params.set("sort", "newest");
      } else {
        params.set("sort", sort);
      }
      params.set("limit", "48");

      const res = await fetch(`/api/perfumes?${params.toString()}`);
      const data = await res.json();
      setPerfumes(data.perfumes || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, gender, scentFamily, sort]);

  useEffect(() => {
    fetchPerfumes();
  }, [fetchPerfumes]);

  const handleQuickView = (perfume) => {
    setSelectedPerfume(perfume);
    setModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div
          className="py-10 md:py-14 text-center"
          style={{ backgroundColor: "#f3f3f3" }}
        >
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-800 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Shop All</span>
          </nav>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
            style={{ color: "#1a1a2e" }}
          >
            ALL PERFUMES
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center mb-8 pb-6 border-b border-gray-200">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <input
                type="text"
                placeholder="Search perfumes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Gender filter */}
            <div className="flex gap-1.5">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                    gender === g
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black"
                  }`}
                >
                  {g === "all" ? "All" : g}
                </button>
              ))}
            </div>

            {/* Scent Family */}
            <input
              type="text"
              placeholder="Scent family..."
              value={scentFamily}
              onChange={(e) => setScentFamily(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-36"
            />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && perfumes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
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
              <p className="text-sm text-gray-500">
                Try adjusting your filters or search term.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && perfumes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {perfumes.map((perfume) => {
                const range = getPriceRange(perfume.editions);
                const brand = Array.isArray(perfume.brands)
                  ? perfume.brands.join(", ")
                  : perfume.brand || "";
                return (
                  <ProductCard
                    key={perfume._id}
                    name={perfume.name}
                    brand={brand}
                    image={perfume.images?.main || ""}
                    salePrice={range ? range.min : 0}
                    originalPrice={range && range.max !== range.min ? range.max : undefined}
                    hasSale={range ? range.max !== range.min : false}
                    href={`/products/${perfume.slug}`}
                    rating={0}
                    onQuickView={() => handleQuickView(perfume)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Universal Quick View Modal */}
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
