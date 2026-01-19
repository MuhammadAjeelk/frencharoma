"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import Link from "next/link";

export default function BrandMarquee() {
  const brands = [
    {
      name: "DIVINA PERFUMES",
      image:
        "https://www.linea-debella.com/cdn/shop/files/DIVINA-LOGO_5b9a00b1-9776-4399-998e-1636d99f93a8.jpg?v=1760715774&width=750",
      price: "UNDER 99 PKR",
      href: "/collections/divina",
    },
    {
      name: "ORCHID",
      image:
        "https://www.linea-debella.com/cdn/shop/files/O-LOGO.jpg?v=1760715795&width=750",
      price: "UNDER 79 PKR",
      href: "/collections/orchid",
    },
  ];

  return (
    <div className="py-6 md:py-8 overflow-hidden relative">
      <Marquee
        pauseOnHover={true}
        speed={50}
        direction="left"
        autoFill={true}
        gradient={false}
        className="gap-4 md:gap-8"
      >
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={brand.href}
            className="shrink-0 w-40 sm:w-48 md:w-64 h-24 sm:h-28 md:h-32 relative mx-2 sm:mx-4 block cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image
              src={brand.image}
              alt={brand.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 192px, 256px"
            />
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
