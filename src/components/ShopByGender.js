"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShopByGender() {
  const genders = [
    {
      name: "Men",
      image:
        "https://www.linea-debella.com/cdn/shop/files/MEN-min.jpg?v=1753724171&width=750",
      href: "/collections/shop-all?gender=men",
    },
    {
      name: "Women",
      image:
        "https://www.linea-debella.com/cdn/shop/files/WOMEN-min.jpg?v=1753724179&width=750",
      href: "/collections/shop-all?gender=women",
    },
    {
      name: "Unisex",
      image:
        "https://www.linea-debella.com/cdn/shop/files/UNISEX-min.jpg?v=1753779949&width=750",
      href: "/collections/shop-all?gender=unisex",
    },
  ];

  return (
    <div className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-3"
          style={{ color: "#1a1a2e" }}
        >
          SHOP BY GENDER
        </h2>

        {/* Instructional Text */}

        {/* Gender Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 max-w-5xl mx-auto">
          {genders.map((gender, index) => (
            <Link
              key={index}
              href={gender.href}
              className="group relative border-2 border-gray-300 rounded-lg overflow-hidden hover:border-gray-500 transition-all duration-300 hover:shadow-md w-full md:w-auto flex-1 max-w-sm"
            >
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={gender.image}
                  alt={gender.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
