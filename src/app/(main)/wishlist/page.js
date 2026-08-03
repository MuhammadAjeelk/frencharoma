"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import UniversalModal from "@/components/UniversalModal";
import QuickAddModal from "@/components/QuickAddModal";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const loading = catalog === null;

  return (
    <div className="min-h-screen bg-white">
      {/* pt-14/pt-20 adds breathing room between the menu bar and the heading */}
      <div className="max-w-7xl mx-auto px-4 pt-14 md:pt-20 pb-12">
        <h1
          className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2"
          style={{ color: "#1a1a2e" }}
        >
          My Wishlist
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {items.length === 0
            ? "Your wishlist is empty. Browse our collection and save your favourites."
            : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-gray-200 mb-4"
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
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No items yet
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Heart the perfumes you love and they&apos;ll appear here.
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-sm"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                    className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[6.818/7.5] bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.slug}
                  className="relative rounded-xl border border-gray-200 overflow-hidden bg-white flex flex-col"
                >
                  <button
                    onClick={() => removeItem(item.slug)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-50 transition-colors shadow-sm"
                    aria-label="Delete from wishlist"
                  >
                    <svg className="w-4 h-4 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <div className="aspect-[6.818/7.5] bg-gray-50 flex items-center justify-center text-gray-300 text-xs px-3 text-center">
                    Currently unavailable
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
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
        heading={modalPerfume?.name || ""}
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
