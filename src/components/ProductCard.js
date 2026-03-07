"use client";

import Image from "next/image";
import Link from "next/link";

const SEASON_LABELS = {
  "spring-summer": "Spring & Summer",
  "autumn-winter": "Autumn & Winter",
  "spring":        "Spring",
  "summer":        "Summer",
  "autumn":        "Autumn",
  "winter":        "Winter",
  "all-seasons":   "All Seasons",
};

export default function ProductCard({
  name,
  brand,
  image,
  originalPrice,
  salePrice,
  href,
  hasSale = false,
  discountPercent = 0,
  isSpecialOffer = false,
  tags = [],
  rating = 0,
  onQuickView,
}) {
  const brandLabel  = Array.isArray(brand) ? brand.join(", ") : brand;
  const seasonTags  = (tags || []).filter((t) => SEASON_LABELS[t]);

  // Compute effective display prices
  const hasDiscount   = discountPercent > 0 && salePrice > 0;
  const discountedMin = hasDiscount ? Math.round(salePrice * (1 - discountPercent / 100)) : salePrice;
  const discountedMax = hasDiscount && originalPrice
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;

  return (
    <div className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          -{discountPercent}% OFF
        </div>
      )}
      {/* Multiple editions badge */}
      {!hasDiscount && hasSale && originalPrice && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-[#1a1a2e] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Multiple Editions
        </div>
      )}
      {/* Special offer badge */}
      {isSpecialOffer && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Special Offer
        </div>
      )}

      {/* Product Image */}
      <Link href={href || "#"} className="block relative w-full aspect-[6.818/7.5] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Product Name */}
        <Link href={href || "#"}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-gray-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Brand */}
        {brandLabel && (
          <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">
            {brandLabel}
          </p>
        )}

        {/* Season Tags */}
        {seasonTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
            {seasonTags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide"
              >
                {SEASON_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

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
        <div className="flex flex-col gap-0.5 mb-2 sm:mb-3">
          {hasDiscount ? (
            <>
              {/* Discounted price */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  PKR {discountedMin.toLocaleString()}
                  {hasSale && discountedMax && discountedMax !== discountedMin && (
                    <> – PKR {discountedMax.toLocaleString()}</>
                  )}
                </span>
                <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              </div>
              {/* Original crossed-out price */}
              <span className="text-xs text-gray-400 line-through">
                PKR {salePrice.toLocaleString()}
                {hasSale && originalPrice && originalPrice !== salePrice && (
                  <> – PKR {originalPrice.toLocaleString()}</>
                )}
              </span>
            </>
          ) : hasSale && originalPrice ? (
            <span className="text-sm sm:text-base font-bold text-gray-900">
              PKR {salePrice.toLocaleString()}{" "}
              <span className="font-normal text-gray-400 text-xs sm:text-sm">–</span>{" "}
              PKR {originalPrice.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm sm:text-base font-bold text-gray-900">
              PKR {salePrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onQuickView}
            className="flex-1 border border-black text-black py-1.5 sm:py-2 px-2 sm:px-3 rounded hover:bg-black hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium"
          >
            Add to cart
          </button>
          {onQuickView && (
            <button
              onClick={onQuickView}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded hover:border-black transition-colors text-xs sm:text-sm text-gray-600 hover:text-black"
              aria-label="Quick view"
              title="Quick View"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
