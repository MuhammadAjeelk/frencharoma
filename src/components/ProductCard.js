"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, getBestFor, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";
import EditionInfoModal from "./EditionInfoModal";
import DiscountRibbon from "./DiscountRibbon";

// Edition banner styling — Luxury = solid gold, Premium = solid silver, Classic = neutral.
const EDITION_STYLE = {
  luxury: {
    label: "Luxury Edition",
    bar: "bg-[#c9a24a]",
    text: "text-[#141414]",
  },
  premium: {
    label: "Premium Edition",
    bar: "bg-[#c3c3ca]",
    text: "text-[#2b2b2b]",
  },
  classic: {
    label: "Classic Edition",
    bar: "bg-[#d8cbb8]",
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
  isBestSeller = false,
  globalAdmirePercent = 60,
  tags = [],
  gender = "",
  scentFamily = "",
  // When a collection/edition filter is active (luxury|premium), Add to Cart
  // adds that edition directly instead of opening the "Choose Your Edition"
  // chooser.
  activeEdition = null,
  onQuickView,
  // Home "Best Sellers" style: card is just the image + pills; the details
  // (with Quick View at top) reveal as an overlay on hover.
  hoverReveal = false,
  // ── Discovery Box mode ──────────────────────────────────────────────
  // When boxMode is set, the card sells the 5ml tester: it shows boxPrice
  // (with discountPercent applied), the CTA becomes "Add to Box", and the
  // box selection state drives badges/border instead of the cart flow.
  boxMode = false,
  boxPrice = null,
  boxSelected = false,
  boxSelectionIndex = 0,
  boxSwapTarget = false,
  boxSoldOut = false,
  onAddToBox,
  // Wishlist page: the top-right heart becomes a "Delete from Wishlist"
  // control — red heart by default, red trash + label on hover.
  wishlistRemoveMode = false,
}) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem, perfumeQty } = useCart();

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
  // When a collection filter is active, the card commits to that edition only:
  // one pill, that edition's price, and Add-to-Cart adds it without a chooser.
  const activeSellable = activeEdition
    ? sellable.find((s) => s.key === activeEdition)
    : null;
  const displayEdition = activeSellable || cardEdition;
  const displaySellable = activeSellable ? [activeSellable] : sellable;
  const sizeLabel = boxMode ? "5ml" : displayEdition?.variant?.size || "50ml";
  const headlinePrice = boxMode
    ? boxPrice
    : displayEdition
    ? displayEdition.variant.price
    : null;
  const hasChoice = !boxMode && !activeSellable && sellable.length > 1;
  const inCartQty = !boxMode && perfumeId ? perfumeQty(perfumeId) : 0;

  const [hovered, setHovered] = useState(false);
  const [showBanners, setShowBanners] = useState(false);
  const [editionInfoOpen, setEditionInfoOpen] = useState(false);
  const [editionFocus, setEditionFocus] = useState(null);

  const qvRef = useRef(null);
  const cartRef = useRef(null);

  // Replay the shake animation on demand (remove class + reflow + re-add).
  const vibrate = (el) => {
    if (!el) return;
    el.classList.remove("vibrating");
    void el.offsetWidth;
    el.classList.add("vibrating");
  };

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
      originalPrice: entry.variant.price,
      discountPercent: disc,
      gender,
      impressionName,
    });
    setShowBanners(false);
  };

  const handleCta = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (boxMode) {
      if (!boxSoldOut) onAddToBox?.();
      return;
    }
    if (!cardEdition) return;
    // Collection filter active → add the filtered edition straight away.
    if (activeSellable) {
      addEdition(activeSellable);
      return;
    }
    // Two editions & no filter → let the user pick.
    if (hasChoice) {
      setShowBanners((v) => !v);
      return;
    }
    addEdition(sellable[0]);
  };

  const openEditionInfo = (key) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditionFocus(key);
    setEditionInfoOpen(true);
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
      onMouseEnter={() => {
        setHovered(true);
        vibrate(qvRef.current);
        vibrate(cartRef.current);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setShowBanners(false);
      }}
      onClick={boxMode && !boxSoldOut ? () => onAddToBox?.() : undefined}
      className={`group relative isolate rounded-xl overflow-hidden bg-white border-[2.5px] flex transition-all duration-300 ${
        hoverReveal ? "flex-row lg:flex-col" : "flex-col"
      } ${boxMode && boxSoldOut ? "opacity-60" : ""} ${
        boxMode && !boxSoldOut ? "cursor-pointer" : ""
      }`}
      style={{
        borderColor: hovered && gm ? gm.hex : "#e8e4df",
        boxShadow: hovered && !(boxMode && boxSoldOut) ? "0 10px 34px rgba(0,0,0,0.10)" : "none",
      }}
    >
      {/* Diagonal discount ribbon — top-left corner (non-box cards) */}
      {!boxMode && disc > 0 && <DiscountRibbon percent={disc} />}

      {/* Badges - top-left (box mode: selection number / sold out / discount) */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
        {boxMode && boxSelected && !boxSoldOut && (
          <span className="w-6 h-6 rounded-full bg-[#b8964e] text-white flex items-center justify-center text-[11px] font-bold shadow">
            {boxSelectionIndex + 1}
          </span>
        )}
        {boxMode && boxSoldOut ? (
          <span className="bg-gray-800/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            Sold out
          </span>
        ) : boxMode && disc > 0 ? (
          <span className="bg-[#1a1a2e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            -{disc}% OFF
          </span>
        ) : null}
      </div>

      {/* Wishlist heart - top-right */}
      {wishlistRemoveMode ? (
        <button
          onClick={handleWishlistToggle}
          aria-label="Delete from wishlist"
          className="group/wish absolute top-2 right-2 z-30 flex items-center h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 transition-colors duration-200 overflow-hidden"
        >
          <span className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            {/* Red heart (default) */}
            <svg
              className="w-[15px] h-[15px] text-[#e11d48] fill-[#e11d48] absolute transition-opacity duration-200 group-hover/wish:opacity-0"
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
            {/* Red trash (on hover) */}
            <svg
              className="w-[15px] h-[15px] text-red-600 absolute opacity-0 transition-opacity duration-200 group-hover/wish:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </span>
          <span className="max-w-0 group-hover/wish:max-w-[140px] group-hover/wish:pr-3 transition-all duration-300 ease-out whitespace-nowrap text-[10px] font-bold text-red-600">
            Delete from Wishlist
          </span>
        </button>
      ) : (
        <button
          onClick={handleWishlistToggle}
          className="group/heart absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            className={`w-[18px] h-[18px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#9a9590] group-hover/heart:text-[#e11d48]"}`}
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
      )}

      {/* Product Image */}
      <div
        className={`relative overflow-hidden bg-[#f7f5f2] ${
          hoverReveal
            ? "w-1/2 shrink-0 self-stretch aspect-auto lg:w-full lg:self-auto lg:aspect-[6.818/7.5]"
            : "w-full aspect-[6.818/7.5]"
        }`}
      >
        {boxMode ? (
          <div className="block w-full h-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <Link href={href || "#"} className="block w-full h-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>
        )}

        {/* Discovery Box: when this tester is already in the box, the Quick
            View position becomes a "Click to Remove from Discovery Box" button
            (revealed on hover), and the card is dulled (overlay below). */}
        {boxMode && boxSelected && !boxSoldOut ? (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToBox?.();
              }}
              className="flex flex-col items-center leading-tight bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[11px] font-bold text-red-600 shadow-md hover:bg-white"
            >
              <span>Click to Remove</span>
              <span>from Discovery Box</span>
            </button>
          </div>
        ) : (
          onQuickView && !hoverReveal && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                ref={qvRef}
                onMouseEnter={() => vibrate(qvRef.current)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView();
                }}
                className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[#1a1a2e] shadow-md"
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
          )
        )}

        {/* Dull overlay when this tester is already in the discovery box */}
        {boxMode && boxSelected && !boxSoldOut && (
          <div className="absolute inset-0 z-10 bg-[#f4f2ef]/55 pointer-events-none" />
        )}

        {/* Best Seller pill — bottom-left */}
        {isBestSeller && (
          <span className="absolute bottom-2 left-2 z-10 bg-[#b8964e] text-white rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-md transition-opacity duration-200 group-hover:opacity-0">
            Best Sellers
          </span>
        )}

        {/* Size pill (like the 5ml tester pill) */}
        <span className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#6b6560] shadow-sm transition-opacity duration-200 group-hover:opacity-0">
          {sizeLabel}
        </span>
      </div>

      {/* Details */}
      <div
        className={
          hoverReveal
            ? "relative flex-1 min-w-0 z-20 p-3 lg:p-4 flex flex-col bg-[#f4f2ef] lg:absolute lg:inset-x-0 lg:bottom-0 lg:rounded-t-xl lg:shadow-[0_-6px_24px_rgba(0,0,0,0.10)] lg:transition-transform lg:duration-500 lg:ease-out lg:translate-y-full lg:group-hover:translate-y-0"
            : "p-3 sm:p-4 flex flex-col flex-1 bg-[#f4f2ef]"
        }
      >
        {/* Quick View — sits on the image, just above the reveal panel */}
        {hoverReveal && onQuickView && (
          <button
            ref={qvRef}
            onMouseEnter={() => vibrate(qvRef.current)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView();
            }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 hidden lg:flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[#1a1a2e] shadow-md hover:bg-[#faf8f5] transition-all duration-200 whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </button>
        )}
        {boxMode ? (
          <h3 className="text-base font-bold text-[#1f1a16] leading-snug mb-2 line-clamp-2 text-center">
            {name}
            {gm && (
              <>
                {" – "}
                <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
              </>
            )}
          </h3>
        ) : (
          <Link href={href || "#"}>
            <h3 className="text-sm sm:text-base font-bold text-[#1f1a16] leading-snug mb-2 line-clamp-2 text-center">
              {name}
              {gm && (
                <>
                  {" – "}
                  <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
                </>
              )}
            </h3>
          </Link>
        )}

        <div className="space-y-1.5 text-[11px] sm:text-xs text-[#4a4540]">
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
          {scentFamily && (
            <p className="line-clamp-1">
              Fragrance Family:{" "}
              <span className="font-semibold text-[#1f1a16]">{scentFamily}</span>
            </p>
          )}
          {bestFor && (
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="shrink-0">Best For:</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f7f0e2] text-[#9a7b32] text-[11px] font-semibold border border-[#e8dcbf]">
                {bestFor}
              </span>
            </p>
          )}
          {/* Edition detail — pills (clickable → edition info) before admired */}
          {!boxMode && displaySellable.length > 0 && (
            <p className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 whitespace-normal sm:whitespace-nowrap">
              <span className="shrink-0">Edition:</span>
              {displaySellable.map((e) => {
                const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
                return (
                  <button
                    key={e.key}
                    onClick={openEditionInfo(e.key)}
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm transition-transform duration-200 hover:scale-105 ${st.bar} ${st.text}`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </p>
          )}
          <div>
            <span>
              Globally Admired by:{" "}
              <span className="font-bold text-[#1f1a16]">{admire}%</span>{" "}
              <span className="text-[#6b6560]">Satisfied Users</span>
            </span>
          </div>
        </div>

        {/* Gender-coloured divider */}
        <div
          className="h-[3px] rounded-full my-2.5"
          style={{ backgroundColor: gm ? gm.hex : "#d9d3cb" }}
        />

        {/* Price */}
        <div className="flex items-baseline justify-center gap-x-6 gap-y-0.5 flex-wrap mb-2.5">
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

        <div className="mt-auto relative">
          {/* Edition banners — float above the button so the card keeps its height */}
          {showBanners && hasChoice && (
            <div className="absolute bottom-full left-0 right-0 mb-2 z-30 flex flex-col gap-1.5 drop-shadow-xl animate-fadeIn">
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
                    className={`hover-vibrate w-full flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-9 gap-y-1 rounded-lg px-3 py-3 min-h-[46px] ${st.bar} ${st.text} shadow-sm hover:shadow`}
                  >
                    <span className="text-[11px] sm:text-xs font-bold leading-none">
                      {st.label}{" "}
                      <span className="font-medium opacity-80">
                        ({e.variant.size})
                      </span>
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold flex items-center gap-2 leading-none">
                      {disc > 0 && (
                        <span className="strike-diagonal opacity-70 font-medium whitespace-nowrap">
                          {formatRs(e.variant.price)}
                        </span>
                      )}
                      <span className="whitespace-nowrap">{formatRs(finalOf(e.variant.price))}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {boxMode ? (
            <button
              ref={cartRef}
              onMouseEnter={() => !boxSoldOut && vibrate(cartRef.current)}
              onClick={handleCta}
              disabled={boxSoldOut}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide uppercase transition-colors ${
                boxSoldOut
                  ? "bg-[#e8e4df] text-[#a09890] cursor-not-allowed"
                  : boxSwapTarget
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : boxSelected
                  ? "bg-[#efe9db] text-[#8a6f2e] hover:bg-[#e7dfcb]"
                  : "bg-[#1a1a2e] text-white hover:bg-[#2d2d44]"
              }`}
            >
              {boxSoldOut
                ? "Sold Out"
                : boxSwapTarget
                ? "Tap a box to place"
                : boxSelected
                ? "✓ In Box — Remove"
                : "Add to Box"}
            </button>
          ) : (
            <button
              ref={cartRef}
              onMouseEnter={() => cardEdition && vibrate(cartRef.current)}
              onClick={handleCta}
              disabled={!cardEdition}
              className={`w-full py-3 px-3 min-h-[46px] flex items-center justify-center rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide uppercase transition-colors ${
                !cardEdition
                  ? "bg-[#e8e4df] text-[#a09890] cursor-not-allowed"
                  : showBanners
                  ? "bg-[#1a1a2e] text-white hover:bg-[#2d2d44]"
                  : inCartQty > 0
                  ? "bg-[#1d3a8f] text-white hover:bg-[#16306f]"
                  : "bg-[#1a1a2e] text-white hover:bg-[#2d2d44]"
              }`}
            >
              {!cardEdition ? (
                "Unavailable"
              ) : showBanners ? (
                "Choose Your Edition"
              ) : inCartQty > 0 ? (
                <span className="inline-flex items-center justify-center gap-3">
                  Added to Cart
                  <span className="inline-flex items-center justify-center min-w-[19px] h-[19px] px-1 rounded-full bg-white/25 text-white text-[10px] font-bold leading-none">
                    {inCartQty}
                  </span>
                </span>
              ) : (
                "Add to Cart"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Edition detail popup (opened by the Edition pills) */}
      {!boxMode && (
        <EditionInfoModal
          open={editionInfoOpen}
          onClose={() => setEditionInfoOpen(false)}
          sellable={displaySellable}
          disc={disc}
          focus={editionFocus}
        />
      )}
    </div>
  );
}
