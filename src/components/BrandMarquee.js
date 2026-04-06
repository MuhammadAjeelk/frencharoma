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
    <div className="py-8 md:py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8" style={{ color: "#1a1a2e" }}>
          SHOP BY BRAND
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6 -mt-4">
          Browse inspired-by brands. Click any brand to explore its collection.
        </p>
      </div>
      <Marquee pauseOnHover={true} speed={40} direction="left" autoFill={true} gradient={false} className="gap-4 md:gap-8">
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={`/collections/shop-all?search=${encodeURIComponent(brand)}`}
            className="shrink-0 mx-3 sm:mx-5 flex items-center justify-center h-16 sm:h-20 px-5 sm:px-8 rounded-lg border border-gray-200 bg-white hover:border-black hover:shadow-md transition-all duration-200 group"
          >
            <span className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-black whitespace-nowrap tracking-wide uppercase">
              {brand}
            </span>
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
