"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

const SEASON_LABELS = {
  "spring-summer": "Spring & Summer",
  "autumn-winter": "Autumn & Winter",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
  "all-seasons": "All Seasons",
};

export default function ProductCard({
  name,
  brand,
  image,
  impressionName,
  originalPrice,
  salePrice,
  href,
  slug,
  hasSale = false,
  discountPercent = 0,
  isSpecialOffer = false,
  globalAdmirePercent = 60,
  tags = [],
  onQuickView,
}) {
  const { isInWishlist, toggleItem } = useWishlist();

  const brandLabel = Array.isArray(brand) ? brand.join(", ") : brand;
  const seasonTags = (tags || []).filter((t) => SEASON_LABELS[t]);
  const productSlug = slug || (href ? href.replace("/products/", "") : "");
  const wishlisted = isInWishlist(productSlug);

  const hasDiscount = discountPercent > 0 && salePrice > 0;
  const discountedMin = hasDiscount ? Math.round(salePrice * (1 - discountPercent / 100)) : salePrice;
  const discountedMax =
    hasDiscount && originalPrice ? Math.round(originalPrice * (1 - discountPercent / 100)) : originalPrice;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      slug: productSlug,
      name,
      brand: brandLabel,
      image,
      price: salePrice,
    });
  };

  return (
    <div className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          -{discountPercent}% OFF
        </div>
      )}
      {!hasDiscount && hasSale && originalPrice && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-[#1a1a2e] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Multiple Editions
        </div>
      )}
      {isSpecialOffer && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Special Offer
        </div>
      )}

      {/* Wishlist heart */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
        style={isSpecialOffer ? { top: "2rem", right: "0.375rem" } : {}}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className={`w-4 h-4 transition-colors ${wishlisted ? "text-red-500 fill-red-500" : "text-gray-400"}`}
          fill={wishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

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
        <Link href={href || "#"}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 line-clamp-2 hover:text-gray-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Impression / Inspired label */}
        {impressionName && (
          <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 italic line-clamp-1">
            Inspired by {impressionName}
          </p>
        )}

        {brandLabel && (
          <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">By {brandLabel}</p>
        )}

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

        <div className="mb-1.5 sm:mb-2">
          <p className="text-[10px] sm:text-xs text-gray-600">
            Globally Admired:{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60))}%
            </span>
          </p>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-0.5 mb-2 sm:mb-3">
          {hasDiscount ? (
            <>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
