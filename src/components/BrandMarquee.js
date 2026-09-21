"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// The brand pills — each has a white label (default) and a gold label (hover)
// in /public/icons/brands-labels/<slug>-dark.webp and <slug>-gold.webp.
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
  // { name: "Dunhill London", slug: "dunhill-london" },
  // { name: "Escada", slug: "escada" },
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
      href={`/collections/shop-all?search=${encodeURIComponent(brand.name)}&view=products`}
      className="group/box relative shrink-0 mx-1 sm:mx-2 md:mx-2.5 flex items-center justify-center h-[42px] w-[88px] sm:h-[64px] sm:w-[132px] md:h-[82px] md:w-[166px]"
      aria-label={brand.name}
    >
      <span className="relative block w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/brands-labels/${brand.slug}-dark.webp?v=11`}
          alt={brand.name}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover/box:opacity-0"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/brands-labels/${brand.slug}-gold.webp?v=11`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover/box:opacity-100 drop-shadow-[0_2px_8px_rgba(201,162,90,0.2)]"
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
    <div className="pt-10 md:pt-12 pb-12 md:pb-14 bg-[#d4c6ab] overflow-hidden">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-9 md:mb-12">
        <div className="relative">
        <div className="text-center">
          <div className="inline-block">
            <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#211d18]">
              Shop By Brand
            </h2>
            {/* rule spans the title only — solid in the middle, fading at the ends */}
            <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,#211d18_25%,#211d18_75%,transparent_100%)]" />
          </div>
          <p className="mt-5 text-[#7b6a55] font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug">
            Discover your favorite houses.
          </p>
        </div>

        <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
          <Link
            href="/collections/shop-all?view=brands"
            className="group/all inline-flex items-center gap-2.5 rounded-lg border border-[#2a2620]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[#2a2620] transition-colors hover:bg-[#2a2620] hover:text-[#d4c6ab]"
          >
            View All
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5"
              />
            </svg>
          </Link>
        </div>
        </div>
      </div>

      {/* Collage, with the brand slider riding across its lower third */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden">
          <Image
            src="/images/home/new/brand-collage-v2.webp"
            alt="Fragrance houses we carry"
            width={2000}
            height={1211}
            className="block w-full h-auto select-none"
            sizes="100vw"
          />

          <div
            className="group absolute inset-x-0 bottom-[6%] z-20"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Fixed dark patti behind the pills — gold line top & bottom, edge to edge */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[58px] sm:h-[86px] md:h-[106px] bg-black border-y-[3px] sm:border-y-[4px] md:border-y-[5px] border-[#c9a25a] shadow-[0_0_14px_rgba(201,162,90,0.22),inset_0_2px_10px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(201,162,90,0.12),transparent_60%)]" />
            </div>

            {/* Moving pills — clipped to the band (no edge shades) */}
            <div className="relative z-10 h-[58px] sm:h-[86px] md:h-[106px] flex items-center overflow-hidden">
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

            {/* Black end-caps — pills come and go behind them; the triangle arrow
            sits on each cap. One click = one pill. */}
            <button
              type="button"
              aria-label="Previous brand"
              onClick={() => step("prev")}
              className="group/cap absolute left-0 top-1/2 -translate-y-1/2 z-30 h-[58px] sm:h-[86px] md:h-[106px] w-8 sm:w-12 md:w-16 flex items-center justify-center border-y-[3px] sm:border-y-[4px] md:border-y-[5px] border-[#c9a25a] bg-[#373838]"
            >
              <svg
                className="w-5 h-8 sm:w-8 sm:h-12 md:w-11 md:h-16 fill-[#d1c0ab] group-hover/cap:fill-[#c9a25a] transition-colors duration-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M16 3 L6 12 L16 21 Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next brand"
              onClick={() => step("next")}
              className="group/cap absolute right-0 top-1/2 -translate-y-1/2 z-30 h-[58px] sm:h-[86px] md:h-[106px] w-8 sm:w-12 md:w-16 flex items-center justify-center border-y-[3px] sm:border-y-[4px] md:border-y-[5px] border-[#c9a25a] bg-[#373838]"
            >
              <svg
                className="w-5 h-8 sm:w-8 sm:h-12 md:w-11 md:h-16 fill-[#d1c0ab] group-hover/cap:fill-[#c9a25a] transition-colors duration-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 3 L18 12 L8 21 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
