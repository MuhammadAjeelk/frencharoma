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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Portal to <body> so the fixed overlay isn't clipped/offset by an ancestor
  // with a CSS transform (e.g. the Best Sellers carousel track).
  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full bg-white z-50 shadow-[−20px_0_60px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          wide ? "sm:w-[480px] md:w-[520px] lg:w-[560px]" : "sm:w-[420px] md:w-[500px]"
        }`}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e8e4df] px-5 py-2.5 flex items-center justify-between z-30">
          <h2 className="text-base font-bold text-[#1a1a2e] leading-tight pr-2">{heading}</h2>
          <button
            onClick={onClose}
            className="group/close p-2 rounded-lg text-[#6b6560] hover:text-red-500 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-[18px] h-[18px]"
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
