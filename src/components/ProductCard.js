"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, getBestFor, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";

// Edition banner styling — Luxury = gold, Premium = silver, Classic = neutral.
const EDITION_STYLE = {
  luxury: {
    label: "Luxury Edition",
    bar: "bg-gradient-to-r from-[#c9a24a] to-[#e6c986]",
    text: "text-[#3a2c08]",
  },
  premium: {
    label: "Premium Edition",
    bar: "bg-gradient-to-r from-[#b6b6bb] to-[#e4e4e8]",
    text: "text-[#2b2b2b]",
  },
  classic: {
    label: "Classic Edition",
    bar: "bg-gradient-to-r from-[#d8cbb8] to-[#efe7d8]",
    text: "text-[#3a352f]",
  },
};

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
  gender = "",
  onQuickView,
}) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem } = useCart();

  const brandLabel = Array.isArray(brand) ? brand.join(", ") : brand;
  const productSlug = slug || (href ? href.replace("/products/", "") : "");
  const wishlisted = isInWishlist(productSlug);
  const gm = genderMeta(gender);
  const bestFor = getBestFor(tags);
  const admire = Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60));

  const disc = Number(discountPercent) || 0;
  const finalOf = (p) => (disc > 0 ? Math.round(p * (1 - disc / 100)) : p);

  const sellable = useMemo(() => getSellableEditions(editions), [editions]);
  const cardEdition = useMemo(() => getCardEdition(editions), [editions]);
  const sizeLabel = cardEdition?.variant?.size || "50ml";
  const headlinePrice = cardEdition ? cardEdition.variant.price : null;
  const hasChoice = sellable.length > 1;

  const [hovered, setHovered] = useState(false);
  const [showBanners, setShowBanners] = useState(false);
  const [added, setAdded] = useState(false);

  const addEdition = (entry) => {
    if (!entry) return;
    addItem({
      perfumeId,
      slug: productSlug,
      name,
      image: image || "",
      edition: entry.key,
      size: entry.variant.size,
      price: finalOf(entry.variant.price),
    });
    setShowBanners(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleCta = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cardEdition) return;
    if (hasChoice) {
      setShowBanners((v) => !v);
      return;
    }
    addEdition(sellable[0]);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      slug: productSlug,
      name,
      brand: brandLabel,
      image,
      price: headlinePrice != null ? finalOf(headlinePrice) : 0,
    });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowBanners(false);
      }}
      className="group relative rounded-xl overflow-hidden bg-white border-[2.5px] flex flex-col transition-all duration-300"
      style={{
        borderColor: hovered && gm ? gm.hex : "#e8e4df",
        boxShadow: hovered ? "0 10px 34px rgba(0,0,0,0.10)" : "none",
      }}
    >
      {/* Badges - top-left */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
        {disc > 0 && (
          <span className="bg-[#1a1a2e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            -{disc}% OFF
          </span>
        )}
        {isSpecialOffer && (
          <span className="bg-[#c2185b] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            Special Offer
          </span>
        )}
      </div>

      {/* Wishlist heart - top-right */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className={`w-[15px] h-[15px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#9a9590]"}`}
          fill={wishlisted ? "currentColor" : "none"}
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

      {/* Product Image */}
      <div className="relative w-full aspect-[6.818/7.5] overflow-hidden bg-[#f7f5f2]">
        <Link href={href || "#"} className="block w-full h-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Quick View — appears on hover (wrapper centers, button vibrates) */}
        {onQuickView && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              className="qv-vibrate flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[#1a1a2e] shadow-md"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Quick View
            </button>
          </div>
        )}

        {/* Size pill (like the 5ml tester pill) */}
        <span className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#6b6560] shadow-sm">
          {sizeLabel}
        </span>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-[#f4f2ef]">
        <Link href={href || "#"}>
          <h3 className="text-sm font-bold text-[#1f1a16] leading-snug mb-2 line-clamp-2 text-center">
            {name}
            {gm && (
              <>
                {" – "}
                <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
              </>
            )}
          </h3>
        </Link>

        <div className="space-y-1 text-[11px] sm:text-xs text-[#4a4540]">
          {impressionName && (
            <p className="line-clamp-1">
              Inspired by:{" "}
              <span className="font-semibold text-[#1f1a16]">
                {impressionName}
              </span>
            </p>
          )}
          {brandLabel && (
            <p className="line-clamp-1">
              Brand:{" "}
              <span className="font-semibold text-[#1f1a16]">{brandLabel}</span>
            </p>
          )}
          {bestFor && (
            <p className="flex items-center gap-1.5">
              Best For:
              <span className="inline-block px-2 py-0.5 rounded-full bg-white text-[#3a352f] text-[10px] font-semibold border border-[#e8e4df]">
                {bestFor}
              </span>
            </p>
          )}
          <div className="pt-0.5">
            <span>
              Globally Admired by:{" "}
              <span className="font-bold text-[#1f1a16]">{admire}%</span>
            </span>
          </div>
        </div>

        {/* Gender-coloured divider */}
        <div
          className="h-[3px] rounded-full my-2.5"
          style={{ backgroundColor: gm ? gm.hex : "#d9d3cb" }}
        />

        {/* Price */}
        <div className="flex items-baseline justify-center gap-8 flex-wrap mb-2.5">
          {headlinePrice != null ? (
            <>
              {disc > 0 && (
                <span className="text-[15px] font-normal text-[#a09890] strike-diagonal">
                  {formatRs(headlinePrice)}
                </span>
              )}
              <span className="text-[15px] font-semibold text-[#1f1a16]">
                {formatRs(finalOf(headlinePrice))}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#a09890]">Unavailable</span>
          )}
        </div>

        <div className="mt-auto">
          {/* Inline edition banners */}
          {showBanners && hasChoice && (
            <div className="flex flex-col gap-1.5 mb-2">
              {sellable.map((e) => {
                const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
                return (
                  <button
                    key={e.key}
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      addEdition(e);
                    }}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${st.bar} ${st.text} shadow-sm hover:brightness-[1.04] hover:shadow transition`}
                  >
                    <span className="text-[11px] font-bold">
                      {st.label}{" "}
                      <span className="font-medium opacity-80">
                        ({e.variant.size})
                      </span>
                    </span>
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      {disc > 0 && (
                        <span className="line-through opacity-60 font-medium">
                          {formatRs(e.variant.price)}
                        </span>
                      )}
                      {formatRs(finalOf(e.variant.price))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleCta}
            disabled={!cardEdition}
            className={`w-full py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide uppercase transition-colors ${
              cardEdition
                ? "bg-[#1a1a2e] text-white hover:bg-[#2d2d44] hover-vibrate"
                : "bg-[#e8e4df] text-[#a09890] cursor-not-allowed"
            }`}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
