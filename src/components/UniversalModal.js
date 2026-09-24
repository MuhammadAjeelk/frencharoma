"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FOCUS_RING } from "@/lib/design";

export default function UniversalModal({
  isOpen,
  onClose,
  heading,
  details,
  children,
  wide = false,
  artwork,
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
  //
  // The panel is the warm light ground (#efe7db) rather than one of the two
  // section grounds on purpose: its children come from four different callers
  // (Quick View, the product page's side panels, the Discovery Box prompt and
  // Why Choose Us), and those outside this phase still draw dark type. A light
  // panel keeps every one of them legible while moving the shell onto the
  // palette. Their own phases can take the content the rest of the way.
  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/55 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full bg-[var(--fa-cream)] border-l border-[var(--fa-gold)] z-[70] shadow-[-20px_0_60px_rgba(0,0,0,0.35)] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          wide ? "sm:w-[480px] md:w-[520px] lg:w-[560px]" : "sm:w-[420px] md:w-[500px]"
        }`}
        style={{
          transform: shown ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {artwork ? (
          <div className="relative">
            <Image
              src={artwork}
              alt={heading}
              width={1094}
              height={1437}
              sizes="(min-width: 768px) 500px, (min-width: 640px) 420px, 100vw"
              className="block w-full h-auto"
              priority
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={`group/close absolute left-[95.8%] top-[3.43%] -translate-x-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full cursor-pointer ${FOCUS_RING}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fa-cream)] text-red-600 opacity-0 transition-opacity duration-150 group-hover/close:opacity-100 group-focus-visible/close:opacity-100">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-[var(--fa-dark)] border-b-2 border-[var(--fa-gold)] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 z-30">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-base sm:text-lg font-normal text-[var(--fa-gold)] leading-tight min-w-0">
                {heading}
              </h2>
              <button
                onClick={onClose}
                className={`group/close shrink-0 p-1.5 rounded-full text-[var(--fa-on-dark)] hover:text-[var(--fa-ink)] hover:bg-[var(--fa-gold)] active:scale-90 transition-all duration-200 ${FOCUS_RING}`}
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

            <div className="p-5 sm:p-6">
              {details && (
                <div className="mb-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="text-[14px] text-[var(--fa-secondary)] whitespace-pre-line leading-relaxed">
                      {details}
                    </div>
                  </div>
                </div>
              )}
              {children}
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}
