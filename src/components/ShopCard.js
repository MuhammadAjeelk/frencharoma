"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShopCard({ name, image, href }) {
  return (
    <Link
      href={href}
      className="group relative border-2 border-gray-300 rounded-lg overflow-hidden hover:border-gray-500 transition-all duration-300 hover:shadow-md w-full md:w-auto flex-1 max-w-sm"
    >
      <div className="relative w-full aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </Link>
  );
}
