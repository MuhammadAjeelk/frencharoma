"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getSellableEditions, getCardEdition, getBestFor, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";
import EditionInfoModal from "./EditionInfoModal";

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

  return (
    <div>
      {/* Image with hover arrows */}
      {images.length > 0 && (
        <div className="group relative w-full aspect-[6.818/7.5] overflow-hidden bg-gray-50 mb-4 rounded-xl">
          <Image src={images[activeIdx]} alt={perfume.name} fill className="object-cover" sizes="620px" />

          {/* Card badges — same as the perfume card (discount, wishlist, best seller, size) */}
          {!boxMode && disc > 0 && (
            <span className="absolute top-2 left-2 z-10 bg-[#1a1a2e] text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
              -{disc}% OFF
            </span>
          )}
          {!boxMode && (
            <button
              onClick={toggleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
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
          )}
          {!boxMode && perfume.isBestSeller && (
            <span className="absolute bottom-2 left-2 z-10 bg-[#b8964e] text-white rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-md">
              Best Sellers
            </span>
          )}
          <span className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#6b6560] shadow-sm">
            {sizeLabel}
          </span>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Name + gender */}
      <h2 className="text-lg font-bold text-[#1f1a16] mb-2">
        {perfume.name}
        {gm && (
          <>
            {" – "}
            <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
          </>
        )}
      </h2>

      <div className="space-y-1 text-sm text-[#4a4540]">
        {perfume.impressionName && <p>Inspired by: <span className="font-semibold text-[#1f1a16]">{perfume.impressionName}</span></p>}
        {brandLabel && <p>Brand: <span className="font-semibold text-[#1f1a16]">{brandLabel}</span></p>}
        {perfume.scentFamily && (
          <p>Fragrance Family: <span className="font-semibold text-[#1f1a16]">{perfume.scentFamily}</span></p>
        )}
        {bestFor && (
          <p className="flex items-center gap-2">
            Best For:
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#f7f0e2] text-[#9a7b32] text-xs font-semibold border border-[#e8dcbf]">{bestFor}</span>
          </p>
        )}
        {!boxMode && displaySellable.length > 0 && (
          <p className="flex items-center gap-2 flex-wrap">
            Edition:
            {displaySellable.map((e) => {
              const st = EDITION_STYLE[e.key] || EDITION_STYLE.classic;
              return (
                <button
                  key={e.key}
                  onClick={() => { setEditionFocus(e.key); setEditionInfoOpen(true); }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm transition-transform duration-200 hover:scale-105 ${st.pill}`}
                >
                  {st.label}
                </button>
              );
            })}
          </p>
        )}
        <div className="pt-0.5">
          <span>Globally Admired by: <span className="font-bold text-[#1f1a16]">{admire}%</span> <span className="text-[#6b6560]">Satisfied Users</span></span>
        </div>
      </div>

      {/* Gender divider */}
      <div className="h-[3px] rounded-full my-3" style={{ backgroundColor: gm ? gm.hex : "#d9d3cb" }} />

      {/* Price — hidden once the edition chooser is showing (spec pt 7) */}
      {headlinePrice != null && !showBanners && (
        <div className="flex items-baseline justify-center gap-12 sm:gap-16 flex-wrap mb-3">
          {disc > 0 && <span className="text-base font-normal text-[#a09890] strike-diagonal">{formatRs(headlinePrice)}</span>}
          <span className="text-base font-semibold text-[#1f1a16]">{formatRs(finalOf(headlinePrice))}</span>
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
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 ${st.bar} ${st.text} shadow-sm hover:brightness-[1.04] hover:shadow transition`}
                >
                  <span className="text-xs font-bold">{st.label} <span className="font-medium opacity-80">({e.variant.size})</span></span>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {disc > 0 && <span className="line-through opacity-60 font-medium">{formatRs(e.variant.price)}</span>}
                    {formatRs(finalOf(e.variant.price))}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={handleCta}
          disabled={boxMode ? boxSoldOut : !cardEdition}
          className={`w-full py-3 rounded-lg font-semibold text-sm tracking-wide uppercase transition-colors ${
            boxMode
              ? boxSoldOut
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : boxSelected
                ? "bg-[#efe9db] text-[#8a6f2e] hover:bg-[#e7dfcb]"
                : "bg-black text-white hover:bg-gray-800 hover-vibrate"
              : !cardEdition
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : showBanners
              ? "bg-black text-white hover:bg-gray-800"
              : inCartQty > 0
              ? "bg-[#1d3a8f] text-white hover:bg-[#16306f]"
              : "bg-black text-white hover:bg-gray-800 hover-vibrate"
          }`}
        >
          {boxMode ? (
            boxSoldOut ? "Sold Out" : boxSelected ? "✓ In Box — Remove" : "Add to Box"
          ) : !cardEdition ? (
            "Unavailable"
          ) : showBanners ? (
            "Choose Your Edition"
          ) : inCartQty > 0 ? (
            <span className="inline-flex items-center justify-center gap-2">
              Added to Cart
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white/25 text-white text-[11px] font-bold leading-none">
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
        <div className="border-t border-[#e8e4df]">
          <button onClick={() => setNotesOpen((o) => !o)} className="w-full flex items-center justify-between py-3 text-left">
            <span className="text-sm font-semibold text-[#1f1a16] uppercase tracking-wide">Scent Profile</span>
            <span className={`text-gray-400 transition-transform ${notesOpen ? "rotate-180" : ""}`}>▴</span>
          </button>
          {notesOpen && (
            <div className="space-y-1.5 text-sm text-[#4a4540] pb-3">
              {perfume.howItSmells && (
                <p><span className="font-semibold text-[#1f1a16]">How It Smells?</span> {perfume.howItSmells}</p>
              )}
              {perfume.idealFor && (
                <p><span className="font-semibold text-[#1f1a16]">Ideal For:</span> {perfume.idealFor}</p>
              )}
              {notes.top?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Top Notes:</span> {notes.top.join(", ")}</p>}
              {notes.middle?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Heart Notes:</span> {notes.middle.join(", ")}</p>}
              {notes.base?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Base Notes:</span> {notes.base.join(", ")}</p>}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {perfume.description && (
        <div className="border-t border-[#e8e4df]">
          <button onClick={() => setDescOpen((o) => !o)} className="w-full flex items-center justify-between py-3 text-left">
            <span className="text-sm font-semibold text-[#1f1a16] uppercase tracking-wide">Description</span>
            <span className={`text-gray-400 transition-transform ${descOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {descOpen && <p className="text-sm text-[#4a4540] leading-relaxed pb-3">{perfume.description}</p>}
        </div>
      )}

      <Link
        href={`/products/${perfume.slug}`}
        onClick={onClose}
        className="mt-4 block w-full text-center border border-black text-black py-3 rounded-lg font-semibold text-sm hover:bg-black hover:text-white transition-colors"
      >
        View Full Details
      </Link>
    </div>
  );
}
