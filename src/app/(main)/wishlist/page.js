"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import UniversalModal from "@/components/UniversalModal";
import QuickAddModal from "@/components/QuickAddModal";
import { Rule } from "@/components/ui/SectionHeading";
import { GUTTER } from "@/lib/design";
import { genderHeading } from "@/lib/gender";

const hasSpecialOfferTag = (p) =>
  (p.tags || []).some((t) => /special\s*-?\s*offer/i.test(t));

export default function WishlistPage() {
  const { items, removeItem, hydrated } = useWishlist();
  const [catalog, setCatalog] = useState(null); // slug -> full perfume (null = loading)
  const [modalPerfume, setModalPerfume] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load full perfume data so wishlist cards match the Shop All cards.
  useEffect(() => {
    fetch("/api/perfumes?limit=500")
      .then((r) => r.json())
      .then((d) => {
        const map = {};
        (d.perfumes || []).forEach((p) => {
          map[p.slug] = p;
        });
        setCatalog(map);
      })
      .catch(() => setCatalog({}));
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#373838] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c9a25a]/25 border-t-[#c9a25a] rounded-full animate-spin" />
      </div>
    );
  }

  const loading = catalog === null;

  return (
    <div className="min-h-screen bg-[#373838]">
      {/* pt-14/pt-20 adds breathing room between the menu bar and the heading */}
      <div className={`${GUTTER} pt-14 md:pt-20 pb-12`}>
        <div className="text-center">
          <div className="inline-block">
            <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
              My Wishlist
            </h1>
            <Rule className="mt-2" />
          </div>
          <p className="mt-5 font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug text-[#d2c1ac]">
            {items.length === 0
              ? "Your wishlist is empty. Browse our collection and save your favourites."
              : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 border border-[#d1ae6d] bg-[#2e2e2e] px-6 py-14 text-center">
            <svg
              className="w-16 h-16 mx-auto text-[#c9a25a]/45 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-xl md:text-2xl font-normal text-[#c9a25a] mb-2">
              No items yet
            </h2>
            <p className="text-sm text-[#a99d8c] mb-6">
              Heart the perfumes you love and they&apos;ll appear here.
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-flex items-center justify-center border border-[#c9a25a] bg-[#c9a25a] px-6 py-3 text-sm font-semibold text-[#211d18] transition-colors hover:bg-[#e3c489] hover:border-[#e3c489]"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => {
              const p = catalog?.[item.slug];

              if (p) {
                const brandLabel =
                  Array.isArray(p.brands) && p.brands.length
                    ? p.brands.join(", ")
                    : p.brand || item.brand || "";
                return (
                  <ProductCard
                    key={item.slug}
                    name={p.name}
                    brand={brandLabel}
                    image={p.images?.main || item.image || ""}
                    impressionName={p.impressionName || ""}
                    slug={p.slug}
                    perfumeId={p._id}
                    editions={p.editions || []}
                    gender={p.gender || ""}
                    scentFamily={p.scentFamily || ""}
                    isBestSeller={Boolean(p.isBestSeller)}
                    discountPercent={p.discountPercent || 0}
                    globalAdmirePercent={p.globalAdmirePercent ?? 60}
                    isSpecialOffer={Boolean(p.isSpecialOffer || hasSpecialOfferTag(p))}
                    tags={p.tags || []}
                    href={`/products/${p.slug}`}
                    wishlistRemoveMode
                    onQuickView={() => {
                      setModalPerfume(p);
                      setModalOpen(true);
                    }}
                  />
                );
              }

              // Still loading the catalog → skeleton; loaded but not found
              // (perfume removed/inactive) → minimal card kept with delete.
              if (loading) {
                return (
                  <div
                    key={item.slug}
                    className="border border-[#d1ae6d]/40 bg-[#2e2e2e] overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[6.818/7.5] bg-[#3f3f3f]" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-[#3f3f3f] w-3/4" />
                      <div className="h-3 bg-[#3f3f3f] w-1/2" />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.slug}
                  className="group relative border border-[#d1ae6d] overflow-hidden bg-[#2e2e2e] flex flex-col"
                >
                  <button
                    onClick={() => removeItem(item.slug)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-[#d1ae6d]/70 bg-[#211d18]/90 backdrop-blur-sm transition-colors hover:border-[#e0342c] hover:bg-[#e0342c]"
                    aria-label="Delete from wishlist"
                  >
                    <svg
                      className="w-4 h-4 fill-[#e0342c] text-[#e0342c] transition-colors"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <div className="aspect-[6.818/7.5] bg-[#373838] flex items-center justify-center text-[#a99d8c] text-xs px-3 text-center">
                    Currently unavailable
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-[#efe7db] line-clamp-2 break-words">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-xs text-[#a99d8c] mt-0.5 line-clamp-2 break-words">
                        {item.brand}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
        heading={genderHeading(modalPerfume?.name, modalPerfume?.gender)}
      >
        {modalPerfume && (
          <QuickAddModal
            key={modalPerfume._id}
            perfume={modalPerfume}
            onClose={() => setModalOpen(false)}
          />
        )}
      </UniversalModal>
    </div>
  );
}
