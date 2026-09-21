"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { genderMeta } from "@/lib/gender";
import OrderSummary from "./OrderSummary";
import { FOCUS_RING, FOCUS_RING_LIGHT } from "@/lib/design";

const EDITION_LABEL = {
  luxury: "Luxury Edition",
  premium: "Premium Edition",
  classic: "Classic Edition",
};
const rs = (n) => `Rs. ${Math.round(n || 0).toLocaleString()}`;

// Global confirmation popup shown after any perfume "Add to Cart" — on every
// page (Home, Shop All, Best Sellers, Quick View, Wishlist, Product page).
//
// It portals to <body>, so it inherits no section ground and carries its own:
// the warm light panel (#efe7db) under a dark gold-ruled header bar.
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
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={closeAdded}
      />

      <div className="relative z-10 w-full max-w-md bg-[#efe7db] border border-[#c9a25a] shadow-[0_24px_70px_rgba(0,0,0,0.45)] my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-[#373838] border-b-2 border-[#c9a25a] px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-[#8fd3a3]/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#8fd3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-base sm:text-lg font-normal text-[#c9a25a] truncate">
              Added to Cart
            </h2>
          </div>
          <button
            onClick={closeAdded}
            className={`shrink-0 p-1.5 rounded-full text-[#cbbfae] hover:text-[#211d18] hover:bg-[#c9a25a] transition-colors ${FOCUS_RING}`}
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
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#211d18]/15">
              <div className="relative w-14 h-14 overflow-hidden bg-[#dccfb7] border border-[#c9a25a]/60 shrink-0">
                {lastAdded.image ? (
                  <Image src={lastAdded.image} alt={lastAdded.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8d8375]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#211d18] leading-snug line-clamp-2">
                  {lastAdded.name}
                  {gm && <span className={`font-semibold ${gm.text}`}>{` – ${gm.label}`}</span>}
                </p>
                <p className="text-[11px] text-[#5c554b] mt-0.5">
                  {editionLabel}
                  {editionLabel && lastAdded.size ? " · " : ""}
                  {lastAdded.size}
                </p>
              </div>
              <span className="text-sm font-bold text-[#211d18] shrink-0">{rs(lastAdded.price)}</span>
            </div>
          )}

          {/* Order Summary */}
          <OrderSummary summary={summary} itemCount={itemCount} />

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Link
              href="/cart"
              onClick={closeAdded}
              className={`text-center border border-[#211d18]/70 text-[#211d18] py-2.5 font-semibold text-sm hover:bg-[#211d18] hover:text-[#efe7db] transition-colors ${FOCUS_RING_LIGHT}`}
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeAdded}
              className={`text-center border border-[#c9a25a] bg-[#c9a25a] text-[#211d18] py-2.5 font-semibold text-sm hover:bg-[#e3c489] hover:border-[#e3c489] transition-colors ${FOCUS_RING_LIGHT}`}
            >
              Checkout
            </Link>
          </div>
          <button
            onClick={closeAdded}
            className={`w-full mt-2.5 text-center text-sm font-semibold text-[#6f5518] hover:text-[#211d18] hover:underline underline-offset-4 py-1.5 transition-colors ${FOCUS_RING_LIGHT}`}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
