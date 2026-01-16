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
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover lg:object-contain object-center sm:object-left-center md:object-left lg:object-center z-0"
        sizes="100vw"
        priority
      />

      {/* Text Overlay - Left Aligned */}
      <div className="absolute inset-0 flex flex-col items-start justify-center z-10 px-3 sm:px-4 md:px-12 lg:px-20 py-3 sm:py-0">
        {/* Title */}
        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 drop-shadow-lg">
          <span
            className="text-white underline"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
          >
            {title}
          </span>
        </h2>

        {/* Description */}
        <p
          className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white font-medium max-w-[180px] sm:max-w-xs md:max-w-lg lg:max-w-2xl mb-1.5 sm:mb-3 md:mb-6 drop-shadow-lg leading-tight sm:leading-normal"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
        >
          {description}
        </p>

        {/* Shop Now Button */}
        <Link
          href={buttonLink}
          className="bg-black text-white px-3 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg text-xs sm:text-sm md:text-base"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
