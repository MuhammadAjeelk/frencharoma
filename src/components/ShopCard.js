"use client";

import Image from "next/image";
import Link from "next/link";

// Shared card for Shop By Gender + Shop By Collection.
// Default: the name sits centered on the picture in a stylish serif, golden,
// with a short golden line (name-width) just beneath it.
// Hover: the picture zooms, the golden line sweeps to full width, and the
// tagline fades in just above the name — all in matching gold.
export default function ShopCard({ name, image, href, tagline }) {
  return (
    <Link
      href={href}
      className="group relative block w-full max-w-[300px] rounded-2xl overflow-hidden border border-[#e8e4df] hover:border-[#c9a25a]/60 shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition-all duration-500"
    >
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-[1.06] transition-transform duration-[700ms] ease-out"
          sizes="(max-width: 768px) 100vw, 300px"
        />

        {/* Permanent scrim so the centered gold text is always legible;
            deepens on hover. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25 group-hover:from-black/70 group-hover:via-black/35 transition-all duration-500" />

        {/* Centered label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {tagline && (
            <span className="mb-4 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-[#e8cf9f] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {tagline}
            </span>
          )}

          <span className="relative inline-block">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-wide text-[#e8cf9f] group-hover:text-[#f2dca8] transition-colors duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {name}
            </h3>
            {/* Golden line: exactly the name's width by default, sweeps to full
                card width on hover (clipped by the card's overflow-hidden). */}
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2.5 h-[2px] bg-[#c9a25a] w-full group-hover:w-[100vw] transition-all duration-[600ms] ease-out" />
          </span>
        </div>
      </div>
    </Link>
  );
}
