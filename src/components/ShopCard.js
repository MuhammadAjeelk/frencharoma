"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShopCard({ name, image, href }) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-400 w-full md:w-auto flex-1 max-w-sm border border-[#e8e4df]"
    >
      <div className="relative w-full aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h3 className="text-white text-sm sm:text-base font-semibold uppercase tracking-widest drop-shadow-lg">
            {name}
          </h3>
          <div className="mt-1.5 w-6 h-[2px] bg-[#b8964e] group-hover:w-10 transition-all duration-300" />
        </div>
      </div>
    </Link>
  );
}
