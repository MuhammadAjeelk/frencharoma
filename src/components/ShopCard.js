"use client";

import Image from "next/image";
import Link from "next/link";

// Shared card for Shop By Gender + Shop By Collection.
// The name sits in the bottom-left corner (stylish serif, gold). Beneath it a
// short gold line; on hover the picture zooms, the line draws left→right across
// the full card, and the tagline fades in centered on the line.
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

        {/* Permanent scrim so the gold text is always legible; deepens on hover. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20 group-hover:from-black/72 group-hover:via-black/30 transition-all duration-500" />

        {/* Name (bottom-left) + divider line with centered tagline */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-left">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-wide text-[#e8cf9f] group-hover:text-[#f2dca8] transition-colors duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            {name}
          </h3>

          {/* Line grows from the left; tagline sits centered on the line */}
          <div className="relative mt-2.5 h-4">
            <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#c9a25a] w-9 group-hover:w-full transition-[width] duration-[650ms] ease-out" />
            {tagline && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded bg-black/45 backdrop-blur-[2px] text-[#f0d9a8] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                {tagline}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
