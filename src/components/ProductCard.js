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
    <div className="group relative border border-[#e8e4df] rounded-xl overflow-hidden bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col">
      {/* Badges - stacked top-left */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="bg-[#1a1a2e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            -{discountPercent}% OFF
          </span>
        )}
        {!hasDiscount && hasSale && originalPrice && (
          <span className="bg-[#b8964e] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            Multiple Editions
          </span>
        )}
        {isSpecialOffer && (
          <span className="bg-[#c2185b] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            Special Offer
          </span>
        )}
      </div>

      {/* Wishlist heart - always top-right */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className={`w-[15px] h-[15px] transition-colors duration-200 ${wishlisted ? "text-[#c2185b] fill-[#c2185b]" : "text-[#9a9590]"}`}
          fill={wishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Product Image */}
      <Link href={href || "#"} className="block relative w-full aspect-[6.818/7.5] overflow-hidden bg-[#f7f5f2]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {brandLabel && (
          <p className="text-[10px] sm:text-[11px] font-semibold text-[#b8964e] uppercase tracking-widest mb-1">
            {brandLabel}
          </p>
        )}

        <Link href={href || "#"}>
          <h3 className="text-xs sm:text-[13px] font-semibold text-[#1f1a16] mb-0.5 line-clamp-2 hover:text-[#b8964e] transition-colors leading-snug">
            {name}
          </h3>
        </Link>

        {impressionName && (
          <p className="text-[10px] sm:text-[11px] text-[#8a847e] mb-1 italic line-clamp-1">
            Inspired by {impressionName}
          </p>
        )}

        {seasonTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {seasonTags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f7f5f2] text-[#6b6560] border border-[#e8e4df] uppercase tracking-wide"
              >
                {SEASON_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        <div className="mb-1.5 sm:mb-2">
          <p className="text-[9px] sm:text-[10px] text-[#8a847e] mb-1">
            Admired by <span className="font-semibold text-[#6b6560]">{Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60))}%</span> globally
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-[#f0ece7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b8964e] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(60, Number(globalAdmirePercent) || 60))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-0.5 mb-2 sm:mb-3">
          {hasDiscount ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-[15px] font-bold text-[#1f1a16]">
                  PKR {discountedMin.toLocaleString()}
                  {hasSale && discountedMax && discountedMax !== discountedMin && (
                    <> – {discountedMax.toLocaleString()}</>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-[#a09890] line-through">
                PKR {salePrice.toLocaleString()}
                {hasSale && originalPrice && originalPrice !== salePrice && (
                  <> – {originalPrice.toLocaleString()}</>
                )}
              </span>
            </>
          ) : hasSale && originalPrice ? (
            <span className="text-sm sm:text-[15px] font-bold text-[#1f1a16]">
              PKR {salePrice.toLocaleString()}{" "}
              <span className="font-normal text-[#a09890] text-[11px]">–</span>{" "}
              {originalPrice.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm sm:text-[15px] font-bold text-[#1f1a16]">
              PKR {salePrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onQuickView}
            className="flex-1 bg-[#1a1a2e] text-white py-2 sm:py-2.5 px-3 rounded-lg hover:bg-[#2d2d44] transition-colors duration-200 text-[11px] sm:text-xs font-semibold tracking-wide uppercase"
          >
            Add to Cart
          </button>
          {onQuickView && (
            <button
              onClick={onQuickView}
              className="px-2.5 sm:px-3 py-2 border border-[#e8e4df] rounded-lg hover:border-[#1a1a2e] hover:bg-[#faf8f5] transition-all duration-200 text-[#6b6560] hover:text-[#1a1a2e]"
              aria-label="Quick view"
              title="Quick View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
