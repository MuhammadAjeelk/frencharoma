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
    <div className="py-8 md:py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8"
          style={{ color: "#1a1a2e" }}
        >
          SHOP BY CATEGORY
        </h2>

        {/* Category Cards */}
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
