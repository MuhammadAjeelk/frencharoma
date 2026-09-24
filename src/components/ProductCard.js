"use client";

import { useState, useMemo, useRef } from "react";
import RetryImage from "./ui/RetryImage";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, getBestFor, isSignatureScent, formatRs } from "@/lib/pricing";
import { genderMeta, genderTextClass } from "@/lib/gender";
import EditionInfoModal from "./EditionInfoModal";
import DiscountRibbon from "./DiscountRibbon";
import FitText from "./ui/FitText";
import { COLORS } from "@/lib/design";

// Edition banner styling — Luxury = solid gold, Premium = solid silver, Classic = neutral.
const EDITION_STYLE = {
  luxury: {
    label: "Luxury Edition",
    short: "Luxury",
    bar: "bg-[var(--fa-gold)]",
    text: "text-[var(--fa-ink)]",
  },
  premium: {
    label: "Premium Edition",
    short: "Premium",
    bar: "bg-[var(--fa-premium)]",
    text: "text-[var(--fa-ink)]",
  },
  classic: {
    label: "Classic Edition",
    short: "Classic",
    bar: "bg-[var(--fa-beige)]",
    text: "text-[var(--fa-secondary)]",
  },
};

export default function ProductCard({
  // Phone grids render this at ~173px, where the desktop type and controls
  // overflow. `compact` scales them, matching BestSellerCard.
  compact = false,
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

  // A perfume with no image still has to fill its frame - next/image throws on
  // an empty src, so the placeholder stands in for it. A load that fails is
  // retried a few times before it falls back to the same placeholder.
  const [imageDead, setImageDead] = useState(false);
  const artwork = image && !imageDead ? (
    <RetryImage
      src={image}
      alt={name}
      fill
      className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      onExhausted={() => setImageDead(true)}
    />
  ) : (
    <span
      className="absolute inset-0 flex items-center justify-center bg-[var(--fa-beige)]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-10 h-10 text-[var(--fa-secondary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 2.75h4v2.5h-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.2 5.25h5.6l1.7 2.4v13.1a.5.5 0 01-.5.5H8a.5.5 0 01-.5-.5V7.65z" />
        <path strokeLinecap="round" d="M8.2 12.4h7.6" />
      </svg>
    </span>
  );

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
      className={`group relative isolate h-full overflow-hidden bg-[var(--fa-beige)] border-2 transition-[box-shadow,border-color] duration-300 ${
        hoverReveal
          ? "flex flex-row lg:flex-col"
          : // Below sm the details outgrew the artwork — at a 135px card the
            // image was only 35% of the height. Two equal rows hold it at half,
            // with min-content on the second row so the copy can never be
            // squeezed. sm and up keeps the flex column, where the image is
            // already the larger share.
            "grid grid-rows-[minmax(0,1fr)_minmax(min-content,1fr)] sm:flex sm:flex-col"
      } ${boxMode && boxSoldOut ? "opacity-60" : ""} ${
        boxMode && !boxSoldOut ? "cursor-pointer" : ""
      }`}
      style={{
        borderColor: hovered && gm ? gm.hex : COLORS.goldBright,
        boxShadow:
          hovered && !(boxMode && boxSoldOut)
            ? "0 0 0 1px rgba(209,174,109,0.45), 0 14px 38px rgba(209,174,109,0.22)"
            : "none",
      }}
    >
      {/* Diagonal discount ribbon — top-left corner (non-box cards) */}
      {!boxMode && disc > 0 && <DiscountRibbon percent={disc} compact={compact} />}

      {/* Badges - top-left (box mode: selection number / sold out / discount) */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
        {boxMode && boxSelected && !boxSoldOut && (
          <span className="w-6 h-6 rounded-full bg-[var(--fa-gold)] text-[var(--fa-ink)] flex items-center justify-center text-[11px] font-bold shadow">
            {boxSelectionIndex + 1}
          </span>
        )}
        {boxMode && boxSoldOut ? (
          <span className="rounded-full border border-[var(--fa-gold)]/60 bg-[var(--fa-ink)]/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--fa-gold-hover)]">
            Sold out
          </span>
        ) : boxMode && disc > 0 ? (
          <span className="rounded-full bg-[var(--fa-ink)] px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide text-[var(--fa-gold-hover)]">
            -{disc}% OFF
          </span>
        ) : null}
      </div>

      {/* Wishlist heart - top-right */}
      {wishlistRemoveMode ? (
        <button
          onClick={handleWishlistToggle}
          aria-label="Delete from wishlist"
          className="group/wish absolute top-2 right-2 z-30 flex items-center h-8 rounded-full bg-[var(--fa-beige)] shadow-sm hover:bg-[var(--fa-peach)] transition-colors duration-200 overflow-hidden"
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
          className="group/heart absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--fa-beige)] hover:bg-[var(--fa-hover)] hover:scale-110 transition-all duration-200 shadow-sm"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            className={`w-[18px] h-[18px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#7d7161] group-hover/heart:text-[#e11d48]"}`}
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
        className={`relative overflow-hidden bg-[var(--fa-beige)] ${
          hoverReveal
            ? "w-1/2 shrink-0 self-stretch aspect-auto lg:w-full lg:self-auto lg:aspect-[6.818/7.5]"
            : "w-full min-w-0"
        }`}
      >
        {/* The ratio lives on a spacer rather than on this box. Below sm the
            box has to stretch to fill its grid row, and Chrome honours a
            box's own aspect-ratio over stretch alignment — so the ratio here
            would pin the artwork at 45% of the card instead of half. As a
            spacer it still sets the row's floor: the image is never shorter
            than the artwork's natural ratio, only taller. */}
        {!hoverReveal && (
          <div className="w-full aspect-[6.818/7.5]" aria-hidden="true" />
        )}

        {boxMode ? (
          <div className="absolute inset-0">{artwork}</div>
        ) : (
          <Link href={href || "#"} className="absolute inset-0">
            {artwork}
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
              className="flex flex-col items-center leading-tight rounded-md bg-[var(--fa-beige)]/95 backdrop-blur-sm px-4 py-1.5 text-[11px] font-bold text-[#b3261e] shadow-md hover:bg-[var(--fa-cream)]"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fa-gold)]/70 bg-[var(--fa-ink)]/90 backdrop-blur-[2px] px-3.5 py-1.5 text-[11px] font-semibold text-[var(--fa-gold)] shadow-md whitespace-nowrap"
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
          <div className="absolute inset-0 z-10 bg-[#d5c7b4]/60 pointer-events-none" />
        )}

        {/* Best Seller pill — bottom-left (hidden on mobile to avoid overlap) */}
        {isBestSeller && (
          <span className="hidden lg:block absolute bottom-2 left-2 z-10 rounded-full bg-[var(--fa-border)] px-3 py-1 text-[11px] font-semibold tracking-wide text-[var(--fa-ink)] shadow-md transition-opacity duration-200 group-hover:opacity-0">
            Best Sellers
          </span>
        )}

        {/* Size pill (like the 5ml tester pill) */}
        <span className="absolute bottom-2 right-2 z-10 rounded-full bg-[var(--fa-beige)] px-2 py-0.5 text-[10px] font-semibold text-[var(--fa-secondary)] shadow-sm transition-opacity duration-200 group-hover:opacity-0">
          {sizeLabel}
        </span>
      </div>

      {/* Details */}
      <div
        className={
          hoverReveal
            ? "relative flex-1 min-w-0 z-20 p-3 lg:p-4 flex flex-col bg-[var(--fa-beige)] lg:absolute lg:inset-x-0 lg:bottom-0 lg:border-t lg:border-[var(--fa-gold)] lg:shadow-[0_-6px_24px_rgba(0,0,0,0.28)] lg:transition-transform lg:duration-500 lg:ease-out lg:translate-y-full lg:group-hover:translate-y-0"
            : // min-w-0 matters: as a grid item this box defaults to a
              // min-content floor, and the nowrap title would push that past
              // the card's own width.
              "p-2.5 sm:p-4 flex flex-col flex-1 min-h-0 min-w-0 bg-[var(--fa-beige)]"
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 hidden lg:flex items-center gap-1.5 rounded-full border border-[var(--fa-gold)]/70 bg-[var(--fa-ink)]/90 backdrop-blur-[2px] px-3.5 py-1.5 text-[11px] font-semibold text-[var(--fa-gold)] shadow-md hover:bg-[var(--fa-ink)] transition-all duration-200 whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </button>
        )}
        {(() => {
          const title = (
            <FitText
              as="h3"
              fit={`${name}|${gm?.label || ""}|${compact}`}
              floor={compact ? 9 : 12}
              className={`font-bold text-[var(--fa-ink)] leading-snug mb-2 text-center ${compact ? "text-[12px]" : "text-sm sm:text-base"}`}
            >
              {name}
              {gm && (
                <>
                  {" – "}
                  <span className={`font-semibold ${genderTextClass(gender, "light")}`}>{gm.label}</span>
                </>
              )}
            </FitText>
          );
          return boxMode ? title : <Link href={href || "#"}>{title}</Link>;
        })()}

        <div className={`text-[var(--fa-secondary)] ${compact ? "space-y-0.5 text-[10px]" : "space-y-1.5 text-[11px] sm:text-xs"}`}>
          {impressionName && (
            <FitText fit={impressionName} floor={compact ? 8 : 10}>
              {!isSignatureScent(impressionName) && "Inspired by: "}
              <span className="font-semibold text-[var(--fa-ink)]">
                {impressionName}
              </span>
            </FitText>
          )}
          {brandLabel && (
            <FitText fit={brandLabel} floor={compact ? 8 : 10}>
              Brand:{" "}
              <span className="font-semibold text-[var(--fa-ink)]">{brandLabel}</span>
            </FitText>
          )}
          {scentFamily && (
            <FitText fit={scentFamily} floor={compact ? 8 : 10}>
              Fragrance Family:{" "}
              <span className="font-semibold text-[var(--fa-ink)]">{scentFamily}</span>
            </FitText>
          )}
          {bestFor && (
            <p className="flex flex-wrap items-center gap-1.5">
              {!compact && <span className="shrink-0">Best For:</span>}
              <span className={`inline-block rounded-full border border-[var(--fa-gold)]/60 bg-[var(--fa-selected)] font-semibold text-[var(--fa-gold-ink)] ${compact ? "px-1.5 py-0 text-[9px]" : "px-2.5 py-0.5 text-[11px]"}`}>
                {bestFor}
              </span>
            </p>
          )}
          {/* Edition detail — pills (clickable → edition info) before admired */}
          {!boxMode && displaySellable.length > 0 && (
            <p className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
              {!compact && <span className="shrink-0">Edition:</span>}
              {displaySellable.map((e) => {
                const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
                return (
                  <button
                    key={e.key}
                    onClick={openEditionInfo(e.key)}
                    className={`shrink-0 rounded-full font-bold tracking-wide shadow-sm transition-[filter] duration-200 hover:brightness-110 ${st.bar} ${st.text} ${compact ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
                  >
                    {compact ? st.short : st.label}
                  </button>
                );
              })}
            </p>
          )}
          <div>
            {compact ? (
              <span>
                <span className="font-bold text-[var(--fa-ink)]">{admire}%</span>{" "}
                <span className="text-[var(--fa-secondary)]">Admired</span>
              </span>
            ) : (
              <span>
                Globally Admired by:{" "}
                <span className="font-bold text-[var(--fa-ink)]">{admire}%</span>{" "}
                <span className="text-[var(--fa-secondary)]">Satisfied Users</span>
              </span>
            )}
          </div>
        </div>

        {/* Footer group — pinned to the bottom so the divider, price and CTA
            line up across a row even when one card's meta runs a line longer
            (the "Four Seasons (Versatile)" pill wraps, "Winter & Autumn" does
            not). Without this the whole card grew by that one line. */}
        <div className={`mt-auto ${compact ? "pt-1.5" : "pt-2.5"}`}>
          {/* Gender-coloured divider */}
          <div
            className={`h-[3px] ${compact ? "mb-1.5" : "mb-2.5"}`}
            style={{ backgroundColor: gm ? gm.hex : "var(--fa-border)" }}
          />

          {/* Price */}
          <div className={`flex items-baseline justify-center gap-y-0.5 flex-wrap ${compact ? "gap-x-2 mb-1.5" : "gap-x-6 mb-2.5"}`}>
            {headlinePrice != null ? (
              <>
                {disc > 0 && (
                  <span className={`font-normal text-[var(--fa-secondary)] strike-diagonal ${compact ? "text-[11px]" : "text-[15px]"}`}>
                    {formatRs(headlinePrice)}
                  </span>
                )}
                <span className={`font-bold text-[var(--fa-gold-ink)] ${compact ? "text-[12px]" : "text-[15px]"}`}>
                  {formatRs(finalOf(headlinePrice))}
                </span>
              </>
            ) : (
              <span className="text-sm text-[var(--fa-secondary)]">Unavailable</span>
            )}
          </div>

          <div className="relative">
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
                      className={`hover-vibrate w-full flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-9 gap-y-1 rounded-md px-3 py-3 min-h-[46px] ${st.bar} ${st.text} shadow-sm hover:shadow`}
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
                className={`w-full rounded-md font-semibold tracking-wide uppercase transition-colors ${compact ? "py-1.5 px-2 text-[9px]" : "py-2.5 px-3 text-[11px] sm:text-xs"} ${
                  boxSoldOut
                    ? "bg-[var(--fa-disabled)] text-[var(--fa-secondary)] cursor-not-allowed"
                    : boxSwapTarget
                    ? "bg-[var(--fa-gold)] text-[var(--fa-ink)] hover:bg-[var(--fa-gold-hover)]"
                    : boxSelected
                    ? "border border-[var(--fa-gold)] bg-[var(--fa-selected)] text-[var(--fa-gold-ink)] hover:bg-[var(--fa-hover)]"
                    : "bg-[var(--fa-ink)] text-[var(--fa-gold-hover)] hover:bg-[var(--fa-hover-dark)]"
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
                className={`w-full flex items-center justify-center rounded-md font-semibold tracking-wide uppercase transition-colors ${compact ? "py-2 px-2 min-h-[34px] text-[9px]" : "py-3 px-3 min-h-[46px] text-[11px] sm:text-xs"} ${
                  !cardEdition
                    ? "bg-[var(--fa-disabled)] text-[var(--fa-secondary)] cursor-not-allowed"
                    : showBanners
                    ? "bg-[var(--fa-hover-dark)] text-[var(--fa-gold-hover)] hover:bg-[var(--fa-hover-dark)]"
                    : inCartQty > 0
                    ? "bg-[var(--fa-hover-dark)] text-[var(--fa-cream)] hover:bg-[var(--fa-dark)]"
                    : "bg-[var(--fa-ink)] text-[var(--fa-gold-hover)] hover:bg-[var(--fa-hover-dark)]"
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
