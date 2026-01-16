"use client";

import PromoBanner from "./PromoBanner";

export default function Discovery() {
  return (
    <div className="py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 mb-4 md:mb-6">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center"
          style={{ color: "#1a1a2e" }}
        >
          DISCOVERY BOX
        </h2>
      </div>
      <PromoBanner
        title="Discovery Box"
        description="Buy any 5 tester Perfumes of your choice on 25% discount."
        imageUrl="https://www.linea-debella.com/cdn/shop/files/DIVE-INTO-LUXURY.jpg?v=1755525359&width=3000"
        buttonText="Shop Now"
        buttonLink="/collections/shop-all"
      />
    </div>
  );
}
