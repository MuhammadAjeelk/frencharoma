"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShopCard({ name, image, href, tagline, hideLabel = false }) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl overflow-hidden hover:shadow-[0_18px_50px_rgba(184,150,78,0.20)] transition-all duration-400 w-full md:w-auto flex-1 max-w-sm border border-[#e8e4df] hover:border-[#b8964e]"
    >
      <div className="relative w-full aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-[1.05] transition-transform duration-[600ms] ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!hideLabel && (
          <>
            {/* Base bottom gradient for the label */}
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />

            {tagline && (
              <>
                {/* Extra darken on hover so the tagline reads clearly */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                {/* Tagline revealed on the picture on hover */}
                <div className="absolute inset-0 flex items-center justify-center px-5 pointer-events-none">
                  <span className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out text-center text-[#f0d9a8] text-lg sm:text-xl font-semibold uppercase tracking-[0.16em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {tagline}
                  </span>
                </div>
              </>
            )}

            {/* Name + golden divider that spans the full width on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <div className="mb-2.5 h-[2px] w-6 bg-[#b8964e] transition-all duration-500 ease-out group-hover:w-full" />
              <h3 className="text-white group-hover:text-[#b8964e] text-sm sm:text-base font-semibold uppercase tracking-widest drop-shadow-lg transition-colors duration-300">
                {name}
              </h3>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
