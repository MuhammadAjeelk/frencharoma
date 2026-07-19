"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getSellableEditions, getCardEdition, getBestFor, formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";

const EDITION_STYLE = {
  luxury:  { label: "Luxury Edition",  bar: "bg-gradient-to-r from-[#c9a24a] to-[#e6c986]", text: "text-[#3a2c08]" },
  premium: { label: "Premium Edition", bar: "bg-gradient-to-r from-[#b6b6bb] to-[#e4e4e8]", text: "text-[#2b2b2b]" },
  classic: { label: "Classic Edition", bar: "bg-gradient-to-r from-[#d8cbb8] to-[#efe7d8]", text: "text-[#3a352f]" },
};

function buildImages(perfume) {
  const imgs = [];
  if (perfume?.images?.main) imgs.push(perfume.images.main);
  for (const i of perfume?.images?.gallery || []) if (!imgs.includes(i)) imgs.push(i);
  return imgs;
}

// Quick View window — a compact preview opened from a card's "Quick View" button.
export default function QuickAddModal({ perfume, onClose }) {
  const { addItem } = useCart();

  const images = useMemo(() => buildImages(perfume), [perfume]);
  const sellable = useMemo(() => getSellableEditions(perfume?.editions), [perfume]);
  const cardEdition = useMemo(() => getCardEdition(perfume?.editions), [perfume]);
  const gm = genderMeta(perfume?.gender);
  const bestFor = getBestFor(perfume?.tags);
  const admire = Math.min(100, Math.max(60, Number(perfume?.globalAdmirePercent) || 60));

  const disc = Number(perfume?.discountPercent) || 0;
  const finalOf = (p) => (disc > 0 ? Math.round(p * (1 - disc / 100)) : p);
  const headlinePrice = cardEdition ? cardEdition.variant.price : null;
  const hasChoice = sellable.length > 1;

  const [activeIdx, setActiveIdx] = useState(0);
  const [showBanners, setShowBanners] = useState(false);
  const [added, setAdded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

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
    });
    setShowBanners(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleCta = () => {
    if (!cardEdition) return;
    if (hasChoice) { setShowBanners((v) => !v); return; }
    addEdition(sellable[0]);
  };

  const notes = perfume?.notes || {};
  const hasNotes = (notes.top?.length || 0) + (notes.middle?.length || 0) + (notes.base?.length || 0) > 0;

  return (
    <div>
      {/* Image with hover arrows */}
      {images.length > 0 && (
        <div className="group relative w-full aspect-[6.818/7.5] overflow-hidden bg-gray-50 mb-4">
          <Image src={images[activeIdx]} alt={perfume.name} fill className="object-cover" sizes="500px" />
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
        {bestFor && (
          <p className="flex items-center gap-2">
            Best For:
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#f7f0e2] text-[#9a7b32] text-xs font-semibold border border-[#e8dcbf]">{bestFor}</span>
          </p>
        )}
        <div className="pt-0.5">
          <span>Globally Admired by: <span className="font-bold text-[#1f1a16]">{admire}%</span></span>
        </div>
      </div>

      {/* Gender divider */}
      <div className="h-[3px] rounded-full my-3" style={{ backgroundColor: gm ? gm.hex : "#d9d3cb" }} />

      {/* Price */}
      {headlinePrice != null && (
        <div className="flex items-baseline justify-center gap-8 flex-wrap mb-3">
          {disc > 0 && <span className="text-base font-normal text-[#a09890] strike-diagonal">{formatRs(headlinePrice)}</span>}
          <span className="text-base font-semibold text-[#1f1a16]">{formatRs(finalOf(headlinePrice))}</span>
        </div>
      )}

      {/* Add to cart + edition banners */}
      <div className="mb-4">
        {showBanners && hasChoice && (
          <div className="flex flex-col gap-1.5 mb-2">
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
          disabled={!cardEdition}
          className={`w-full py-3 rounded-lg font-semibold text-sm tracking-wide uppercase transition-colors ${
            cardEdition ? "bg-black text-white hover:bg-gray-800 hover-vibrate" : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {added ? "Added to Cart ✓" : "Add to Cart"}
        </button>
      </div>

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

      {/* Scent Profile */}
      {hasNotes && (
        <div className="border-t border-[#e8e4df]">
          <button onClick={() => setNotesOpen((o) => !o)} className="w-full flex items-center justify-between py-3 text-left">
            <span className="text-sm font-semibold text-[#1f1a16] uppercase tracking-wide">Scent Profile</span>
            <span className={`text-gray-400 transition-transform ${notesOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {notesOpen && (
            <div className="space-y-1.5 text-sm text-[#4a4540] pb-3">
              {notes.top?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Top:</span> {notes.top.join(", ")}</p>}
              {notes.middle?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Heart:</span> {notes.middle.join(", ")}</p>}
              {notes.base?.length > 0 && <p><span className="font-semibold text-[#1f1a16]">Base:</span> {notes.base.join(", ")}</p>}
            </div>
          )}
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
