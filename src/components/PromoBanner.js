"use client";

import Image from "next/image";
import Link from "next/link";

export default function PromoBanner({
  title,
  description,
  imageUrl,
  buttonText = "Shop Now",
  buttonLink = "/collections/shop-all",
}) {
  return (
    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:aspect-[21/9] overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover lg:object-contain object-center sm:object-left-center md:object-left lg:object-center z-0"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-start justify-center z-10 px-4 sm:px-6 md:px-12 lg:px-20 py-3 sm:py-0">
        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1.5 sm:mb-2 md:mb-4">
          <span className="text-white" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
            {title}
          </span>
        </h2>
        <div className="w-8 sm:w-10 h-[2px] bg-[#b8964e] mb-2 sm:mb-3 md:mb-5" />

        <p
          className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 font-medium max-w-[180px] sm:max-w-xs md:max-w-lg lg:max-w-2xl mb-2 sm:mb-4 md:mb-6 leading-snug sm:leading-normal"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          {description}
        </p>

        <Link
          href={buttonLink}
          className="bg-white text-[#1a1a2e] px-4 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:bg-[#1a1a2e] hover:text-white transition-all duration-300 shadow-lg text-[11px] sm:text-xs md:text-sm tracking-wide uppercase"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
