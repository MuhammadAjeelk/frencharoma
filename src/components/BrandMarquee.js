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
      price: "UNDER 99 AED",
      href: "/collections/divina",
    },
    {
      name: "ORCHID",
      image:
        "https://www.linea-debella.com/cdn/shop/files/O-LOGO.jpg?v=1760715795&width=750",
      price: "UNDER 79 AED",
      href: "/collections/orchid",
    },
  ];

  return (
    <div className="py-8 overflow-hidden relative">
      <Marquee
        pauseOnHover={true}
        speed={50}
        direction="left"
        autoFill={true}
        gradient={false}
        className="gap-8"
      >
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={brand.href}
            className="shrink-0 w-48 sm:w-64 h-32 relative mx-4 block cursor-pointer hover:opacity-80 transition-opacity"
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
