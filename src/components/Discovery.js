"use client";

import PromoBanner from "./PromoBanner";

export default function Discovery() {
  return (
    <div className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 mb-6 md:mb-8">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Explore & Sample
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight">
          DISCOVERY BOX
        </h2>
        <div className="mt-3 w-10 h-[2px] bg-[#b8964e] mx-auto" />
      </div>
      <PromoBanner
        title="Discovery Box"
        description="Buy any 5 tester Perfumes of your choice on 25% discount."
        imageUrl="https://www.linea-debella.com/cdn/shop/files/DIVE-INTO-LUXURY.jpg?v=1755525359&width=3000"
        buttonText="Build Your Box"
        buttonLink="/collections/discovery-box"
      />
    </div>
  );
}
