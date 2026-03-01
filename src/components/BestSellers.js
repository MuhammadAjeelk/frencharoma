"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import UniversalModal from "./UniversalModal";

// Get price range across all enabled editions/variants
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

// Quick view modal content (same as shop-all)
function QuickViewContent({ perfume, onClose }) {
  const enabledEditions = (perfume.editions || []).filter((e) => e.enabled);
  const firstEdition = enabledEditions[0] || null;
  const firstVariant = firstEdition
    ? (firstEdition.variants || []).filter((v) => v.isActive)[0] || null
    : null;

  const [selectedEdition, setSelectedEdition] = useState(firstEdition);
  const [selectedVariant, setSelectedVariant] = useState(firstVariant);

  const handleEditionChange = (edition) => {
    setSelectedEdition(edition);
    setSelectedVariant((edition.variants || []).filter((v) => v.isActive)[0] || null);
  };

  const image = perfume?.images?.main || null;
  const brandLabel = Array.isArray(perfume.brands)
    ? perfume.brands.join(", ")
    : perfume.brand || "";

  return (
    <div>
      {image && (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-white">
          <Image src={image} alt={perfume.name} fill className="object-contain p-4" sizes="500px" />
        </div>
      )}
      {brandLabel && (
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{brandLabel}</p>
      )}
      <h2 className="text-lg font-bold text-gray-900 mb-3">{perfume.name}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {perfume.gender && (
          <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700 capitalize">{perfume.gender}</span>
        )}
        {perfume.scentFamily && (
          <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700">{perfume.scentFamily}</span>
        )}
      </div>

      {perfume.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{perfume.description}</p>
      )}

      {enabledEditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Edition</p>
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
            {perfume.notes?.top?.length > 0 && (
              <p className="text-xs text-gray-600"><span className="font-medium">Top:</span> {perfume.notes.top.join(", ")}</p>
            )}
            {perfume.notes?.middle?.length > 0 && (
              <p className="text-xs text-gray-600"><span className="font-medium">Heart:</span> {perfume.notes.middle.join(", ")}</p>
            )}
            {perfume.notes?.base?.length > 0 && (
              <p className="text-xs text-gray-600"><span className="font-medium">Base:</span> {perfume.notes.base.join(", ")}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          className="w-full bg-black text-white py-3 rounded font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40"
          disabled={!selectedVariant}
        >
          Add to Cart
        </button>
        <a
          href={`/products/${perfume.slug}`}
          onClick={onClose}
          className="w-full text-center border border-black text-black py-3 rounded font-semibold text-sm hover:bg-black hover:text-white transition-colors"
        >
          View Full Details
        </a>
      </div>
    </div>
  );
}

export default function BestSellers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick view modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Fetch best sellers from DB
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch("/api/perfumes?bestSeller=true&limit=12");
        const data = await res.json();
        setPerfumes(data.perfumes || []);
      } catch (err) {
        console.error("Failed to fetch best sellers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  // Responsive visible count
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Duplicate for infinite carousel
  const products = perfumes.length > 0
    ? [...perfumes, ...perfumes, ...perfumes]
    : [];

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const next = prev - visibleCount;
      return next < 0 ? products.length - visibleCount : next;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + visibleCount;
      return next >= products.length - visibleCount + 1 ? 0 : next;
    });
  };

  const visibleItems = products.slice(currentIndex, currentIndex + visibleCount);

  // Loading skeleton
  if (loading) {
    return (
      <div className="py-8 md:py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8" style={{ color: "#1a1a2e" }}>
            BEST-SELLERS
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
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

  // No best sellers set yet
  if (perfumes.length === 0) return null;

  return (
    <>
      <div className="py-8 md:py-12 px-4 bg-white relative overflow-visible">
        <div className="max-w-7xl mx-auto overflow-visible">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8"
            style={{ color: "#1a1a2e" }}
          >
            BEST-SELLERS
          </h2>

          {/* Carousel */}
          <div className="relative mb-6 md:mb-8 overflow-visible">
            {/* Prev Arrow */}
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              aria-label="Previous products"
            >
              <Image src="/icons/arrow-left.svg" alt="Previous" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Cards */}
            <div className="min-w-0 pl-12 sm:pl-14 md:pl-16 pr-12 sm:pr-14 md:pr-16">
              <div className="flex gap-3 md:gap-4">
                {visibleItems.map((perfume, index) => {
                  const range = getPriceRange(perfume.editions);
                  const brandLabel = Array.isArray(perfume.brands)
                    ? perfume.brands.join(", ")
                    : perfume.brand || "";
                  return (
                    <div
                      key={`${currentIndex}-${index}`}
                      className="shrink-0"
                      style={{
                        width:
                          visibleCount === 1
                            ? "100%"
                            : visibleCount === 2
                            ? "calc((100% - 12px) / 2 - 12px)"
                            : visibleCount === 4
                            ? "calc((100% - 36px) / 4 - 10px)"
                            : "calc((100% - 24px) / 3 - 10px)",
                      }}
                    >
                      <ProductCard
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              aria-label="Next products"
            >
              <Image src="/icons/arrow-right.svg" alt="Next" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* View All */}
          <div className="flex justify-center">
            <a
              href="/collections/shop-all?bestSeller=true"
              className="bg-black text-white px-6 md:px-8 py-2.5 md:py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-sm md:text-base"
            >
              View all
            </a>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        heading={selectedPerfume?.name || ""}
      >
        {selectedPerfume && (
          <QuickViewContent perfume={selectedPerfume} onClose={() => setModalOpen(false)} />
        )}
      </UniversalModal>
    </>
  );
}
