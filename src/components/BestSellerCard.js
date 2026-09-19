"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";
import DiscountRibbon from "./DiscountRibbon";
import EditionChoiceModal from "./EditionChoiceModal";

const EDITION_STYLE = {
  luxury: { label: "Luxury Edition", bar: "bg-[#c9a24a]", text: "text-[#141414]" },
  premium: { label: "Premium Edition", bar: "bg-[#c3c3ca]", text: "text-[#2b2b2b]" },
  classic: { label: "Classic Edition", bar: "bg-[#d8cbb8]", text: "text-[#3a352f]" },
};

function Stars({ rating }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (cls) => (
    <span className={`flex gap-0.5 ${cls}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-[14px] h-[14px] shrink-0" fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="relative inline-flex" aria-label={`${rating} out of 5`}>
      {row("text-[#a89b86]")}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("text-[#1f1a16]")}
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
}) {
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
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#d5c7b4] shadow-[0_10px_28px_rgba(0,0,0,0.30)] transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Link href={href || "#"} className="absolute inset-0 z-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:640px) 90vw, 25vw"
            />
          ) : null}
        </Link>

        {disc > 0 && <DiscountRibbon percent={disc} />}

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
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-[#e3d5c0] shadow-sm hover:scale-110 transition-transform duration-200"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-5 h-5 ${wished ? "fill-[#e0342c] text-[#e0342c]" : "fill-none text-[#e07a72]"}`}
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
            className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-[12px] font-semibold text-[#1a1a2e] shadow-lg whitespace-nowrap opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
            Quick View
          </button>
        )}

        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-[#cbb99a] px-2.5 py-0.5 text-[11px] font-medium text-[#2b2620] shadow-sm transition-opacity duration-200 group-hover:opacity-0">
          Best Sellers
        </span>
        {cardEdition?.variant?.size && (
          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-[#efe9df] px-2 py-0.5 text-[11px] font-medium text-[#3a352f] shadow-sm transition-opacity duration-200 group-hover:opacity-0">
            {cardEdition.variant.size}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="relative flex flex-col gap-1.5 px-4 pt-3 pb-4">
        <Link href={href || "#"} className="text-center">
          <h3 className="text-[15px] font-bold leading-tight text-[#1f1a16] whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
            {gm && <span className="font-semibold text-[#2f7fd4]">{` - ${gm.label}`}</span>}
          </h3>
        </Link>

        <div className="space-y-0.5 text-[12px] text-[#3a352f]">
          {impressionName && <p className="line-clamp-1">Inspired by: {impressionName}</p>}
          {brand && <p className="line-clamp-1">Brand: {brand}</p>}
          {scentFamily && <p className="line-clamp-1">Fragrance: {scentFamily}</p>}
        </div>

        <div className="flex items-center gap-2 pr-14">
          <Stars rating={avgRating} />
          <span className="text-[12px] text-[#1f1a16]">{avgRating.toFixed(1)}/5</span>
          <span className="text-[12px] text-[#3a352f]">({globalAdmirePercent}%)</span>
        </div>

        <div className="flex items-baseline gap-2.5 pr-14">
          {headlinePrice != null ? (
            <>
              {disc > 0 && (
                <span className="strike-diagonal text-[13px] text-[#8c7f6d]">{formatRs(headlinePrice)}</span>
              )}
              <span className="text-[15px] font-bold text-[#b5179e]">{formatRs(finalOf(headlinePrice))}</span>
            </>
          ) : (
            <span className="text-[12px] text-[#8c7f6d]">Unavailable</span>
          )}
        </div>

        {/* Spec #3/#4 — icon only at rest, label slides out on hover */}
        <button
          ref={cartRef}
          type="button"
          onMouseEnter={() => cardEdition && replay(cartRef.current, "vibrating")}
          onClick={handleCart}
          disabled={!cardEdition}
          aria-label={inCartQty > 0 ? "Added to cart" : "Add to cart"}
          className={`absolute bottom-4 right-3 z-20 inline-flex flex-row-reverse items-center justify-center h-[52px] min-w-[52px] rounded-full px-0 gap-0 group-hover:px-4 group-hover:gap-2 shadow-[0_6px_16px_rgba(0,0,0,0.28)] transition-all duration-300 ${
            !cardEdition
              ? "bg-[#a8a099] cursor-not-allowed"
              : inCartQty > 0
              ? "bg-[#1d3a8f]"
              : "bg-[#e0342c]"
          } text-white`}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M7 4h-3a1 1 0 100 2h2.2l2.3 9.2A2 2 0 0010.4 17h7.2a2 2 0 001.9-1.4l2-6.6H8.2l-.5-2A1 1 0 007 4zm3.5 15a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2zm7 0a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z" />
          </svg>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] opacity-0 transition-all duration-300 group-hover:max-w-[130px] group-hover:opacity-100">
            {inCartQty > 0 ? "Added to Cart" : "Add to Cart"}
          </span>
          {inCartQty > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-white/25 text-[11px] font-bold leading-none">
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
