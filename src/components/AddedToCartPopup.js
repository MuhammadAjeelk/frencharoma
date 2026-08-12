"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { genderMeta } from "@/lib/gender";
import OrderSummary from "./OrderSummary";

const EDITION_LABEL = {
  luxury: "Luxury Edition",
  premium: "Premium Edition",
  classic: "Classic Edition",
};
const rs = (n) => `Rs. ${Math.round(n || 0).toLocaleString()}`;

// Global confirmation popup shown after any perfume "Add to Cart" — on every
// page (Home, Shop All, Best Sellers, Quick View, Wishlist, Product page).
export default function AddedToCartPopup() {
  const { addedOpen, closeAdded, lastAdded, summary, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = addedOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [addedOpen]);

  if (!mounted || !addedOpen) return null;

  const gm = lastAdded ? genderMeta(lastAdded.gender) : null;
  const editionLabel = lastAdded ? EDITION_LABEL[lastAdded.edition] || "" : "";

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={closeAdded}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.28)] my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e4df]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h2 className="text-base font-bold text-[#1a1a2e]">Added to Cart</h2>
          </div>
          <button
            onClick={closeAdded}
            className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
          {/* Added item mini-row */}
          {lastAdded && (
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                {lastAdded.image ? (
                  <Image src={lastAdded.image} alt={lastAdded.name} fill className="object-cover" sizes="56px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1f1a16] leading-snug line-clamp-1">
                  {lastAdded.name}
                  {gm && <span className={`font-semibold ${gm.text}`}>{` – ${gm.label}`}</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {editionLabel}
                  {editionLabel && lastAdded.size ? " · " : ""}
                  {lastAdded.size}
                </p>
              </div>
              <span className="text-sm font-bold text-[#1f1a16] shrink-0">{rs(lastAdded.price)}</span>
            </div>
          )}

          {/* Order Summary */}
          <OrderSummary summary={summary} itemCount={itemCount} />

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Link
              href="/cart"
              onClick={closeAdded}
              className="text-center border-2 border-[#1a1a2e] text-[#1a1a2e] py-2.5 rounded-lg font-bold text-sm hover:bg-[#1a1a2e] hover:text-white transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeAdded}
              className="text-center bg-[#2f2a6b] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#241f55] transition-colors"
            >
              Checkout
            </Link>
          </div>
          <button
            onClick={closeAdded}
            className="w-full mt-2.5 text-center text-sm font-semibold text-[#b8964e] hover:underline underline-offset-4 py-1.5"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
