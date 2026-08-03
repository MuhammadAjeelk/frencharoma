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
    <section className="py-14 md:py-20 px-4 bg-gradient-to-b from-[#f3ede1] via-[#faf8f5] to-[#f3ede1] border-y border-[#e6dcc6]">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Choose Your Tier
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          SHOP BY COLLECTION
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-8 md:mb-10" />

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
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
