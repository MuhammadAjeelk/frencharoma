"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const BOX_SIZE = 5;
const DISCOUNT_PERCENT = 25;

function get5mlVariant(editions) {
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (v.isActive && v.size === "5ml") return { edition: ed, variant: v };
    }
  }
  return null;
}

function getPerfumePrice(p) {
  const match = get5mlVariant(p.editions);
  return match?.variant?.price ?? null;
}

// ── Empty slot placeholder ─────────────────────────────────────────────────
function EmptySlot({ index, isSwapMode, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 w-full aspect-square bg-white
        ${isSwapMode
          ? "border-amber-400 bg-amber-50 animate-pulse cursor-pointer shadow-md"
          : "border-gray-300 cursor-default"
        }`}
    >
      <span className={`text-2xl font-bold mb-0.5 ${isSwapMode ? "text-amber-500" : "text-gray-300"}`}>
        {isSwapMode ? "↓" : index + 1}
      </span>
      <span className={`text-[10px] font-medium ${isSwapMode ? "text-amber-500" : "text-gray-300"}`}>
        {isSwapMode ? "Place here" : "Empty"}
      </span>
    </button>
  );
}

// ── Filled slot ────────────────────────────────────────────────────────────
function FilledSlot({ perfume, index, isSwapMode, onRemove, onSwap }) {
  return (
    <div
      className={`relative rounded-xl border-2 overflow-hidden w-full aspect-square transition-all duration-200 cursor-pointer group
        ${isSwapMode
          ? "border-amber-400 shadow-lg ring-2 ring-amber-300"
          : "border-[#b8964e] shadow-sm"
        }`}
      onClick={isSwapMode ? onSwap : undefined}
    >
      {perfume.images?.main ? (
        <Image
          src={perfume.images.main}
          alt={perfume.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-300 text-xs text-center px-1 leading-tight">{perfume.name}</span>
        </div>
      )}

      {/* Overlay on swap mode */}
      {isSwapMode && (
        <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-full">
            Replace
          </span>
        </div>
      )}

      {/* Remove button (normal mode) */}
      {!isSwapMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold leading-none z-10"
          aria-label="Remove"
        >
          ×
        </button>
      )}

      {/* Slot number badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 pb-0.5 pt-2">
        <p className="text-[9px] text-white font-medium truncate leading-tight">{perfume.name}</p>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DiscoveryBoxPage() {
  const { addItem } = useCart();

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // array of perfume IDs, max BOX_SIZE
  const [swapCandidate, setSwapCandidate] = useState(null); // ID of new perfume to swap in
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch available perfumes
  useEffect(() => {
    fetch("/api/perfumes?limit=200&sort=global-admire-desc")
      .then((r) => r.json())
      .then((data) => {
        const all = data.perfumes || [];
        // Prefer perfumes with 5ml variants; fall back to all active
        const with5ml = all.filter((p) =>
          (p.editions || []).some(
            (ed) => ed.enabled && (ed.variants || []).some((v) => v.isActive && v.size === "5ml")
          )
        );
        setPerfumes(with5ml.length > 0 ? with5ml : all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Selection logic ──────────────────────────────────────────────────────
  const handlePerfumeClick = useCallback((perfumeId) => {
    // Already selected → deselect
    if (selected.includes(perfumeId)) {
      setSelected((prev) => prev.filter((id) => id !== perfumeId));
      if (swapCandidate === perfumeId) setSwapCandidate(null);
      return;
    }
    // If this is the current swap candidate, cancel
    if (swapCandidate === perfumeId) {
      setSwapCandidate(null);
      return;
    }
    // Box has room → add
    if (selected.length < BOX_SIZE) {
      setSelected((prev) => [...prev, perfumeId]);
      setSwapCandidate(null);
      return;
    }
    // Box full → enter swap mode
    setSwapCandidate(perfumeId);
  }, [selected, swapCandidate]);

  const handleSlotAction = useCallback((index) => {
    if (swapCandidate) {
      // Replace the perfume at this index
      setSelected((prev) => {
        const next = [...prev];
        next[index] = swapCandidate;
        return next;
      });
      setSwapCandidate(null);
    } else {
      // Remove
      setSelected((prev) => prev.filter((_, i) => i !== index));
    }
  }, [swapCandidate]);

  const cancelSwap = () => setSwapCandidate(null);

  // ── Add to cart ──────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (selected.length !== BOX_SIZE) return;
    for (const id of selected) {
      const p = perfumes.find((pf) => pf._id === id);
      if (!p) continue;
      const match = get5mlVariant(p.editions);
      const basePrice = match?.variant?.price ?? getPerfumePrice(p) ?? 0;
      const finalPrice = Math.round(basePrice * (1 - DISCOUNT_PERCENT / 100));
      addItem({
        perfumeId: p._id,
        slug: p.slug,
        name: p.name,
        image: p.images?.main || "",
        edition: match?.edition?.key || "classic",
        size: "5ml",
        price: finalPrice,
        isDiscoveryBox: true,
      });
    }
    setAddedToCart(true);
    setSelected([]);
    setSwapCandidate(null);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // ── Pricing ──────────────────────────────────────────────────────────────
  const totalOriginal = selected.reduce((sum, id) => {
    const p = perfumes.find((pf) => pf._id === id);
    return sum + (getPerfumePrice(p) || 0);
  }, 0);
  const totalDiscounted = Math.round(totalOriginal * (1 - DISCOUNT_PERCENT / 100));
  const savings = totalOriginal - totalDiscounted;

  const isBoxComplete = selected.length === BOX_SIZE;
  const isSwapMode = swapCandidate !== null;
  const swapPerfume = isSwapMode ? perfumes.find((p) => p._id === swapCandidate) : null;

  // ── Slot data ─────────────────────────────────────────────────────────────
  const slots = Array.from({ length: BOX_SIZE }, (_, i) => {
    const id = selected[i];
    return id ? perfumes.find((p) => p._id === id) || null : null;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1a1a2e] text-white py-10 md:py-14 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#b8964e]/10" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#b8964e]/10" />
        </div>
        <nav className="flex justify-center items-center gap-2 text-xs text-white/40 mb-3">
          <Link href="/" className="hover:text-white/70">Home</Link>
          <span>/</span>
          <span className="text-white/60">Discovery Box</span>
        </nav>
        <div className="inline-flex items-center gap-2 bg-[#b8964e]/20 border border-[#b8964e]/40 rounded-full px-4 py-1 mb-4">
          <span className="text-[#b8964e] text-xs font-semibold uppercase tracking-widest">Limited Offer</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
          Discovery Box
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Build your personal tester kit. Choose exactly&nbsp;
          <strong className="text-[#b8964e]">5 fragrances</strong> in 5ml bottles and get&nbsp;
          <strong className="text-[#b8964e]">{DISCOUNT_PERCENT}% off</strong> — explore before you commit.
        </p>

        {/* Step guide */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {[
            { n: "1", label: "Browse & select 5" },
            { n: "2", label: "Swap any time" },
            { n: "3", label: "Add box to cart" },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-5 h-5 rounded-full bg-[#b8964e]/30 text-[#b8964e] flex items-center justify-center font-bold text-[10px]">
                {s.n}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky box builder ───────────────────────────────────────────── */}
      <div className={`sticky top-0 z-30 border-b shadow-sm transition-colors duration-300 ${
        isSwapMode
          ? "bg-amber-50 border-amber-300"
          : isBoxComplete
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* Swap mode banner */}
          {isSwapMode && (
            <div className="flex items-center justify-between mb-2 bg-amber-100 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 text-sm">
                  🔄 Tap a box below to replace it with&nbsp;
                  <strong className="text-amber-800">{swapPerfume?.name}</strong>
                </span>
              </div>
              <button
                onClick={cancelSwap}
                className="text-xs text-amber-700 font-semibold border border-amber-400 rounded-full px-2.5 py-0.5 hover:bg-amber-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* 5 slots */}
            <div className="flex gap-2 flex-1 min-w-0">
              {slots.map((perfume, i) =>
                perfume ? (
                  <div key={i} className="w-[60px] sm:w-[72px] shrink-0">
                    <FilledSlot
                      perfume={perfume}
                      index={i}
                      isSwapMode={isSwapMode}
                      onRemove={handleSlotAction}
                      onSwap={() => handleSlotAction(i)}
                    />
                  </div>
                ) : (
                  <div key={i} className="w-[60px] sm:w-[72px] shrink-0">
                    <EmptySlot
                      index={i}
                      isSwapMode={isSwapMode}
                      onClick={isSwapMode ? () => handleSlotAction(i) : undefined}
                    />
                  </div>
                )
              )}
            </div>

            {/* Progress + CTA */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/* Progress pills */}
              <div className="flex gap-1">
                {Array.from({ length: BOX_SIZE }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-5 rounded-full transition-colors duration-200 ${
                      i < selected.length
                        ? isBoxComplete ? "bg-green-500" : "bg-[#b8964e]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className={`text-xs font-semibold ${
                isBoxComplete ? "text-green-700" : "text-gray-500"
              }`}>
                {isBoxComplete
                  ? `Box ready! ${DISCOUNT_PERCENT}% off`
                  : `${selected.length}/${BOX_SIZE} selected`}
              </p>

              {isBoxComplete && (
                <button
                  onClick={handleAddToCart}
                  className="mt-0.5 px-4 py-2 bg-[#1a1a2e] text-white text-xs font-bold rounded-lg hover:bg-[#b8964e] transition-colors whitespace-nowrap"
                >
                  {addedToCart ? "✓ Added!" : "Add Box to Cart →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Section heading */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] uppercase tracking-wide">
              Choose Your Fragrances
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${perfumes.length} fragrances available`}
            </p>
          </div>
          {selected.length > 0 && !isBoxComplete && (
            <span className="text-xs text-[#b8964e] font-semibold">
              {BOX_SIZE - selected.length} more to go
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[6.818/7.5] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && perfumes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No testers available yet</h3>
            <p className="text-sm text-gray-400 mb-6">We're stocking up. Check back soon!</p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-[#1a1a2e] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Browse All Perfumes
            </Link>
          </div>
        )}

        {/* Perfume cards */}
        {!loading && perfumes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {perfumes.map((p) => {
              const price = getPerfumePrice(p);
              const isSelected = selected.includes(p._id);
              const isSwapTarget = swapCandidate === p._id;
              const discountedPrice = price ? Math.round(price * (1 - DISCOUNT_PERCENT / 100)) : null;
              const selectionIndex = selected.indexOf(p._id);

              return (
                <div
                  key={p._id}
                  onClick={() => handlePerfumeClick(p._id)}
                  className={`relative rounded-xl border-2 overflow-hidden bg-white cursor-pointer transition-all duration-200 flex flex-col group
                    ${isSwapTarget
                      ? "border-amber-500 shadow-lg ring-2 ring-amber-300 scale-[1.02]"
                      : isSelected
                      ? "border-[#b8964e] shadow-md"
                      : isSwapMode
                      ? "border-gray-200 hover:border-amber-400 hover:shadow-sm opacity-80 hover:opacity-100"
                      : isBoxComplete
                      ? "border-gray-200 opacity-60 hover:opacity-80 hover:border-amber-400"
                      : "border-gray-200 hover:border-[#b8964e] hover:shadow-sm"
                    }`}
                >
                  {/* Selection number badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-[#b8964e] text-white flex items-center justify-center text-[11px] font-bold shadow">
                      {selectionIndex + 1}
                    </div>
                  )}

                  {/* Swap target badge */}
                  {isSwapTarget && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow">
                      New
                    </div>
                  )}

                  {/* Add/remove hint on hover */}
                  {!isSelected && !isSwapMode && !isBoxComplete && (
                    <div className="absolute inset-0 bg-[#1a1a2e]/0 group-hover:bg-[#1a1a2e]/5 transition-colors z-0 pointer-events-none" />
                  )}

                  {/* Image */}
                  <div className="relative w-full aspect-[6.818/7.5] overflow-hidden bg-[#f7f5f2]">
                    {p.images?.main ? (
                      <Image
                        src={p.images.main}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#b8964e]/10 pointer-events-none" />
                    )}

                    {/* 5ml badge */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm">
                      5ml
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[11px] text-[#b8964e] font-semibold uppercase tracking-wide mb-0.5 truncate">
                      {p.brands?.[0] || p.brand || "French Aromas"}
                    </p>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#1a1a2e] mb-2 line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                    <div className="flex-1" />
                    {price ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 line-through">PKR {price.toLocaleString()}</span>
                        <span className="text-xs font-bold text-[#1a1a2e]">PKR {discountedPrice?.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">Price on selection</span>
                    )}
                  </div>

                  {/* Bottom action strip */}
                  <div className={`px-3 pb-3 transition-all duration-200 ${
                    isSelected || isSwapTarget ? "block" : "hidden group-hover:block"
                  }`}>
                    <div className={`w-full py-1.5 rounded-lg text-center text-[11px] font-bold transition-colors ${
                      isSwapTarget
                        ? "bg-amber-500 text-white"
                        : isSelected
                        ? "bg-gray-100 text-gray-600"
                        : "bg-[#1a1a2e] text-white"
                    }`}>
                      {isSwapTarget ? "Tap a box to place" : isSelected ? "✓ In your box — click to remove" : "+ Add to box"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sticky bottom summary (shown when box is complete) ────────────── */}
      {isBoxComplete && (
        <div className="sticky bottom-0 z-30 bg-[#1a1a2e] border-t border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-1.5">
                {slots.map((p, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0">
                    {p?.images?.main ? (
                      <Image src={p.images.main} alt={p?.name || ""} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-bold">
                  {BOX_SIZE} × 5ml Discovery Box
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/40 text-xs line-through">PKR {totalOriginal.toLocaleString()}</span>
                  <span className="text-[#b8964e] text-xs font-bold">PKR {totalDiscounted.toLocaleString()}</span>
                  <span className="bg-[#b8964e]/20 text-[#b8964e] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Save PKR {savings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-[#b8964e] text-white font-bold text-sm rounded-xl hover:bg-[#a07c3e] transition-colors whitespace-nowrap shadow-lg"
            >
              {addedToCart ? "✓ Added to Cart!" : "Add Box to Cart →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
