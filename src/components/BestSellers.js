"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BestSellerCard from "./BestSellerCard";
import UniversalModal from "./UniversalModal";
import QuickAddModal from "./QuickAddModal";
import { genderHeading } from "@/lib/gender";
import HomeHeading from "./home/HomeHeading";

// Best Sellers, as the 2026-10 mockups draw it.
// - Desktop: paper band; four cards across the middle 88.8% of the width
//   (77px in from each edge of the 1369px mockup, 21px apart), light round
//   arrows outside them that page four at a time.
// - Phones: cream band; a swipe row of 537 × 827-unit cards (71.03vw) with
//   the next one peeking in.
const GROUND = "bg-[var(--fa-home-cream)] md:bg-[var(--fa-home-paper)]";
const ROW = "md:px-[5.62vw]";

function Heading() {
  return (
    <HomeHeading
      eyebrow="Most Loved"
      title="Best Sellers"
      href="/collections/shop-all?bestSeller=true"
      desktopLink={{ href: "/collections/shop-all?bestSeller=true", label: "View All", top: 53 }}
      className={ROW}
    />
  );
}

function Chevron({ dir }) {
  return (
    <svg className="w-[45%] h-[45%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M19 12H5m0 0l6-6m-6 6l6 6" : "M5 12h14m0 0l-6-6m6 6l-6 6"} />
    </svg>
  );
}

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

  // Desktop paging width; phones scroll instead.
  useEffect(() => {
    const update = () => setVisibleCount(window.innerWidth >= 1024 ? 4 : 3);
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

  // Near the end of the phone row, fetch the next page.
  const onPhoneScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth) prefetchMore();
  };

  const card = (perfume, key) => {
    const brandLabel = Array.isArray(perfume.brands) ? perfume.brands.join(", ") : perfume.brand || "";
    return (
      <BestSellerCard
        key={key}
        look="home"
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
    );
  };

  // Desktop: four (three below lg) equal columns, 1.53vw apart.
  const colWidth =
    visibleCount === 4 ? "calc((100% - 3 * 1.53vw) / 4)" : "calc((100% - 2 * 1.53vw) / 3)";

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-20 w-[2.63vw] h-[2.63vw] min-w-8 min-h-8 max-w-12 max-h-12 rounded-full flex items-center justify-center bg-[#f1ece4] border border-[#ddd5c9] text-[#6f6a63] hover:text-[#2b2b2b] hover:border-[var(--fa-gold)] transition-colors";

  if (loading) {
    return (
      <section className={`pt-[4.1vw] pb-[8.07vw] md:pt-[34px] md:pb-[36px] ${GROUND}`} aria-busy="true">
        <Heading />
        <div className={`mt-[2.71vw] md:mt-[28px] flex gap-[1.98vw] md:gap-[1.53vw] overflow-hidden px-[3.17vw] ${ROW}`}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`shrink-0 w-[71.03vw] md:w-[calc((100%-3*1.53vw)/4)] rounded-[12px] border border-[#d8d0c4] overflow-hidden animate-pulse ${i > 1 ? "hidden md:block" : ""}`}
            >
              <div className="aspect-square bg-[#e9e2d7]" />
              <div className="h-[156px] bg-[#f4ede4] px-[15px] pt-[12px] space-y-[10px]">
                <div className="h-[14px] w-2/3 mx-auto bg-[#e3dacd]" />
                <div className="h-[12px] w-3/4 bg-[#e3dacd]" />
                <div className="h-[12px] w-1/2 bg-[#e3dacd]" />
                <div className="h-[12px] w-3/5 bg-[#e3dacd]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (perfumes.length === 0) return null;

  return (
    <>
      <section className={`pt-[4.1vw] pb-[8.07vw] md:pt-[34px] md:pb-[36px] ${GROUND}`}>
        <Heading />

        {/* Phones: swipe row */}
        <div
          onScroll={onPhoneScroll}
          className="md:hidden mt-[2.71vw] flex gap-[1.98vw] overflow-x-auto snap-x snap-mandatory scroll-px-[3.17vw] px-[3.17vw] scrollbar-none"
          role="region"
          aria-label="Best sellers"
        >
          {perfumes.map((perfume) => (
            <div key={perfume._id} className="snap-start shrink-0 w-[71.03vw]">
              {card(perfume)}
            </div>
          ))}
          <div aria-hidden="true" className="shrink-0 w-px" />
        </div>

        {/* Desktop: paged row */}
        <div className={`hidden md:block relative mt-[28px] ${ROW}`}>
          <button onClick={handlePrevious} className={`${arrow} left-[2.56vw]`} aria-label="Previous products">
            <Chevron dir={-1} />
          </button>

          <div className="flex gap-[1.53vw]">
            {visibleItems.map((perfume, index) => (
              <div key={`${currentIndex}-${index}`} className="shrink-0 min-w-0" style={{ width: colWidth }}>
                {card(perfume)}
              </div>
            ))}
          </div>

          <button onClick={handleNext} className={`${arrow} right-[2.56vw]`} aria-label="Next products">
            <Chevron dir={1} />
          </button>
        </div>
      </section>

      <UniversalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} wide heading={genderHeading(selectedPerfume?.name, selectedPerfume?.gender)}>
        {selectedPerfume && <QuickAddModal key={selectedPerfume._id} perfume={selectedPerfume} onClose={() => setModalOpen(false)} />}
      </UniversalModal>
    </>
  );
}
