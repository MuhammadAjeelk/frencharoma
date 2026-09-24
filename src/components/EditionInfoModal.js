"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatRs } from "@/lib/pricing";
import { FOCUS_RING } from "@/lib/design";

// Shared descriptions for the two editions (same page for both — we just
// scroll/highlight the one the user tapped).
//
// The accent/ring/bg trio is retuned for the warm light panel this modal now
// sits on: the old near-white fills disappeared against #efe7db.
const EDITION_INFO = {
  luxury: {
    label: "Luxury Edition",
    accent: "var(--fa-gold)",
    ring: "var(--fa-gold)",
    bg: "var(--fa-selected)",
    blurb:
      "Our richest interpretation — the highest oil concentration for maximum projection and the longest-lasting wear, presented in our premium flacon. Made for those who want their signature scent to truly command a room.",
  },
  premium: {
    label: "Premium Edition",
    accent: "var(--fa-secondary)",
    ring: "var(--fa-border)",
    bg: "var(--fa-premium)",
    blurb:
      "Everyday luxury — the same beloved scent profile with excellent longevity and elegant projection, offered at a friendlier price. The perfect balance of quality and value for daily wear.",
  },
  classic: {
    label: "Classic Edition",
    accent: "var(--fa-gold-ink)",
    ring: "var(--fa-border)",
    bg: "var(--fa-beige)",
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
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] flex flex-col bg-[var(--fa-cream)] border border-[var(--fa-gold)] shadow-[0_24px_70px_rgba(0,0,0,0.45)] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-3 bg-[var(--fa-dark)] border-b-2 border-[var(--fa-gold)] px-5 py-3">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-base sm:text-lg font-normal text-[var(--fa-gold)] min-w-0">
            Edition Details
          </h2>
          <button
            onClick={onClose}
            className={`shrink-0 p-1.5 rounded-full text-[var(--fa-on-dark)] hover:text-[var(--fa-ink)] hover:bg-[var(--fa-gold)] transition-colors ${FOCUS_RING}`}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
          {sellable.map((e) => {
            const info = EDITION_INFO[e.key] || EDITION_INFO.classic;
            const highlighted = e.key === focus;
            return (
              <div
                key={e.key}
                className="border p-4 transition-all"
                style={{
                  borderColor: highlighted ? info.accent : info.ring,
                  background: highlighted ? info.bg : "var(--fa-cream)",
                  boxShadow: highlighted ? `0 8px 24px color-mix(in srgb, ${info.accent} 20%, transparent)` : "none",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1.5">
                  <span className="inline-flex items-center gap-2 font-semibold text-[var(--fa-ink)]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: info.accent }} />
                    {info.label}
                    <span className="text-[11px] font-medium text-[var(--fa-secondary)]">({e.variant.size})</span>
                  </span>
                  <span className="text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                    {disc > 0 && (
                      <span className="strike-diagonal text-[var(--fa-secondary)] font-medium">
                        {formatRs(e.variant.price)}
                      </span>
                    )}
                    <span className="text-[var(--fa-ink)]">{formatRs(finalOf(e.variant.price))}</span>
                  </span>
                </div>
                <p className="text-[13px] text-[var(--fa-secondary)] leading-relaxed">{info.blurb}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
