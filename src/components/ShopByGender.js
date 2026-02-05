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
    <div className="py-8 md:py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8"
          style={{ color: "#1a1a2e" }}
        >
          SHOP BY GENDER
        </h2>

        {/* Gender Cards */}
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
