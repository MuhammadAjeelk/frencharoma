"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// Editions (enabled) with their active full-size variants — the 5ml tester is
// excluded here (it's sold via the Discovery Box). If a perfume is tester-only,
// fall back to whatever active variants it has so it can still be added.
function fullSizeEditions(perfume) {
  const enabled = (perfume?.editions || []).filter((e) => e.enabled);
  const full = enabled
    .map((e) => ({ ...e, variants: (e.variants || []).filter((v) => v.isActive && v.size !== "5ml") }))
    .filter((e) => e.variants.length > 0);
  if (full.length > 0) return full;
  return enabled
    .map((e) => ({ ...e, variants: (e.variants || []).filter((v) => v.isActive) }))
    .filter((e) => e.variants.length > 0);
}

// Content for the "choose edition + size" popup shown when Add to Cart is
// clicked on a card that has more than one option. Rendered inside UniversalModal.
export default function QuickAddModal({ perfume, onClose }) {
  const { addItem } = useCart();
  const editions = useMemo(() => fullSizeEditions(perfume), [perfume]);

  // Parents mount this with key={perfume._id}, so lazy init is enough — no effect.
  const [selectedEdition, setSelectedEdition] = useState(() => editions[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(() => {
    const first = editions[0];
    return first ? first.variants.find((v) => v.stock > 0) || first.variants[0] : null;
  });
  const [added, setAdded] = useState(false);

  const disc = Number(perfume?.discountPercent) || 0;
  const finalOf = (price) => (disc > 0 ? Math.round(price * (1 - disc / 100)) : price);

  const brandLabel = Array.isArray(perfume.brands) && perfume.brands.length > 0
    ? perfume.brands.join(", ")
    : perfume.brand || "";
  const image = selectedVariant?.images?.main || perfume?.images?.main || null;
  const inStock = !!(selectedVariant && selectedVariant.stock > 0);
  const multiEdition = editions.length > 1;

  const handleEditionChange = (ed) => {
    setSelectedEdition(ed);
    setSelectedVariant(ed.variants.find((v) => v.stock > 0) || ed.variants[0] || null);
  };

  const handleAdd = () => {
    if (!selectedVariant || !inStock) return;
    addItem({
      perfumeId: perfume._id,
      slug: perfume.slug,
      name: perfume.name,
      image: image || "",
      edition: selectedEdition?.key || "",
      size: selectedVariant.size,
      price: finalOf(selectedVariant.price),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      {image && (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
          <Image src={image} alt={perfume.name} fill className="object-contain p-3" sizes="480px" />
        </div>
      )}

      {brandLabel && (
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Inspired by {brandLabel}</p>
      )}

      {perfume.impressionName && (
        <p className="text-sm text-gray-600 mb-3">
          Impression: <span className="font-semibold text-gray-800">{perfume.impressionName}</span>
        </p>
      )}

      {/* Edition */}
      {multiEdition && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Choose Edition</p>
          <div className="flex flex-wrap gap-2">
            {editions.map((ed) => {
              const min = ed.variants.reduce((m, v) => (v.price < m ? v.price : m), Infinity);
              return (
                <button
                  key={ed.key}
                  onClick={() => handleEditionChange(ed)}
                  className={`flex flex-col items-start px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                    selectedEdition?.key === ed.key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  <span className="font-bold">{ed.key}</span>
                  {min < Infinity && (
                    <span className={selectedEdition?.key === ed.key ? "text-gray-300" : "text-gray-500"}>
                      from Rs. {finalOf(min).toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size */}
      {selectedEdition && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Choose Size</p>
          <div className="flex flex-wrap gap-2">
            {selectedEdition.variants.map((v) => {
              const oos = v.stock <= 0;
              const isSel = selectedVariant?.size === v.size;
              return (
                <button
                  key={v.size}
                  disabled={oos}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                    isSel
                      ? "bg-black text-white border-black"
                      : oos
                      ? "border-gray-200 text-gray-300 bg-gray-50 line-through cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price */}
      {selectedVariant && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">PKR {finalOf(selectedVariant.price).toLocaleString()}</span>
          {disc > 0 && (
            <>
              <span className="text-sm text-gray-400 line-through">PKR {selectedVariant.price.toLocaleString()}</span>
              <span className="text-[11px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">-{disc}%</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          disabled={!inStock}
          onClick={handleAdd}
          className={`w-full py-3 rounded-lg font-semibold text-sm tracking-wide uppercase transition-colors ${
            inStock ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {added ? "Added to Cart ✓" : !selectedVariant ? "Select a Size" : !inStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <a
          href={`/products/${perfume.slug}`}
          onClick={onClose}
          className="w-full text-center border border-black text-black py-3 rounded-lg font-semibold text-sm hover:bg-black hover:text-white transition-colors"
        >
          View Full Details
        </a>
      </div>
    </div>
  );
}
