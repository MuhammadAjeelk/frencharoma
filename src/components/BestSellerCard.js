"use client";

import { useState, useMemo, useRef } from "react";
import RetryImage from "./ui/RetryImage";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, isSignatureScent, formatRs } from "@/lib/pricing";
import { genderMeta, genderTextClass } from "@/lib/gender";
import DiscountRibbon from "./DiscountRibbon";
import EditionChoiceModal from "./EditionChoiceModal";

const EDITION_STYLE = {
  luxury: { label: "Luxury Edition", bar: "bg-[var(--fa-gold)]", text: "text-[var(--fa-ink)]" },
  premium: { label: "Premium Edition", bar: "bg-[var(--fa-premium)]", text: "text-[var(--fa-ink)]" },
  classic: { label: "Classic Edition", bar: "bg-[var(--fa-beige)]", text: "text-[var(--fa-secondary)]" },
};

function Stars({ rating, compact = false, home = false }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (cls) => (
    <span className={`flex ${home ? "gap-[1.03cqw]" : "gap-0.5"} ${cls}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${home ? "w-[6.55cqw] h-[6.55cqw]" : compact ? "w-[11px] h-[11px]" : "w-[14px] h-[14px]"} shrink-0`} fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="relative inline-flex" aria-label={`${rating} out of 5`}>
      {row(home ? "text-[#c9c3ba]" : "text-[#a89b86]")}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(home ? "text-[#231a14]" : "text-[var(--fa-ink)]")}
      </span>
    </span>
  );
}

export default function BestSellerCard({
  name,
  brand,
  image,
  impressionName,
  href,
  slug,
  perfumeId,
  editions = [],
  discountPercent = 0,
  gender = "",
  scentFamily = "",
  avgRating = 0,
  globalAdmirePercent = 60,
  onQuickView,
  // The corner pill. Defaults to "Best Sellers" for the homepage carousel;
  // shop-all passes null for anything that is not actually a best seller.
  badge = "Best Sellers",
  // The homepage shows this card one-up on a phone (~350px). A 2-up grid gives
  // it ~180px, where the desktop type and the 44px cart button collide with the
  // price. `compact` scales the internals for that width.
  compact = false,
  // "home" is the 2026-10 homepage mockup's card, 1200 × 1850 as a whole (the
  // photo takes what the fixed details block leaves): thin dark
  // rim, Arial name, Calibri details, black stars, magenta price and a red
  // cart button, with every line on a fixed rhythm so cards in a row align
  // even when a field is missing.
  look = "default",
}) {
  const home = look === "home";
  const { addItem, perfumeQty } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const [choiceOpen, setChoiceOpen] = useState(false);
  const cartRef = useRef(null);
  const qvRef = useRef(null);

  const sellable = useMemo(() => getSellableEditions(editions), [editions]);
  const cardEdition = useMemo(() => getCardEdition(editions), [editions]);
  const hasChoice = sellable.length > 1;

  const disc = discountPercent || 0;
  const finalOf = (p) => (disc > 0 ? Math.round(p * (1 - disc / 100)) : p);
  const headlinePrice = cardEdition?.variant?.price ?? null;

  const gm = gender ? genderMeta(gender) : null;
  const inCartQty = perfumeId ? perfumeQty(perfumeId) : 0;
  const wished = slug ? isInWishlist(slug) : false;

  // Spec #2/#3 — the button pulses when the card is hovered, and shakes when
  // the pointer lands on the button itself. Both replay on demand.
  const replay = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  const addEdition = (entry) => {
    if (!entry) return;
    addItem({
      perfumeId,
      slug,
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
  };

  // Spec #5 — two editions open the chooser, one edition adds straight away.
  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardEdition) return;
    if (hasChoice) {
      setChoiceOpen(true);
      return;
    }
    addEdition(sellable[0]);
  };

  return (
    <div
      onMouseEnter={() => {
        replay(cartRef.current, "heartbeat");
        replay(qvRef.current, "vibrating");
      }}
      className={`group relative flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)] ${
        home
          ? "@container rounded-[4.14cqw] border border-[#3c3c3c] bg-[#f4ede4] aspect-[1200/1850]"
          : "rounded-2xl bg-[var(--fa-beige)] shadow-[0_10px_28px_rgba(0,0,0,0.30)]"
      }`}
    >
      {/* Image */}
      <div className={`relative w-full overflow-hidden ${home ? "flex-1 min-h-0" : "aspect-square"}`}>
        <Link href={href || "#"} className="absolute inset-0 z-0">
          {image ? (
            <RetryImage
              src={image}
              alt={name}
              fill
              className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
              sizes={home ? "(max-width:767px) 72vw, 22vw" : "(max-width:640px) 90vw, 25vw"}
            />
          ) : null}
        </Link>

        {disc > 0 && <DiscountRibbon percent={disc} compact={compact} color={home ? "#f5b62b" : undefined} scale={home ? 0.74 : undefined} unit={home ? "0.3448cqw" : undefined} />}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem({
              slug,
              name,
              brand,
              image,
              price: headlinePrice != null ? finalOf(headlinePrice) : 0,
            });
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute z-20 flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform duration-200 ${
            home ? "top-[3.45cqw] right-[3.45cqw] w-[9.31cqw] h-[9.31cqw] bg-white" : compact ? "top-2 right-2 w-7 h-7 bg-[var(--fa-beige)]" : "top-3 right-3 w-9 h-9 bg-[var(--fa-beige)]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`${home ? "w-[6.21cqw] h-[6.21cqw]" : compact ? "w-4 h-4" : "w-5 h-5"} ${wished ? "fill-[#e0342c] text-[#e0342c]" : "fill-none text-[#e07a72]"}`}
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.3 6.3a4.5 4.5 0 000 6.4L12 20.4l7.7-7.7a4.5 4.5 0 00-6.4-6.4L12 7.6l-1.3-1.3a4.5 4.5 0 00-6.4 0z" />
          </svg>
        </button>

        {/* Spec #1 — Quick View appears on hover */}
        {onQuickView && (
          <button
            ref={qvRef}
            type="button"
            onMouseEnter={() => replay(qvRef.current, "vibrating")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView();
            }}
            className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 rounded-full border border-[var(--fa-gold)]/70 bg-[var(--fa-ink)]/90 backdrop-blur-[2px] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fa-gold)] shadow-md whitespace-nowrap opacity-0 translate-y-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
            Quick View
          </button>
        )}

        {badge && (
          <span className={`absolute z-10 rounded-full transition-opacity duration-200 group-hover:opacity-0 ${
            home
              ? "bottom-[2.07cqw] left-[2.41cqw] px-[3.1cqw] h-[6.21cqw] leading-[6.21cqw] text-[4.66cqw] font-[family-name:var(--font-carlito)] bg-[#cfae6e] text-[#2b2016]"
              : `bg-[var(--fa-border)] font-medium text-[var(--fa-ink)] shadow-sm ${compact ? "bottom-2 left-2 px-2 py-0 text-[9px]" : "bottom-3 left-3 px-2.5 py-0.5 text-[11px]"}`
          }`}>
            {badge}
          </span>
        )}
        {cardEdition?.variant?.size && (
          <span className={`absolute z-10 rounded-full transition-opacity duration-200 group-hover:opacity-0 ${
            home
              ? "bottom-[2.07cqw] right-[2.41cqw] px-[2.07cqw] h-[6.21cqw] leading-[6.21cqw] text-[4.66cqw] font-[family-name:var(--font-carlito)] bg-white text-[#222]"
              : `bg-[var(--fa-beige)] font-medium text-[var(--fa-secondary)] shadow-sm ${compact ? "bottom-2 right-2 px-1.5 py-0 text-[9px]" : "bottom-3 right-3 px-2 py-0.5 text-[11px]"}`
          }`}>
            {cardEdition.variant.size}
          </span>
        )}
      </div>

      {/* Details */}
      <div
        className={`relative flex flex-col ${
          home ? "shrink-0 h-[53.79cqw] px-[5.17cqw] pt-[1.67cqw] pb-[3.45cqw]" : compact ? "gap-1 px-2.5 pt-2 pb-3" : "gap-1.5 px-4 pt-3 pb-4"
        }`}
      >
        {home ? (
          // Fixed rhythm from the mockups, in cqw of the card's width so it
          // scales as one piece: matched to the 537-unit phone spec card (name,
          // three detail lines 43 units apart, stars, price) and the 290px
          // desktop one, 156px of details there.
          <>
            <Link href={href || "#"} className="text-center">
              <h3 className="font-[Arial,Helvetica,sans-serif] font-bold text-[6.21cqw] leading-[7.59cqw] text-[#333] whitespace-nowrap overflow-hidden text-ellipsis">
                {name}
                {gm && <span className={`font-normal text-[5.34cqw] ${genderTextClass(gender, "light")}`}>{` - ${gm.label.replace(/^For\s+/i, "")}`}</span>}
              </h3>
            </Link>

            <div className="mt-[0.64cqw] font-[family-name:var(--font-carlito)] text-[5.34cqw] leading-[8.09cqw] text-[#373435]">
              <p className="truncate">
                {impressionName ? (isSignatureScent(impressionName) ? impressionName : `Inspired by: ${impressionName}`) : "\u00a0"}
              </p>
              <p className="truncate">{brand ? `Brand: ${brand}` : "\u00a0"}</p>
              <p className="truncate">{scentFamily ? `Fragrance: ${scentFamily}` : "\u00a0"}</p>
            </div>

            <div className="mt-[1.12cqw] h-[6.55cqw] flex items-center gap-[5.52cqw] pr-[15.86cqw] font-[family-name:var(--font-carlito)] text-[5.34cqw] leading-none text-[#373435] whitespace-nowrap">
              <Stars rating={avgRating} home />
              <span>
                {avgRating.toFixed(1)}/5&nbsp;&nbsp;({globalAdmirePercent}%)
              </span>
            </div>

            <div className="mt-[2.17cqw] h-[6.21cqw] flex items-baseline gap-[5.52cqw] pr-[15.86cqw] font-[Arial,Helvetica,sans-serif] text-[5.34cqw] leading-[6.21cqw] whitespace-nowrap">
              {headlinePrice != null ? (
                <>
                  {disc > 0 && (
                    <span className="strike-diagonal strike-diagonal-bold text-[#555]">{formatRs(headlinePrice)}</span>
                  )}
                  <span className="font-bold text-[#a8329e]">{formatRs(finalOf(headlinePrice))}</span>
                </>
              ) : (
                <span className="text-[#555]">Unavailable</span>
              )}
            </div>
          </>
        ) : (
          <>
          <Link href={href || "#"} className="text-center">
            <h3 className={`font-bold leading-tight text-[var(--fa-ink)] ${compact ? "text-[12px] line-clamp-2" : "text-[15px] whitespace-nowrap overflow-hidden text-ellipsis"}`}>
              {name}
              {gm && <span className={`font-semibold ${genderTextClass(gender, "light")}`}>{` - ${gm.label}`}</span>}
            </h3>
          </Link>

          <div className={`space-y-0.5 text-[var(--fa-secondary)] ${compact ? "text-[10px]" : "text-[12px]"}`}>
            {impressionName && (
              <p className="line-clamp-1">
                {isSignatureScent(impressionName) ? impressionName : `Inspired by: ${impressionName}`}
              </p>
            )}
            {brand && <p className="line-clamp-1">Brand: {brand}</p>}
            {scentFamily && <p className="line-clamp-1">Fragrance: {scentFamily}</p>}
          </div>

          <div className={`flex items-center ${compact ? "gap-1 pr-9" : "gap-2 pr-14"}`}>
            <Stars rating={avgRating} compact={compact} />
            <span className={`text-[var(--fa-ink)] ${compact ? "text-[10px]" : "text-[12px]"}`}>{avgRating.toFixed(1)}/5</span>
            {!compact && <span className="text-[12px] text-[var(--fa-secondary)]">({globalAdmirePercent}%)</span>}
          </div>

          <div className={`flex items-baseline ${compact ? "flex-wrap gap-x-1.5 gap-y-0 pr-9" : "gap-2.5 pr-14"}`}>
            {headlinePrice != null ? (
              <>
                {disc > 0 && (
                  <span className={`strike-diagonal text-[var(--fa-secondary)] ${compact ? "text-[10px]" : "text-[13px]"}`}>{formatRs(headlinePrice)}</span>
                )}
                <span className={`font-bold text-[var(--fa-gold-ink)] ${compact ? "text-[12px]" : "text-[15px]"}`}>{formatRs(finalOf(headlinePrice))}</span>
              </>
            ) : (
              <span className="text-[12px] text-[var(--fa-secondary)]">Unavailable</span>
            )}
          </div>
          </>
        )}

        {/* Spec #3/#4 — icon only at rest, label slides out on hover */}
        <button
          ref={cartRef}
          type="button"
          onMouseEnter={() => cardEdition && replay(cartRef.current, "vibrating")}
          onClick={handleCart}
          disabled={!cardEdition}
          aria-label={inCartQty > 0 ? "Added to cart" : "Add to cart"}
          className={`group/cart absolute z-20 inline-flex flex-row-reverse items-center justify-center rounded-full px-0 gap-0 hover:px-3.5 hover:gap-1.5 ${
            home ? "bottom-[3.45cqw] right-[3.45cqw] h-[13.45cqw] min-w-[13.45cqw]" : compact ? "bottom-2.5 right-2 h-9 min-w-[36px]" : "bottom-4 right-3 h-11 min-w-[44px]"
          } shadow-[0_5px_14px_rgba(0,0,0,0.26)] transition-all duration-200 ${
            !cardEdition
              ? "bg-[var(--fa-disabled)] cursor-not-allowed"
              : inCartQty > 0
              ? home ? "bg-[#b82a2a]" : "bg-[var(--fa-hover-dark)]"
              : home ? "bg-[#ee3b3b]" : "bg-[var(--fa-dark)]"
          } text-white`}
        >
          {home ? (
            // The mockup's outline trolley, about 60% of the button.
            <svg viewBox="0 0 24 24" className="w-[8.3cqw] h-[8.3cqw] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 4.5h2.6l2.4 10.3a1.4 1.4 0 001.4 1.1h8.4a1.4 1.4 0 001.4-1.1l1.5-6.6H6.2M9.6 9.6l.6 3.2M13.2 9.6v3.2M16.8 9.6l-.6 3.2" />
              <circle cx="9.6" cy="19.3" r="1.4" />
              <circle cx="16.4" cy="19.3" r="1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className={`${compact ? "w-4 h-4" : "w-5 h-5"} shrink-0`} fill="currentColor" aria-hidden="true">
              <path d="M7 4h-3a1 1 0 100 2h2.2l2.3 9.2A2 2 0 0010.4 17h7.2a2 2 0 001.9-1.4l2-6.6H8.2l-.5-2A1 1 0 007 4zm3.5 15a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2zm7 0a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z" />
            </svg>
          )}
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.06em] opacity-0 transition-all duration-200 group-hover/cart:max-w-[110px] group-hover/cart:opacity-100">
            {inCartQty > 0 ? "Added to Cart" : "Add to Cart"}
          </span>
          {inCartQty > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/25 text-[10px] font-bold leading-none">
              {inCartQty}
            </span>
          )}
        </button>
      </div>

      <EditionChoiceModal
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        onChoose={(entry) => {
          setChoiceOpen(false);
          addEdition(entry);
        }}
        name={name}
        image={image}
        editions={sellable}
        editionStyle={EDITION_STYLE}
        formatRs={formatRs}
        finalOf={finalOf}
        discountPercent={disc}
      />
    </div>
  );
}
