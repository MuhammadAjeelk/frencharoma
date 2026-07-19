"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import UniversalModal from "./UniversalModal";
import QuickAddModal from "./QuickAddModal";

export default function BestSellers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

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

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisibleCount(3);
      else if (window.innerWidth >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const products = perfumes.length > 0 ? [...perfumes, ...perfumes, ...perfumes] : [];

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

  if (loading) {
    return (
      <div className="py-8 md:py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8" style={{ color: "#1a1a2e" }}>
            BEST-SELLERS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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

  if (perfumes.length === 0) return null;

  return (
    <>
      <div className="py-12 md:py-16 px-4 bg-white relative overflow-visible">
        <div className="max-w-7xl mx-auto overflow-visible">
          <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
            Customer Favourites
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
            BEST SELLERS
          </h2>
          <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-8 md:mb-10" />

          <div className="relative mb-6 md:mb-8 overflow-visible">
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 rounded-full bg-white border border-[#e8e4df] shadow-sm hover:border-[#b8964e] hover:shadow-md transition-all duration-200"
              aria-label="Previous products"
            >
              <Image src="/icons/arrow-left.svg" alt="Previous" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="min-w-0 pl-12 sm:pl-14 md:pl-16 pr-12 sm:pr-14 md:pr-16">
              <div className="flex gap-3 md:gap-4">
                {visibleItems.map((perfume, index) => {
                  const brandLabel = Array.isArray(perfume.brands) ? perfume.brands.join(", ") : perfume.brand || "";
                  const hasSpecialOfferTag = (perfume.tags || []).some((t) => /special\s*-?\s*offer/i.test(t));
                  return (
                    <div
                      key={`${currentIndex}-${index}`}
                      className="shrink-0"
                      style={{
                        width:
                          visibleCount === 1
                            ? "100%"
                            : visibleCount === 2
                            ? "calc((100% - 12px) / 2)"
                            : "calc((100% - 24px) / 3)",
                      }}
                    >
                      <ProductCard
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
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 rounded-full bg-white border border-[#e8e4df] shadow-sm hover:border-[#b8964e] hover:shadow-md transition-all duration-200"
              aria-label="Next products"
            >
              <Image src="/icons/arrow-right.svg" alt="Next" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Count + View All */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-[13px] text-[#8a847e]">
              Showing <span className="font-semibold text-[#1f1a16]">{Math.min(visibleCount, perfumes.length)}</span> of{" "}
              <span className="font-semibold text-[#1f1a16]">{perfumes.length}</span> products
            </p>
            <a
              href="/collections/shop-all?bestSeller=true"
              className="bg-[#1a1a2e] text-white px-8 md:px-10 py-3 rounded-lg hover:bg-[#2d2d44] transition-colors font-semibold text-sm tracking-wide uppercase"
            >
              View All
            </a>
          </div>
        </div>
      </div>

      <UniversalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} heading={selectedPerfume?.name || ""}>
        {selectedPerfume && <QuickAddModal key={selectedPerfume._id} perfume={selectedPerfume} onClose={() => setModalOpen(false)} />}
      </UniversalModal>
    </>
  );
}
