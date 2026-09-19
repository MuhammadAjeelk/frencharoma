"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Centre-of-page chooser shown when a perfume sells in more than one edition.
// Picking one adds it and hands over to AddedToCartPopup, so the panel swaps
// straight to the confirmation without an intermediate step.
export default function EditionChoiceModal({
  open,
  onClose,
  onChoose,
  name,
  image,
  editions = [],
  editionStyle = {},
  formatRs,
  finalOf,
  discountPercent = 0,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose an edition"
    >
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.28)] animate-fadeIn overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e4df]">
          <h2 className="text-base font-bold text-[#1a1a2e]">Choose Your Edition</h2>
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

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              {image ? <Image src={image} alt={name} fill className="object-cover" sizes="56px" /> : null}
            </div>
            <p className="text-sm font-bold text-[#1f1a16] leading-snug line-clamp-2">{name}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {editions.map((e) => {
              const st = editionStyle[e.key] || {};
              return (
                <button
                  key={e.key}
                  onClick={() => onChoose?.(e)}
                  className={`hover-vibrate w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left shadow-sm hover:shadow-md transition-shadow ${st.bar || "bg-[#efe9db]"} ${st.text || "text-[#1f1a16]"}`}
                >
                  <span className="text-[13px] font-bold leading-tight">
                    {st.label || e.key}
                    <span className="block text-[11px] font-medium opacity-80">{e.variant.size}</span>
                  </span>
                  <span className="text-[13px] font-bold flex items-center gap-2 whitespace-nowrap">
                    {discountPercent > 0 && (
                      <span className="strike-diagonal opacity-70 font-medium">
                        {formatRs(e.variant.price)}
                      </span>
                    )}
                    <span>{formatRs(finalOf(e.variant.price))}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
