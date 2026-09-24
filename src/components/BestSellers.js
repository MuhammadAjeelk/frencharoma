"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BestSellerCard from "./BestSellerCard";
import UniversalModal from "./UniversalModal";
import QuickAddModal from "./QuickAddModal";
import { genderHeading } from "@/lib/gender";

export default function BestSellers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Paginated loading: fetch 12, then pull the next 12 in the background as the
  // user navigates — never all at once.
  const PAGE_SIZE = 12;
  const pageRef = useRef(1);
  const pagesRef = useRef(1);
  const fetchingRef = useRef(false);

  const loadPage = useCallback(async (p) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(
        `/api/perfumes?bestSeller=true&limit=${PAGE_SIZE}&page=${p}`,
      );
      const data = await res.json();
      pagesRef.current = data.pages || 1;
      pageRef.current = p;
      setPerfumes((prev) =>
        p === 1 ? data.perfumes || [] : [...prev, ...(data.perfumes || [])],
      );
    } catch (err) {
      console.error("Failed to fetch best sellers:", err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // Pull the next page in the background if there is one.
  const prefetchMore = useCallback(() => {
    if (pageRef.current < pagesRef.current && !fetchingRef.current) {
      loadPage(pageRef.current + 1);
    }
  }, [loadPage]);

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

  const n = perfumes.length;

  const handlePrevious = () => setCurrentIndex((prev) => prev - visibleCount);
  const handleNext = () => {
    setCurrentIndex((prev) => prev + visibleCount);
    prefetchMore();
  };

  // Show `visibleCount` items starting at currentIndex, wrapping over whatever
  // is loaded so far (more get appended in the background).
  const visibleItems =
    n === 0
      ? []
      : Array.from({ length: Math.min(visibleCount, n) }, (_, i) =>
          perfumes[(((currentIndex + i) % n) + n) % n],
        );

  if (loading) {
    return (
      <div className="py-10 md:py-12 bg-[var(--fa-dark)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
                Best Sellers
              </h2>
              <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,var(--fa-gold)_25%,var(--fa-gold)_75%,transparent_100%)]" />
            </div>
          </div>
          {/* Placeholder count matches the four cards the carousel shows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-[var(--fa-dark-raised)] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[var(--fa-dark-raised)]" />
                <div className="bg-[var(--fa-beige)]/20 p-4 space-y-2">
                  <div className="h-3 bg-[var(--fa-dark-raised)] w-3/4" />
                  <div className="h-3 bg-[var(--fa-dark-raised)] w-1/2" />
                  <div className="h-8 bg-[var(--fa-dark-raised)] mt-3" />
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
      <div className="py-10 md:py-12 bg-[var(--fa-dark)] relative overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="relative mb-10 md:mb-14">
            <div className="text-center">
              <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
                Best Sellers
              </h2>
              {/* rule spans the title only — solid in the middle, fading at the ends */}
              <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,var(--fa-gold)_25%,var(--fa-gold)_75%,transparent_100%)]" />
            </div>
              <p className="mt-5 text-base md:text-xl leading-snug text-[var(--fa-on-dark)] font-[family-name:var(--font-playfair)]">
                Most Loved. Most Trusted.
              </p>
            </div>

            <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
              <a
                href="/collections/shop-all?bestSeller=true"
                className="inline-flex items-center gap-2.5 rounded-md border border-[var(--fa-on-dark)]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[var(--fa-cream)] transition-colors hover:bg-[var(--fa-on-dark)] hover:text-[var(--fa-ink)]"
              >
                View All
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative mb-10 md:mb-14 overflow-visible">
            <button
              onClick={handlePrevious}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 rounded-full bg-[var(--fa-beige)] border border-[var(--fa-border)] shadow-sm text-[var(--fa-ink)] hover:bg-[var(--fa-gold)] hover:text-[var(--fa-ink)] hover:shadow-md transition-all duration-200"
              aria-label="Previous products"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="min-w-0 px-12 sm:px-14">
              <div className="flex gap-3">
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
                            : visibleCount === 3
                            ? "calc((100% - 24px) / 3)"
                            : "calc((100% - 36px) / 4)",
                      }}
                    >
                      <BestSellerCard
                        name={perfume.name}
                        brand={brandLabel}
                        image={perfume.images?.main || ""}
                        impressionName={perfume.impressionName || ""}
                        slug={perfume.slug}
                        perfumeId={perfume._id}
                        editions={perfume.editions || []}
                        gender={perfume.gender || ""}
                        scentFamily={perfume.scentFamily || ""}
                        avgRating={perfume.avgRating || 0}
                        discountPercent={perfume.discountPercent || 0}
                        globalAdmirePercent={perfume.globalAdmirePercent ?? 60}
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
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 rounded-full bg-[var(--fa-beige)] border border-[var(--fa-border)] shadow-sm text-[var(--fa-ink)] hover:bg-[var(--fa-gold)] hover:text-[var(--fa-ink)] hover:shadow-md transition-all duration-200"
              aria-label="Next products"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      <UniversalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} wide heading={genderHeading(selectedPerfume?.name, selectedPerfume?.gender)}>
        {selectedPerfume && <QuickAddModal key={selectedPerfume._id} perfume={selectedPerfume} onClose={() => setModalOpen(false)} />}
      </UniversalModal>
    </>
  );
}
