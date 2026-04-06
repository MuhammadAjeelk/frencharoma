"use client";

import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link";

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  return (
    <div className="py-10 md:py-14 px-4 bg-white border-b border-[#f0ece7]">
      <div className="max-w-7xl mx-auto mb-8">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Inspired Collections
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight">
          SHOP BY BRAND
        </h2>
        <div className="mt-3 w-10 h-[2px] bg-[#b8964e] mx-auto" />
        <p className="text-[13px] text-center text-[#8a847e] mt-4 max-w-md mx-auto">
          Browse inspired-by brands. Click any brand to explore its collection.
        </p>
      </div>
      <Marquee pauseOnHover={true} speed={40} direction="left" autoFill={true} gradient={false} className="gap-4 md:gap-8">
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={`/collections/shop-all?search=${encodeURIComponent(brand)}`}
            className="shrink-0 mx-2 sm:mx-3 flex items-center justify-center h-12 sm:h-14 px-5 sm:px-7 rounded-lg border border-[#e8e4df] bg-white hover:border-[#b8964e] hover:shadow-[0_4px_16px_rgba(184,150,78,0.08)] transition-all duration-200 group"
          >
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#4a4540] group-hover:text-[#b8964e] whitespace-nowrap tracking-[0.06em] uppercase transition-colors">
              {brand}
            </span>
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
