"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Staging preview of the bundle-offer artwork as a centred pop-up. It opens on
// every homepage load so the design can be judged on the live layout;
// reloading the page shows it again. Not wired to the cart — the
// buttons in the artwork are part of the image.

const ART = [
  { src: "/images/home/bundle-modal-savings-v1.webp", width: 2200, height: 1476, alt: "Bundle Savings Activated" },
  { src: "/images/home/bundle-modal-offer-v1.webp", width: 2200, height: 1467, alt: "Bundle Offer — more you buy, more you save" },
];

export default function BundleOfferModal() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Opened after mount so the static page renders without it.
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % ART.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + ART.length) % ART.length);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const art = ART[index];
  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full hidden sm:flex items-center justify-center text-2xl leading-none pb-0.5 bg-[var(--fa-dark)]/85 text-[var(--fa-gold)] border border-[var(--fa-gold)]/60 hover:bg-[var(--fa-dark)] transition-colors";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={art.alt}
          onClick={() => setOpen(false)}
        >
          {/* Width capped by the viewport height too, so the whole artwork
              always fits on screen without scrolling. */}
          <div
            className="relative w-full"
            style={{ maxWidth: `min(1100px, calc((100dvh - 7rem) * ${art.width / art.height}))` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border border-[var(--fa-gold)]/70 p-1 bg-[var(--fa-dark)] shadow-2xl">
              <Image
                key={art.src}
                src={art.src}
                width={art.width}
                height={art.height}
                alt={art.alt}
                sizes="(max-width: 1140px) 100vw, 1100px"
                priority
                className="block w-full h-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--fa-dark)] text-[var(--fa-gold)] border border-[var(--fa-gold)] hover:brightness-110 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {ART.length > 1 && (
              <>
                <button type="button" aria-label="Previous design" className={`${arrow} -left-5`} onClick={() => setIndex((i) => (i - 1 + ART.length) % ART.length)}>
                  ‹
                </button>
                <button type="button" aria-label="Next design" className={`${arrow} -right-5`} onClick={() => setIndex((i) => (i + 1) % ART.length)}>
                  ›
                </button>
                <div className="absolute -bottom-7 inset-x-0 flex justify-center gap-2">
                  {ART.map((a, i) => (
                    <button
                      key={a.src}
                      type="button"
                      aria-label={`Show ${a.alt}`}
                      onClick={() => setIndex(i)}
                      className={`w-3 h-3 rounded-full border border-[var(--fa-gold)] ${i === index ? "bg-[var(--fa-gold)]" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
