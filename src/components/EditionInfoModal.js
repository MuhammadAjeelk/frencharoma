"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatRs } from "@/lib/pricing";

// Shared descriptions for the two editions (same page for both — we just
// scroll/highlight the one the user tapped).
const EDITION_INFO = {
  luxury: {
    label: "Luxury Edition",
    accent: "#c9a24a",
    ring: "#e8dcbf",
    bg: "#fbf5e7",
    blurb:
      "Our richest interpretation — the highest oil concentration for maximum projection and the longest-lasting wear, presented in our premium flacon. Made for those who want their signature scent to truly command a room.",
  },
  premium: {
    label: "Premium Edition",
    accent: "#8a8a92",
    ring: "#dedee3",
    bg: "#f5f5f7",
    blurb:
      "Everyday luxury — the same beloved scent profile with excellent longevity and elegant projection, offered at a friendlier price. The perfect balance of quality and value for daily wear.",
  },
  classic: {
    label: "Classic Edition",
    accent: "#b09a6e",
    ring: "#e4dcc9",
    bg: "#f7f2e7",
    blurb:
      "A refined, well-rounded expression of the fragrance — dependable performance and timeless character.",
  },
};

// `sellable`: [{ key, variant }]  `disc`: discount %  `focus`: edition key to highlight
export default function EditionInfoModal({ open, onClose, sellable = [], disc = 0, focus }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;
  const finalOf = (p) => (disc > 0 ? Math.round(p * (1 - disc / 100)) : p);

  return createPortal(
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.28)] animate-fadeIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e4df]">
          <h2 className="text-base font-bold text-[#1a1a2e]">Edition Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {sellable.map((e) => {
            const info = EDITION_INFO[e.key] || EDITION_INFO.classic;
            const highlighted = e.key === focus;
            return (
              <div
                key={e.key}
                className="rounded-xl border p-4 transition-all"
                style={{
                  borderColor: highlighted ? info.accent : info.ring,
                  background: highlighted ? info.bg : "#fff",
                  boxShadow: highlighted ? `0 8px 24px ${info.accent}22` : "none",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="inline-flex items-center gap-2 font-bold text-[#1f1a16]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: info.accent }} />
                    {info.label}
                    <span className="text-[11px] font-medium text-[#8a847e]">({e.variant.size})</span>
                  </span>
                  <span className="text-sm font-bold flex items-center gap-2">
                    {disc > 0 && (
                      <span className="strike-diagonal text-[#a09890] font-medium">
                        {formatRs(e.variant.price)}
                      </span>
                    )}
                    <span className="text-[#1f1a16]">{formatRs(finalOf(e.variant.price))}</span>
                  </span>
                </div>
                <p className="text-[13px] text-[#4a4540] leading-relaxed">{info.blurb}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
