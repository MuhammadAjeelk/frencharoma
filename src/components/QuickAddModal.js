"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getSellableEditions, getCardEdition, getBestFor, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";
import EditionInfoModal from "./EditionInfoModal";
import DiscountRibbon from "./DiscountRibbon";
import { FOCUS_RING_LIGHT } from "@/lib/design";

const EDITION_STYLE = {
  luxury:  { label: "Luxury Edition",  bar: "bg-gradient-to-r from-[#c9a24a] to-[#e6c986]", text: "text-[#3a2c08]", pill: "bg-[#c9a24a] text-[#2a2008]" },
  premium: { label: "Premium Edition", bar: "bg-gradient-to-r from-[#b6b6bb] to-[#e4e4e8]", text: "text-[#2b2b2b]", pill: "bg-[#c3c3ca] text-[#2b2b2b]" },
  classic: { label: "Classic Edition", bar: "bg-gradient-to-r from-[#d8cbb8] to-[#efe7d8]", text: "text-[#3a352f]", pill: "bg-[#d8cbb8] text-[#3a352f]" },
};

function buildImages(perfume) {
  const imgs = [];
  if (perfume?.images?.main) imgs.push(perfume.images.main);
  for (const i of perfume?.images?.gallery || []) if (!imgs.includes(i)) imgs.push(i);
  return imgs;
}

// Quick View window — a compact preview opened from a card's "Quick View" button.
// In box mode it previews the 5ml tester and swaps "Add to Cart" for "Add to Box".
//
// This renders as the body of a UniversalModal, so it inherits that panel's warm
// light ground (#efe7db) and draws ink type on it.
export default function QuickAddModal({
  perfume,
  onClose,
  boxMode = false,
  boxImage = "",
  boxPrice = null,
  boxDiscountPercent = 25,
  boxSelected = false,
  boxSoldOut = false,
  onAddToBox,
  activeEdition = null,
}) {
  const { addItem, perfumeQty } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const images = useMemo(
    () => (boxMode ? (boxImage ? [boxImage] : buildImages(perfume)) : buildImages(perfume)),
    [perfume, boxMode, boxImage]
  );
  const sellable = useMemo(() => getSellableEditions(perfume?.editions), [perfume]);
  const cardEdition = useMemo(() => getCardEdition(perfume?.editions), [perfume]);
  const gm = genderMeta(perfume?.gender);
  const bestFor = getBestFor(perfume?.tags);
  const admire = Math.min(100, Math.max(60, Number(perfume?.globalAdmirePercent) || 60));

  const disc = boxMode
    ? Number(boxDiscountPercent) || 0
    : Number(perfume?.discountPercent) || 0;
  const finalOf = (p) => (disc > 0 ? Math.round(p * (1 - disc / 100)) : p);
  // Collection filter → commit to one edition (single pill, its price, direct add)
  const activeSellable =
    !boxMode && activeEdition ? sellable.find((s) => s.key === activeEdition) : null;
  const displayEdition = activeSellable || cardEdition;
  const displaySellable = activeSellable ? [activeSellable] : sellable;
  const headlinePrice = boxMode
    ? boxPrice
    : displayEdition
    ? displayEdition.variant.price
    : null;
  const hasChoice = !boxMode && !activeSellable && sellable.length > 1;
  const sizeLabel = boxMode ? "5ml" : displayEdition?.variant?.size || "50ml";

  const [activeIdx, setActiveIdx] = useState(0);
  const [showBanners, setShowBanners] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true); // Scent Profile open by default
  const [editionInfoOpen, setEditionInfoOpen] = useState(false);
  const [editionFocus, setEditionFocus] = useState(null);
  const inCartQty = !boxMode && perfume?._id ? perfumeQty(perfume._id) : 0;
  const wishlisted = perfume?.slug ? isInWishlist(perfume.slug) : false;

  const toggleWishlist = () => {
    toggleItem({
      slug: perfume.slug,
      name: perfume.name,
      brand: brandLabel,
      image: perfume.images?.main || "",
      price: headlinePrice != null ? finalOf(headlinePrice) : 0,
    });
  };

  const brandLabel = Array.isArray(perfume?.brands) && perfume.brands.length > 0
    ? perfume.brands.join(", ")
    : perfume?.brand || "";

  const addEdition = (entry) => {
    if (!entry) return;
    addItem({
      perfumeId: perfume._id,
      slug: perfume.slug,
      name: perfume.name,
      image: perfume.images?.main || "",
      edition: entry.key,
      size: entry.variant.size,
      price: finalOf(entry.variant.price),
      originalPrice: entry.variant.price,
      discountPercent: disc,
      gender: perfume.gender || "",
      impressionName: perfume.impressionName || "",
    });
    setShowBanners(false);
  };

  const handleCta = () => {
    if (boxMode) {
      if (!boxSoldOut) onAddToBox?.();
      return;
    }
    if (!cardEdition) return;
    if (activeSellable) { addEdition(activeSellable); return; }
    if (hasChoice) { setShowBanners((v) => !v); return; }
    addEdition(sellable[0]);
  };

  const notes = perfume?.notes || {};
  const hasNotes = (notes.top?.length || 0) + (notes.middle?.length || 0) + (notes.base?.length || 0) > 0;

  const disabled = boxMode ? boxSoldOut : !cardEdition;

  return (
    <div>
      {/* Image with hover arrows */}
      {images.length > 0 && (
        <div className="group relative isolate w-full aspect-[6.818/7.5] overflow-hidden bg-[#e3d7c1] border border-[#d1ae6d] mb-4">
          <Image src={images[activeIdx]} alt={perfume.name} fill className="object-cover" sizes="620px" />

          {/* Card badges — same as the perfume card (discount, wishlist, best seller, size) */}
          {!boxMode && disc > 0 && activeIdx === 0 && <DiscountRibbon percent={disc} className="scale-[1.28] origin-top-left" />}
          {!boxMode && activeIdx === 0 && (
            <button
              onClick={toggleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="group/heart absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-[#efe7db]/90 backdrop-blur-sm border border-[#c9a25a]/50 hover:bg-[#efe7db] transition-colors duration-200 shadow-sm"
            >
              <svg
                className={`w-[18px] h-[18px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#8a8175] group-hover/heart:text-[#e11d48]"}`}
                fill={wishlisted ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {!boxMode && perfume.isBestSeller && activeIdx === 0 && (
            <span className="absolute bottom-2 left-2 z-10 bg-[#c9a25a] text-[#211d18] rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-md">
              Best Sellers
            </span>
          )}
          {activeIdx === 0 && (
            <span className="absolute bottom-2 right-2 z-10 bg-[#efe7db]/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#211d18] shadow-sm">
              {sizeLabel}
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#efe7db]/90 border border-[#c9a25a]/50 text-[#211d18] rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#efe7db]/90 border border-[#c9a25a]/50 text-[#211d18] rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Name + gender */}
      <h2 className="font-[family-name:var(--font-playfair)] italic text-xl font-normal text-[#211d18] mb-2 break-words">
        {perfume.name}
        {gm && (
          <>
            {" – "}
            <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
          </>
        )}
      </h2>

      <div className="space-y-1 text-sm text-[#3f3931]">
        {perfume.impressionName && <p>Inspired by: <span className="font-semibold text-[#211d18]">{perfume.impressionName}</span></p>}
        {brandLabel && <p>Brand: <span className="font-semibold text-[#211d18]">{brandLabel}</span></p>}
        {perfume.scentFamily && (
          <p>Fragrance Family: <span className="font-semibold text-[#211d18]">{perfume.scentFamily}</span></p>
        )}
        {bestFor && (
          <p className="flex flex-wrap items-center gap-2">
            Best For:
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#e3d7c1] text-[#6f5518] text-xs font-semibold border border-[#c9a25a]/60">{bestFor}</span>
          </p>
        )}
        {!boxMode && displaySellable.length > 0 && (
          <p className="flex flex-wrap sm:flex-nowrap items-center gap-2 whitespace-normal sm:whitespace-nowrap">
            <span className="shrink-0">Edition:</span>
            {displaySellable.map((e) => {
              const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
              return (
                <button
                  key={e.key}
                  onClick={() => { setEditionFocus(e.key); setEditionInfoOpen(true); }}
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm transition-[filter] duration-200 hover:brightness-105 ${FOCUS_RING_LIGHT} ${st.pill}`}
                >
                  {st.label}
                </button>
              );
            })}
          </p>
        )}
        <div className="pt-0.5">
          <span>Globally Admired by: <span className="font-bold text-[#211d18]">{admire}%</span> <span className="text-[#6b6459]">Satisfied Users</span></span>
        </div>
      </div>

      {/* Gender divider */}
      <div className="h-[3px] my-3" style={{ backgroundColor: gm ? gm.hex : "#c4b79e" }} />

      {/* Price — hidden once the edition chooser is showing (spec pt 7) */}
      {headlinePrice != null && !showBanners && (
        <div className="flex items-baseline justify-center gap-12 sm:gap-16 flex-wrap mb-3">
          {disc > 0 && <span className="text-base font-normal text-[#8a8175] strike-diagonal">{formatRs(headlinePrice)}</span>}
          <span className="text-base font-semibold text-[#211d18]">{formatRs(finalOf(headlinePrice))}</span>
        </div>
      )}

      {/* Add to cart + edition banners */}
      <div className="mb-4">
        {showBanners && hasChoice && (
          <div className="flex flex-col gap-1.5 mb-2 animate-fadeIn">
            {sellable.map((e) => {
              const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
              return (
                <button
                  key={e.key}
                  onClick={() => addEdition(e)}
                  className={`hover-vibrate w-full flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 md:gap-x-12 gap-y-1 px-3 py-3 min-h-[46px] ${FOCUS_RING_LIGHT} ${st.bar} ${st.text} shadow-sm hover:brightness-[1.04] transition-[filter]`}
                >
                  <span className="text-xs sm:text-sm font-bold leading-none">{st.label} <span className="font-medium opacity-80">({e.variant.size})</span></span>
                  <span className="text-xs sm:text-sm font-bold flex items-center gap-2.5 leading-none">
                    {disc > 0 && <span className="strike-diagonal opacity-70 font-medium whitespace-nowrap">{formatRs(e.variant.price)}</span>}
                    {formatRs(finalOf(e.variant.price))}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={handleCta}
          disabled={disabled}
          className={`w-full py-3 min-h-[46px] flex items-center justify-center font-semibold text-sm tracking-[0.06em] transition-colors border ${FOCUS_RING_LIGHT} ${
            disabled
              ? "border-[#b9a98e] bg-[#d4c6ab] text-[#6d6459] cursor-not-allowed"
              : boxMode
              ? boxSelected
                ? "border-[#c9a25a] bg-[#e3d7c1] text-[#6f5518] hover:bg-[#d8c9ab]"
                : "border-[#c9a25a] bg-[#c9a25a] text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] hover-vibrate"
              : showBanners
              ? "border-[#373838] bg-[#373838] text-[#efe7db] hover:bg-[#2e2e2e]"
              : inCartQty > 0
              ? "border-[#211d18] bg-[#211d18] text-[#efe7db] hover:bg-[#373838]"
              : "border-[#c9a25a] bg-[#c9a25a] text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] hover-vibrate"
          }`}
        >
          {boxMode ? (
            boxSoldOut ? "Sold Out" : boxSelected ? "✓ In Box — Remove" : "Add to Box"
          ) : !cardEdition ? (
            "Unavailable"
          ) : showBanners ? (
            "Choose Your Edition"
          ) : inCartQty > 0 ? (
            <span className="inline-flex items-center justify-center gap-3">
              Added to Cart
              <span className="inline-flex items-center justify-center min-w-[21px] h-[21px] px-1 rounded-full bg-[#c9a25a] text-[#211d18] text-[11px] font-bold leading-none">
                {inCartQty}
              </span>
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>

      {!boxMode && (
        <EditionInfoModal
          open={editionInfoOpen}
          onClose={() => setEditionInfoOpen(false)}
          sellable={displaySellable}
          disc={disc}
          focus={editionFocus}
        />
      )}

      {/* Scent Profile — open by default (spec pt 13/14): How It Smells?, Ideal
          For:, then Top/Heart/Base notes */}
      {!boxMode && (perfume.howItSmells || perfume.idealFor || hasNotes) && (
        <div className="border-t border-[#211d18]/15">
          <button onClick={() => setNotesOpen((o) => !o)} className={`w-full flex items-center justify-between gap-3 py-3 text-left ${FOCUS_RING_LIGHT}`}>
            <span className="font-[family-name:var(--font-playfair)] italic text-base text-[#211d18]">Scent Profile</span>
            <span className={`text-[#6b6459] transition-transform ${notesOpen ? "rotate-180" : ""}`}>▴</span>
          </button>
          {notesOpen && (
            <div className="space-y-1.5 text-sm text-[#3f3931] pb-3">
              {perfume.howItSmells && (
                <p><span className="font-semibold text-[#211d18]">How It Smells?</span> {perfume.howItSmells}</p>
              )}
              {perfume.idealFor && (
                <p><span className="font-semibold text-[#211d18]">Ideal For:</span> {perfume.idealFor}</p>
              )}
              {notes.top?.length > 0 && <p><span className="font-semibold text-[#211d18]">Top Notes:</span> {notes.top.join(", ")}</p>}
              {notes.middle?.length > 0 && <p><span className="font-semibold text-[#211d18]">Heart Notes:</span> {notes.middle.join(", ")}</p>}
              {notes.base?.length > 0 && <p><span className="font-semibold text-[#211d18]">Base Notes:</span> {notes.base.join(", ")}</p>}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {perfume.description && (
        <div className="border-t border-[#211d18]/15">
          <button onClick={() => setDescOpen((o) => !o)} className={`w-full flex items-center justify-between gap-3 py-3 text-left ${FOCUS_RING_LIGHT}`}>
            <span className="font-[family-name:var(--font-playfair)] italic text-base text-[#211d18]">Description</span>
            <span className={`text-[#6b6459] transition-transform ${descOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {descOpen && <p className="text-sm text-[#3f3931] leading-relaxed pb-3">{perfume.description}</p>}
        </div>
      )}

      <Link
        href={`/products/${perfume.slug}`}
        onClick={onClose}
        className={`mt-4 block w-full text-center border border-[#211d18]/70 text-[#211d18] py-3 font-semibold text-sm hover:bg-[#211d18] hover:text-[#efe7db] transition-colors ${FOCUS_RING_LIGHT}`}
      >
        View Full Details
      </Link>
    </div>
  );
}
