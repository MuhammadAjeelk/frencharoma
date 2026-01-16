"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({
  name,
  brand,
  image,
  originalPrice,
  salePrice,
  href,
  hasSale = false,
  rating = 0,
}) {
  return (
    <div className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
      {/* Sale Badge */}
      {hasSale && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Sale
        </div>
      )}

      {/* Product Image */}
      <Link href={href || "#"} className="block relative w-full aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        {/* Product Name */}
        <Link href={href || "#"}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-gray-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Brand */}
        <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">
          {brand}
        </p>

        {/* Rating - Always show */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                i < rating ? "fill-black" : "fill-none stroke-black"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
          <span className="text-[10px] sm:text-xs text-gray-600 ml-0.5 sm:ml-1">
            ({rating})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {hasSale && originalPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              AED {originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm sm:text-base font-bold text-gray-900">
            AED {salePrice.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full border border-black text-black py-1.5 sm:py-2 px-3 sm:px-4 rounded hover:bg-black hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium">
          Add to cart
        </button>
      </div>
    </div>
  );
}
