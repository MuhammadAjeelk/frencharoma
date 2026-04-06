"use client";

import PromoBanner from "./PromoBanner";

export default function SpecialOffers() {
  return (
    <div className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 mb-6 md:mb-8">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Limited Time
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight">
          SPECIAL OFFERS
        </h2>
        <div className="mt-3 w-10 h-[2px] bg-[#b8964e] mx-auto" />
      </div>
      <PromoBanner
        title="Special Offers"
        description="Get UPTO 50% Discount on limited Stock."
        imageUrl="https://www.linea-debella.com/cdn/shop/files/DIVE-INTO-LUXURY.jpg?v=1755525359&width=3000"
        buttonText="Shop Now"
        buttonLink="/collections/shop-all?specialOffer=true"
      />
    </div>
  );
}
