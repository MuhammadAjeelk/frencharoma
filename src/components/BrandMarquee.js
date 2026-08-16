"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// The brand pills — each has a white label (default) and a gold label (hover)
// in /public/icons/brands-labels/<slug>.png and <slug>-gold.png.
const BRANDS = [
  { name: "Ajmal", slug: "ajmal" },
  { name: "Azzaro", slug: "azzaro" },
  { name: "Burberry", slug: "burberry" },
  { name: "Bvlgari", slug: "bvlgari" },
  { name: "Carolina Herrera", slug: "carolina-herrera" },
  { name: "Chanel", slug: "chanel" },
  { name: "Christian Dior", slug: "christian-dior" },
  { name: "Creed", slug: "creed" },
  { name: "Davidoff", slug: "davidoff" },
  { name: "Dolce & Gabbana", slug: "dolce-and-gabbana" },
  { name: "Dunhill London", slug: "dunhill-london" },
  { name: "Escada", slug: "escada" },
  { name: "Ex Nihilo", slug: "ex-nihilo" },
  { name: "French Aromas", slug: "french-aromas" },
  { name: "Giardini di Toscana", slug: "giardini-di-toscana" },
  { name: "Giorgio Armani", slug: "giorgio-armani" },
  { name: "Givenchy", slug: "givenchy" },
  { name: "Gucci", slug: "gucci" },
  { name: "Hermes", slug: "hermes" },
  { name: "Issey Miyake", slug: "issey-miyake" },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier" },
  { name: "Kilian", slug: "kilian" },
  { name: "Lattafa", slug: "lattafa" },
  { name: "Louis Vuitton", slug: "louis-vuitton" },
  { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian" },
  { name: "Maison Margiela", slug: "maison-margiela" },
  { name: "Marc Antoine Barrois", slug: "marc-antoine-barrois" },
  { name: "Montale", slug: "montale" },
  { name: "Nasomatto", slug: "nasomatto" },
  { name: "Nishane", slug: "nishane" },
  { name: "Ormonde Jayne", slug: "ormonde-jayne" },
  { name: "Paco Rabanne", slug: "paco-rabanne" },
  { name: "Parfums de Marly", slug: "parfums-de-marly" },
  { name: "Rasasi", slug: "rasasi" },
  { name: "Roja Dove", slug: "roja-dove" },
  { name: "Thierry Mugler", slug: "thierry-mugler" },
  { name: "Tom Ford", slug: "tom-ford" },
  { name: "Victoria's Secret", slug: "victoria-s-secret" },
  { name: "Viktor & Rolf", slug: "viktor-and-rolf" },
  { name: "Xerjoff", slug: "xerjoff" },
  { name: "Yves Saint Laurent", slug: "yves-saint-laurent" },
];

// One brand pill: white label by default, crossfades to the gold label + lifts
// with a very small wiggle on hover.
function BrandBox({ brand }) {
  return (
    <Link
      href={`/collections/shop-all?search=${encodeURIComponent(brand.name)}`}
      className="group/box relative shrink-0 mx-2 sm:mx-2.5 flex items-center justify-center h-[96px] w-[188px] sm:h-[112px] sm:w-[220px]"
      aria-label={brand.name}
    >
      <span className="relative block w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/brands-labels/${brand.slug}.png`}
          alt={brand.name}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover/box:opacity-0"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/brands-labels/${brand.slug}-gold.png`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover/box:opacity-100 drop-shadow-[0_10px_24px_rgba(201,162,90,0.45)]"
        />
      </span>
    </Link>
  );
}

export default function BrandMarquee() {
  const [hovering, setHovering] = useState(false);

  // Custom marquee: a continuously-scrolling flex track driven by rAF so an
  // arrow press advances by exactly ONE logo pill.
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const halfRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const hoverRef = useRef(false);
  const steppingRef = useRef(false);

  const loop = [...BRANDS, ...BRANDS];

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    if (!trackRef.current) return;
    halfRef.current = trackRef.current.scrollWidth / 2;
  }, []);

  useEffect(() => {
    const SPEED = 68; // px per second (a little faster per the spec)
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
  }, []);

  // Move exactly one pill forward ("next") or backward ("prev").
  const step = useCallback((dir) => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    const stepW = track.children[1].offsetLeft - track.children[0].offsetLeft;
    steppingRef.current = true;
    const raw = xRef.current + (dir === "prev" ? stepW : -stepW);
    track.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
    track.style.transform = `translate3d(${raw}px,0,0)`;
    xRef.current = raw;
    window.setTimeout(() => {
      let x = xRef.current;
      const half = halfRef.current || 1;
      while (x <= -half) x += half;
      while (x > 0) x -= half;
      track.style.transition = "none";
      track.style.transform = `translate3d(${x}px,0,0)`;
      xRef.current = x;
      void track.offsetWidth;
      track.style.transition = "";
      lastRef.current = 0;
      steppingRef.current = false;
    }, 470);
  }, []);

  return (
    <div className="py-12 md:py-16 bg-gradient-to-b from-white via-[#faf8f5] to-white border-b border-[#f0ece7] overflow-hidden">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-4 mb-9 md:mb-12 text-center">
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

      {/* Slider — full-bleed edge to edge */}
      <div
        className="group relative w-full"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Fixed dark patti behind the pills — gold line top & bottom, edge to edge */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[104px] sm:h-[120px] bg-gradient-to-r from-[#17161d] via-[#232230] to-[#17161d] border-y-2 border-[#c9a25a] shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(201,162,90,0.12),transparent_60%)]" />
        </div>

        {/* Moving pills — clipped to the band (no edge shades) */}
        <div className="relative z-10 h-[104px] sm:h-[120px] flex items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex w-max will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            {loop.map((brand, index) => (
              <BrandBox key={`${brand.slug}-${index}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Prev / Next arrows — appear on hover, one click = one pill */}
        <button
          type="button"
          aria-label="Previous brand"
          onClick={() => step("prev")}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#e8e4df] shadow-lg text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next brand"
          onClick={() => step("next")}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#e8e4df] shadow-lg text-[#4a4540] opacity-0 group-hover:opacity-100 hover:border-[#b8964e] hover:text-[#b8964e] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
