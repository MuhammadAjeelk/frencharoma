"use client";

import ShopCard from "./ShopCard";

export default function ShopByGender() {
  const genders = [
    {
      name: "Men",
      image:
        "https://frencharoma.sparksgate.com/uploads/perfumes/1770289762669-aokoen.png",
      href: "/collections/shop-all?gender=men",
    },
    {
      name: "Women",
      image:
        "https://frencharoma.sparksgate.com/uploads/perfumes/1770294420203-294t77.png",
      href: "/collections/shop-all?gender=women",
    },
    {
      name: "Unisex",
      image:
        "https://frencharoma.sparksgate.com/uploads/perfumes/1770294414215-qush9i.png",
      href: "/collections/shop-all?gender=unisex",
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Find Your Signature
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          SHOP BY GENDER
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-8 md:mb-10" />

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {genders.map((gender, index) => (
            <ShopCard
              key={index}
              name={gender.name}
              image={gender.image}
              href={gender.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
