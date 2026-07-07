"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getFullSizeVariants } from "@/lib/pricing";

const SEASON_LABELS = {
  "spring-summer": "Spring & Summer",
  "autumn-winter": "Autumn & Winter",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
  "all-seasons": "All Seasons",
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export default function ProductCard({
  name,
  brand,
  image,
  impressionName,
  href,
  slug,
  perfumeId,
  editions = [],
  discountPercent = 0,
  isSpecialOffer = false,
  globalAdmirePercent = 60,
  tags = [],
  onQuickView,
}) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem } = useCart();

  const brandLabel = Array.isArray(brand) ? brand.join(", ") : brand;
  const seasonTags = (tags || []).filter((t) => SEASON_LABELS[t]);
  const productSlug = slug || (href ? href.replace("/products/", "") : "");
  const wishlisted = isInWishlist(productSlug);

  // ── Full-size variants (5ml tester excluded) ──────────────────────────────
  const variants = useMemo(() => getFullSizeVariants(editions), [editions]);
  const multiEdition = useMemo(
    () => new Set(variants.map((v) => v.editionKey)).size > 1,
    [variants]
  );

  const disc = Number(discountPercent) || 0;
  const finalOf = (price) => (disc > 0 ? Math.round(price * (1 - disc / 100)) : price);
  const variantLabel = (v) =>
    (multiEdition ? `${cap(v.editionKey)} · ` : "") + v.size;

  // Default to first in-stock variant, else the first one.
  const [selected, setSelected] = useState(
    () => variants.find((v) => v.stock > 0) || variants[0] || null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!dropdownOpen) return;
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropdownOpen]);

  const priceRange = useMemo(() => {
    if (variants.length === 0) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const v of variants) {
      if (v.price < min) min = v.price;
      if (v.price > max) max = v.price;
    }
    return { min, max };
  }, [variants]);
  const isRange = priceRange && priceRange.max !== priceRange.min;

  const inStock = !!(selected && selected.stock > 0);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      slug: productSlug,
      name,
      brand: brandLabel,
      image,
      price: selected ? finalOf(selected.price) : 0,
    });
  };

  const handleAddToCart = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!selected || !inStock) return;
    addItem({
      perfumeId,
      slug: productSlug,
      name,
      image: image || "",
      edition: selected.editionKey || "",
      size: selected.size,
      price: finalOf(selected.price),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative border border-[#e8e4df] rounded-xl overflow-hidden bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col">
      {/* Badges - stacked top-left */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
        {disc > 0 && (
          <span className="bg-[#1a1a2e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            -{disc}% OFF
          </span>
        )}
        {disc === 0 && isRange && (
          <span className="bg-[#b8964e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            Multiple Editions
          </span>
        )}
        {isSpecialOffer && (
          <span className="bg-[#c2185b] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            Special Offer
          </span>
        )}
      </div>

      {/* Wishlist heart - always top-right */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className={`w-[15px] h-[15px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#9a9590]"}`}
          fill={wishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Product Image + hover size/edition selector overlay */}
      <div className="relative w-full aspect-[6.818/7.5] bg-[#f7f5f2]">
        <Link href={href || "#"} className="block relative w-full h-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Selector floats over the bottom of the image — revealed on hover
            (desktop), always shown on touch. Does not affect card height. */}
        {variants.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute inset-x-2 bottom-2 z-20 transition-all duration-200 sm:opacity-0 sm:translate-y-1 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => variants.length > 1 && setDropdownOpen((o) => !o)}
              className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left bg-white/95 backdrop-blur-sm border border-white/70 shadow-md transition-colors ${
                variants.length > 1 ? "hover:bg-white cursor-pointer" : "cursor-default"
              }`}
              aria-haspopup={variants.length > 1 ? "listbox" : undefined}
              aria-expanded={variants.length > 1 ? dropdownOpen : undefined}
            >
              <span className="text-[11px] sm:text-xs font-semibold text-[#1f1a16] truncate">
                {selected ? variantLabel(selected) : "Select size"}
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                {selected && (
                  <span className="text-[11px] sm:text-xs font-bold text-[#1f1a16]">
                    Rs. {finalOf(selected.price).toLocaleString()}
                  </span>
                )}
                {variants.length > 1 && (
                  <svg
                    className={`w-3.5 h-3.5 text-[#8a847e] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
            </button>

            {dropdownOpen && variants.length > 1 && (
              <ul
                role="listbox"
                className="absolute z-30 left-0 right-0 bottom-full mb-1 bg-white border border-[#e8e4df] rounded-lg shadow-xl overflow-hidden max-h-52 overflow-y-auto"
              >
                {variants.map((v, i) => {
                  const isSel = selected === v || (selected?.editionKey === v.editionKey && selected?.size === v.size);
                  const oos = v.stock <= 0;
                  return (
                    <li key={`${v.editionKey}-${v.size}-${i}`} role="option" aria-selected={isSel}>
                      <button
                        type="button"
                        disabled={oos}
                        onClick={() => {
                          if (oos) return;
                          setSelected(v);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                          oos
                            ? "text-[#c4bfb9] cursor-not-allowed"
                            : isSel
                            ? "bg-[#faf7f0] text-[#1f1a16]"
                            : "text-[#3a352f] hover:bg-[#f7f5f2]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium truncate">
                          {isSel && !oos && (
                            <svg className="w-3 h-3 text-[#b8964e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className="truncate">
                            {variantLabel(v)}
                            {disc > 0 && <span className="ml-1 text-[#b8964e] font-semibold">{disc}%</span>}
                            {oos && <span className="ml-1 italic">· Sold out</span>}
                          </span>
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold shrink-0">
                          Rs. {finalOf(v.price).toLocaleString()}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {brandLabel && (
          <p className="text-[10px] sm:text-[11px] font-semibold text-[#b8964e] uppercase tracking-widest mb-1">
            {brandLabel}
          </p>
        )}

        <Link href={href || "#"}>
          <h3 className="text-xs sm:text-[13px] font-semibold text-[#1f1a16] mb-0.5 line-clamp-2 hover:text-[#b8964e] transition-colors leading-snug">
            {name}
          </h3>
        </Link>

        {impressionName && (
          <p className="text-[10px] sm:text-[11px] text-[#8a847e] mb-1 italic line-clamp-1">
            Inspired by {impressionName}
          </p>
        )}

        {seasonTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {seasonTags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f7f5f2] text-[#6b6560] border border-[#e8e4df] uppercase tracking-wide"
              >
                {SEASON_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        <div className="mb-1.5 sm:mb-2">
          <p className="text-[9px] sm:text-[10px] text-[#8a847e] mb-1">
            Admired by <span className="font-semibold text-[#6b6560]">{Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60))}%</span> globally
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-[#f0ece7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b8964e] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60))}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Price ── */}
        <div className="flex items-baseline gap-2 flex-wrap mb-2 sm:mb-3">
          {selected ? (
            <>
              <span className="text-sm sm:text-[15px] font-bold text-[#1f1a16]">
                {isRange && <span className="font-normal text-[#8a847e] text-[11px]">from </span>}
                PKR {finalOf(selected.price).toLocaleString()}
              </span>
              {disc > 0 && (
                <span className="text-[11px] text-[#a09890] line-through">
                  PKR {selected.price.toLocaleString()}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-[#a09890]">Unavailable</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg transition-colors duration-200 text-[11px] sm:text-xs font-semibold tracking-wide uppercase ${
              inStock
                ? "bg-[#1a1a2e] text-white hover:bg-[#2d2d44]"
                : "bg-[#e8e4df] text-[#a09890] cursor-not-allowed"
            }`}
          >
            {added ? "Added ✓" : !selected ? "Unavailable" : !inStock ? "Sold Out" : "Add to Cart"}
          </button>
          {onQuickView && (
            <button
              onClick={onQuickView}
              className="px-2.5 sm:px-3 py-2 border border-[#e8e4df] rounded-lg hover:border-[#1a1a2e] hover:bg-[#faf8f5] transition-all duration-200 text-[#6b6560] hover:text-[#1a1a2e]"
              aria-label="Quick view"
              title="Quick View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
