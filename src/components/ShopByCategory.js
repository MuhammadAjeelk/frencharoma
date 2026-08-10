"use client";

import Link from "next/link";
import ShopCard from "./ShopCard";

export default function ShopByCategory() {
  const categories = [
    {
      name: "Luxury Edition",
      tagline: "Maximum Performance",
      image: "/images/home/collection-luxury.webp",
      href: "/collections/shop-all?edition=luxury",
    },
    {
      name: "Premium Edition",
      tagline: "Everyday Excellence",
      image: "/images/home/collection-premium.webp",
      href: "/collections/shop-all?edition=premium",
    },
  ];

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-[#f7f3ea] border-y border-[#e6dcc6]">
      {/* Sophisticated, understated backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_0%,rgba(201,162,90,0.10),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Heading — same refined style as the other sections */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b8964e]/10 border border-[#b8964e]/30 text-[#b8964e] text-[10px] font-bold uppercase tracking-[0.22em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b8964e] animate-pulse" />
            Choose Your Tier
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#1a1a2e] via-[#3a3550] to-[#1a1a2e] bg-clip-text text-transparent">
            SHOP BY COLLECTION
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-gradient-to-r from-transparent via-[#b8964e] to-transparent" />
          <p className="text-[13px] md:text-sm text-[#8a847e] mt-4 max-w-lg mx-auto italic font-[family-name:var(--font-playfair)]">
            Crafted for every preference.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-6 md:gap-9">
          {categories.map((category, index) => (
            <ShopCard
              key={index}
              name={category.name}
              tagline={category.tagline}
              image={category.image}
              href={category.href}
            />
          ))}
        </div>

        {/* View All */}
        <div className="flex justify-center mt-11 md:mt-14">
          <Link
            href="/collections/shop-all"
            className="group inline-flex items-center gap-2 bg-[#1a1a2e] text-white px-9 md:px-11 py-3 rounded-lg shadow-sm hover:bg-[#2a2640] hover:shadow-lg hover:scale-[1.03] transition-all duration-200 font-semibold text-sm tracking-wide uppercase"
          >
            View All
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
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
