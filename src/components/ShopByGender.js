"use client";

import Link from "next/link";
import ShopCard from "./ShopCard";

export default function ShopByGender() {
  const genders = [
    {
      name: "Men",
      tagline: "Bold & Refined",
      image: "/images/home/gender-men.webp",
      href: "/collections/shop-all?gender=men",
    },
    {
      name: "Women",
      tagline: "Elegant & Timeless",
      image: "/images/home/gender-women.webp",
      href: "/collections/shop-all?gender=women",
    },
    {
      name: "Unisex",
      tagline: "Beyond Boundaries",
      image: "/images/home/gender-unisex.webp",
      href: "/collections/shop-all?gender=unisex",
    },
  ];

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-[#141118]">
      {/* Sophisticated background — sets the section apart from the page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(201,162,90,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_120%,rgba(201,162,90,0.10),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Heading — styled like Shop By Brand, tuned for the dark backdrop */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c9a25a]/15 border border-[#c9a25a]/40 text-[#e8cf9f] text-[10px] font-bold uppercase tracking-[0.22em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a25a] animate-pulse" />
            Find Your Signature
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f2dca8] to-white bg-clip-text text-transparent">
            SHOP BY GENDER
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-gradient-to-r from-transparent via-[#c9a25a] to-transparent" />
          <p className="text-[13px] md:text-sm text-[#b8b2ad] mt-4 max-w-lg mx-auto italic font-[family-name:var(--font-playfair)]">
            Every fragrance tells a story — find the one that reflects yours.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-5 md:gap-7">
          {genders.map((gender, index) => (
            <ShopCard
              key={index}
              name={gender.name}
              tagline={gender.tagline}
              image={gender.image}
              href={gender.href}
            />
          ))}
        </div>

        {/* View All — deliberately not golden; a clean invert-fill on hover */}
        <div className="flex justify-center mt-11 md:mt-14">
          <Link
            href="/collections/shop-all"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-white/35 px-9 md:px-11 py-3 text-white font-semibold text-sm tracking-wide uppercase transition-colors duration-300 hover:text-[#141118]"
          >
            <span className="absolute inset-0 -z-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">View All</span>
            <svg
              className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
