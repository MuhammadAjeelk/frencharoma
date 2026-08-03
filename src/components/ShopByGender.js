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
    <section className="py-14 md:py-20 px-4 bg-gradient-to-b from-white via-[#f1ece3] to-white">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Find Your Signature
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          SHOP BY GENDER
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-8 md:mb-10" />

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {genders.map((gender, index) => (
            <ShopCard
              key={index}
              name={gender.name}
              tagline={gender.tagline}
              image={gender.image}
              href={gender.href}
              hideDefaultName
            />
          ))}
        </div>

        {/* View All */}
        <div className="flex justify-center mt-10 md:mt-12">
          <Link
            href="/collections/shop-all"
            className="group inline-flex items-center gap-2 bg-[#1a1a2e] text-white px-8 md:px-10 py-3 rounded-lg shadow-sm hover:bg-[#b8964e] hover:shadow-lg hover:scale-[1.03] transition-all duration-200 font-semibold text-sm tracking-wide uppercase"
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
