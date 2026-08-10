"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// brand name -> logo file slug, e.g. "Dolce & Gabbana" -> "dolce-and-gabbana"
const slugify = (b) =>
  b
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Brands we ship a logo file for (public/icons/brands/<slug>.png). Only these
// appear in the marquee so every box is a real logo — no text-fallback boxes.
// Brands without a logo still show in the SHOP BY BRAND nav dropdown.
const LOGO_SLUGS = new Set([
  "ajmal", "azzaro", "burberry", "carolina-herrera", "chanel", "christian-dior",
  "creed", "davidoff", "dolce-and-gabbana", "ex-nihilo", "giorgio-armani",
  "givenchy", "gucci", "hermes", "issey-miyake", "jean-paul-gaultier", "kilian",
  "louis-vuitton", "maison-francis-kurkdjian", "maison-martin-margiela", "montale",
  "nasomatto", "nishane", "ormonde-jayne", "paco-rabbane", "parfums-de-marly",
  "thierry-mugler", "tom-ford", "victoria-s-secret", "viktor-and-rolf", "xerjoff",
  "yves-saint-laurent",
]);

// A single brand box: shows the logo (from /icons/brands/<slug>.png) with a
// text fallback, and lifts + turns golden on hover.
function BrandBox({ brand }) {
  const [noLogo, setNoLogo] = useState(false);
  const slug = slugify(brand);

  return (
    <Link
      href={`/collections/shop-all?search=${encodeURIComponent(brand)}`}
      className="group/box relative shrink-0 mx-2.5 sm:mx-3.5 my-3 flex items-center justify-center h-20 sm:h-24 w-36 sm:w-44 overflow-hidden rounded-2xl border border-[#e8e4df] bg-white/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#b8964e] hover:shadow-[0_14px_36px_rgba(184,150,78,0.18)] hover:bg-white"
    >
      {noLogo ? (
        <span className="px-3 text-center text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.06em] text-[#4a4540] group-hover/box:text-[#b8964e] transition-colors leading-tight line-clamp-2">
          {brand}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/icons/brands/${slug}.png`}
          alt={brand}
          onError={() => setNoLogo(true)}
          className="max-h-14 sm:max-h-16 max-w-[84%] w-auto object-contain grayscale opacity-80 transition-all duration-300 group-hover/box:grayscale-0 group-hover/box:opacity-100 group-hover/box:scale-[1.06]"
        />
      )}
    </Link>
  );
}

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);
  const [hovering, setHovering] = useState(false);

  // Custom marquee: a continuously-scrolling flex track driven by rAF, so an
  // arrow press can advance the track by exactly ONE logo box.
  const trackRef = useRef(null);
  const xRef = useRef(0);        // current translateX (px, ≤ 0)
  const halfRef = useRef(0);     // width of one full set of logos
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const hoverRef = useRef(false);
  const steppingRef = useRef(false);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => {});
  }, []);

  // Only brands we have a logo for — keeps every box a consistent logo card.
  const logoBrands = brands.filter((b) => LOGO_SLUGS.has(slugify(b)));
  // Duplicated so the track is twice as wide → seamless leftward loop.
  const loop = logoBrands.length ? [...logoBrands, ...logoBrands] : [];

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

  // Measure one set's width once the logos are laid out.
  useEffect(() => {
    if (!trackRef.current || loop.length === 0) return;
    halfRef.current = trackRef.current.scrollWidth / 2;
  }, [loop.length]);

  // Auto-scroll loop — advances only when not hovering and not mid-step.
  useEffect(() => {
    if (loop.length === 0) return;
    const SPEED = 55; // px per second
    const tick = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      const track = trackRef.current;
      if (track && !hoverRef.current && !steppingRef.current) {
        let x = xRef.current - SPEED * dt;
        const half = halfRef.current || 1;
        if (x <= -half) x += half;
        xRef.current = x;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop.length]);

  // Move exactly one logo box forward ("next") or backward ("prev").
  const step = useCallback((dir) => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    // Distance between two adjacent boxes = box width + gap (margins included).
    const stepW = track.children[1].offsetLeft - track.children[0].offsetLeft;
    steppingRef.current = true;
    const raw = xRef.current + (dir === "prev" ? stepW : -stepW);
    track.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
    track.style.transform = `translate3d(${raw}px,0,0)`;
    xRef.current = raw;
    window.setTimeout(() => {
      // Silently wrap back into range (one set width is visually identical).
      let x = xRef.current;
      const half = halfRef.current || 1;
      while (x <= -half) x += half;
      while (x > 0) x -= half;
      track.style.transition = "none";
      track.style.transform = `translate3d(${x}px,0,0)`;
      xRef.current = x;
      void track.offsetWidth; // force reflow so the next auto tick is smooth
      track.style.transition = "";
      lastRef.current = 0;
      steppingRef.current = false;
    }, 470);
  }, []);

  if (logoBrands.length === 0) return null;

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
          Discover fragrances inspired by the world&rsquo;s most iconic brands.
        </p>
      </div>

      {/* Slider */}
      <div
        className="group relative max-w-[1400px] mx-auto"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Fixed decorative patti behind the boxes */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[88px] sm:h-[104px] rounded-2xl bg-gradient-to-r from-[#f2ede3] via-white to-[#f2ede3] border-y border-[#e8dcc4]/60 overflow-hidden">
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
        <div className="relative z-10 py-3 overflow-hidden">
          <div
            ref={trackRef}
            className="flex w-max will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {loop.map((brand, index) => (
              <BrandBox key={`${brand}-${index}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Prev / Next arrows — appear on hover, one click = one logo box */}
        <button
          type="button"
          aria-label="Previous brand"
          onClick={() => step("prev")}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-[#e8e4df] shadow-md text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next brand"
          onClick={() => step("next")}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-[#e8e4df] shadow-md text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
