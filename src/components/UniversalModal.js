"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function UniversalModal({
  isOpen,
  onClose,
  heading,
  details,
  children,
  wide = false,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Keep the panel in the DOM through its slide-out so the exit animates too.
  const [render, setRender] = useState(false); // present in the DOM
  const [shown, setShown] = useState(false);   // slid into view (translateX 0)

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      // Double rAF: mount at translateX(100%), then flip to 0 so it slides in.
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setRender(false), 300); // matches duration-300
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!render || !mounted) return null;

  // Portal to <body> so the fixed overlay isn't clipped/offset by an ancestor
  // with a CSS transform (e.g. the Best Sellers carousel track).
  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full bg-white z-[70] shadow-[−20px_0_60px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          wide ? "sm:w-[480px] md:w-[520px] lg:w-[560px]" : "sm:w-[420px] md:w-[500px]"
        }`}
        style={{
          transform: shown ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e8e4df] px-4 sm:px-5 py-1.5 flex items-center justify-between z-30">
          <h2 className="text-[15px] sm:text-base font-bold text-[#1a1a2e] leading-tight pr-2">{heading}</h2>
          <button
            onClick={onClose}
            className="group/close shrink-0 p-1.5 rounded-full text-[#6b6560] hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all duration-200"
            aria-label="Close modal"
          >
            <svg
              className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {details && (
            <div className="mb-6">
              <div className="prose prose-sm max-w-none">
                <div className="text-[14px] text-[#4a4540] whitespace-pre-line leading-relaxed">
                  {details}
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
