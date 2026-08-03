"use client";

import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link";

// brand name -> logo file slug, e.g. "Dolce & Gabbana" -> "dolce-and-gabbana"
const slugify = (b) =>
  b
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// A single brand box: shows the logo (from /uploads/brands/<slug>.png) with a
// text fallback, and reveals the brand name on hover.
function BrandBox({ brand }) {
  const [noLogo, setNoLogo] = useState(false);
  const slug = slugify(brand);

  return (
    <Link
      href={`/collections/shop-all?search=${encodeURIComponent(brand)}`}
      className="group/box relative shrink-0 mx-2.5 sm:mx-3.5 flex items-center justify-center h-16 sm:h-20 w-36 sm:w-44 rounded-2xl border border-[#e8e4df] bg-white/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#b8964e] hover:shadow-[0_14px_36px_rgba(184,150,78,0.18)] hover:bg-white"
    >
      {noLogo ? (
        <span className="px-3 text-center text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.06em] text-[#4a4540] group-hover/box:text-[#b8964e] transition-colors leading-tight line-clamp-2">
          {brand}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/uploads/brands/${slug}.png`}
          alt={brand}
          onError={() => setNoLogo(true)}
          className="max-h-10 sm:max-h-12 max-w-[74%] w-auto object-contain opacity-80 grayscale transition-all duration-300 group-hover/box:opacity-100 group-hover/box:grayscale-0 group-hover/box:scale-105"
        />
      )}

      {/* Brand name tooltip on hover */}
      <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-full bg-[#1a1a2e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 shadow-md transition-opacity duration-200 group-hover/box:opacity-100 z-30">
        {brand}
      </span>
    </Link>
  );
}

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);
  const [hovering, setHovering] = useState(false);
  const [nudge, setNudge] = useState(null); // "prev" | "next" | null

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  // Auto-scrolls left. On hover it pauses; press-and-hold an arrow to move
  // backward (◀ = scroll right) or forward (▶ = scroll left).
  const play = hovering ? nudge !== null : true;
  const direction = nudge === "prev" ? "right" : "left";

  const bandNames = [
    "BURBERRY",
    "GIORGIO ARMANI",
    "TOM FORD",
    "CREED",
    "DIOR",
    "AZZARO",
    "GUCCI",
    "HERMÈS",
  ];

  return (
    <div className="py-12 md:py-16 px-4 bg-gradient-to-b from-white via-[#faf8f5] to-white border-b border-[#f0ece7] overflow-hidden">
      {/* Heading */}
      <div className="max-w-7xl mx-auto mb-9 md:mb-12 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b8964e]/10 border border-[#b8964e]/30 text-[#b8964e] text-[10px] font-bold uppercase tracking-[0.22em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8964e] animate-pulse" />
          Inspired Collections
        </span>
        <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#1a1a2e] via-[#3a3550] to-[#1a1a2e] bg-clip-text text-transparent">
          SHOP BY BRAND
        </h2>
        <div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-gradient-to-r from-transparent via-[#b8964e] to-transparent" />
        <p className="text-[13px] text-[#8a847e] mt-4 max-w-md mx-auto">
          Browse inspired-by brands. Click any brand to explore its collection.
        </p>
      </div>

      {/* Slider */}
      <div
        className="group relative max-w-[1400px] mx-auto"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setNudge(null);
        }}
      >
        {/* Fixed decorative patti behind the boxes */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[68px] sm:h-[84px] rounded-2xl bg-gradient-to-r from-[#f2ede3] via-white to-[#f2ede3] border-y border-[#e8dcc4]/60 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-10 opacity-[0.05]">
            <span className="whitespace-nowrap text-3xl sm:text-5xl font-black uppercase tracking-[0.2em] text-[#1a1a2e]">
              {bandNames.join("   ·   ")}
            </span>
          </div>
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-20 bg-gradient-to-r from-[#faf8f5] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 z-20 bg-gradient-to-l from-[#faf8f5] to-transparent" />

        {/* Moving boxes */}
        <div className="relative z-10 py-3">
          <Marquee
            play={play}
            direction={direction}
            speed={55}
            autoFill
            pauseOnHover={false}
            gradient={false}
          >
            {brands.map((brand, index) => (
              <BrandBox key={`${brand}-${index}`} brand={brand} />
            ))}
          </Marquee>
        </div>

        {/* Prev / Next arrows — appear on hover, press & hold to scroll */}
        <button
          type="button"
          aria-label="Scroll brands backward"
          onMouseDown={() => setNudge("prev")}
          onMouseUp={() => setNudge(null)}
          onMouseLeave={() => setNudge(null)}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-[#e8e4df] shadow-md text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Scroll brands forward"
          onMouseDown={() => setNudge("next")}
          onMouseUp={() => setNudge(null)}
          onMouseLeave={() => setNudge(null)}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-[#e8e4df] shadow-md text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
