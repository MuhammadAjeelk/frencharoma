"use client";

import ShopCard from "./ShopCard";

export default function ShopByCategory() {
  const categories = [
    {
      name: "Luxury Edition",
      image:
        "https://www.linea-debella.com/cdn/shop/files/MEN-min.jpg?v=1753724171&width=750",
      href: "/collections/shop-all?category=luxury-edition",
    },
    {
      name: "Premium Edition",
      image:
        "https://www.linea-debella.com/cdn/shop/files/WOMEN-min.jpg?v=1753724179&width=750",
      href: "/collections/shop-all?category=premium-edition",
    },
    {
      name: "Classic Edition",
      image:
        "https://www.linea-debella.com/cdn/shop/files/UNISEX-min.jpg?v=1753779949&width=750",
      href: "/collections/shop-all?category=classic-edition",
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Choose Your Tier
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          SHOP BY CATEGORY
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-8 md:mb-10" />

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <ShopCard
              key={index}
              name={category.name}
              image={category.image}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
