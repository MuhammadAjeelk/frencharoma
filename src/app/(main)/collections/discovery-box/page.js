"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import UniversalModal from "@/components/UniversalModal";

const MIN_ITEMS = 5;
const DISCOUNT_PERCENT = 25;

function getPriceRange(editions) {
  let min = Infinity;
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (!v.isActive || v.size !== "5ml") continue;
      if (v.price < min) min = v.price;
    }
  }
  return min === Infinity ? null : min;
}

function get5mlVariant(editions) {
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (v.isActive && v.size === "5ml") return { edition: ed, variant: v };
    }
  }
  return null;
}

export default function DiscoveryBoxPage() {
  const { addItem } = useCart();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch("/api/perfumes?limit=100&sort=global-admire-desc")
      .then((r) => r.json())
      .then((data) => {
        const testerPerfumes = (data.perfumes || []).filter((p) => {
          return (p.editions || []).some(
            (ed) => ed.enabled && (ed.variants || []).some((v) => v.isActive && v.size === "5ml")
          );
        });
        setPerfumes(testerPerfumes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = useCallback((perfumeId) => {
    setSelected((prev) => {
      if (prev.includes(perfumeId)) return prev.filter((id) => id !== perfumeId);
      return [...prev, perfumeId];
    });
  }, []);

  const handleAddAllToCart = () => {
    if (selected.length < MIN_ITEMS) return;

    for (const id of selected) {
      const p = perfumes.find((pf) => pf._id === id);
      if (!p) continue;
      const match = get5mlVariant(p.editions);
      if (!match) continue;
      const discountedPrice = Math.round(match.variant.price * (1 - DISCOUNT_PERCENT / 100));
      addItem({
        perfumeId: p._id,
        slug: p.slug,
        name: p.name,
        image: p.images?.main || "",
        edition: match.edition.key,
        size: "5ml",
        price: discountedPrice,
      });
    }
    setAdded(true);
    setShowConfirm(false);
    setTimeout(() => setAdded(false), 3000);
  };

  const totalOriginal = selected.reduce((sum, id) => {
    const p = perfumes.find((pf) => pf._id === id);
    const price = p ? getPriceRange(p.editions) : 0;
    return sum + (price || 0);
  }, 0);
  const totalDiscounted = Math.round(totalOriginal * (1 - DISCOUNT_PERCENT / 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-white to-white">
      {/* Header */}
      <div className="relative py-10 md:py-14 text-center overflow-hidden bg-[#f3efe8] border-b border-black/5">
        <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Discovery Box</span>
        </nav>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-[#1f1a16]">
          Discovery Box
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#5f5a54] max-w-xl mx-auto">
          Pick any {MIN_ITEMS} or more 5ml testers and get <strong>{DISCOUNT_PERCENT}% off</strong> your selection.
          Explore before you commit!
        </p>
      </div>

      {/* Floating selection bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              selected.length >= MIN_ITEMS ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {selected.length}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {selected.length} of {MIN_ITEMS} minimum selected
              </p>
              <p className="text-xs text-gray-500">
                {selected.length < MIN_ITEMS
                  ? `Select ${MIN_ITEMS - selected.length} more to unlock ${DISCOUNT_PERCENT}% off`
                  : `${DISCOUNT_PERCENT}% discount applied!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selected.length > 0 && (
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-400 line-through">PKR {totalOriginal.toLocaleString()}</p>
                <p className="text-sm font-bold text-green-700">PKR {totalDiscounted.toLocaleString()}</p>
              </div>
            )}
            <button
              onClick={() => selected.length >= MIN_ITEMS ? setShowConfirm(true) : null}
              disabled={selected.length < MIN_ITEMS}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                selected.length >= MIN_ITEMS
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : perfumes.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No 5ml testers available</h3>
            <p className="text-sm text-gray-400 mb-6">Check back soon — we're always adding new fragrances.</p>
            <Link href="/collections/shop-all" className="inline-block bg-black text-white px-6 py-3 rounded font-semibold text-sm hover:bg-gray-800">
              Browse All Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {perfumes.map((p) => {
              const price = getPriceRange(p.editions);
              const isSelected = selected.includes(p._id);
              const discountedPrice = price ? Math.round(price * (1 - DISCOUNT_PERCENT / 100)) : null;
              return (
                <div
                  key={p._id}
                  onClick={() => toggleSelect(p._id)}
                  className={`relative border-2 rounded-lg overflow-hidden bg-white cursor-pointer transition-all duration-200 flex flex-col ${
                    isSelected
                      ? "border-green-500 shadow-md ring-2 ring-green-200"
                      : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  {/* Selection indicator */}
                  <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected ? "bg-green-600 text-white" : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}>
                    {isSelected ? "✓" : ""}
                  </div>

                  <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                    {p.images?.main ? (
                      <Image src={p.images.main} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 20vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{p.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 w-fit mb-2">5ml Tester</span>
                    <div className="flex-1" />
                    {price && (
                      <div>
                        <span className="text-xs text-gray-400 line-through">PKR {price.toLocaleString()}</span>
                        <p className="text-sm font-bold text-green-700">PKR {discountedPrice.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <UniversalModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} heading="Confirm Discovery Box">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You've selected <strong>{selected.length}</strong> testers. Each will be added to your cart with a{" "}
            <strong>{DISCOUNT_PERCENT}% discount</strong>.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Original Total</span>
              <span className="text-gray-400 line-through">PKR {totalOriginal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Discovery Discount ({DISCOUNT_PERCENT}%)</span>
              <span className="text-green-600 font-semibold">-PKR {(totalOriginal - totalDiscounted).toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>PKR {totalDiscounted.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
              Go Back
            </button>
            <button onClick={handleAddAllToCart} className="flex-1 py-3 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
              Add All to Cart
            </button>
          </div>
        </div>
      </UniversalModal>
    </div>
  );
}
