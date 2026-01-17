"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Base products - will be duplicated for infinite loop
  const baseProducts = [
    {
      name: "GRANDEUR BELLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-belle",
      hasSale: true,
      rating: 0,
    },
    {
      name: "GRANDEUR NOBLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-noble",
      hasSale: true,
      rating: 4,
    },
    {
      name: "DAWN BY NATURE COLLECTION EDP MEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/dawn-by-nature-collection-long-lasting-perfume-for-men-1.jpg?v=1755871076&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/dawn",
      hasSale: true,
      rating: 0,
    },
    {
      name: "HORIZON BY NATURE COLLECTION EDP WOMEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/horizon-by-nature-collection-long-lasting-perfume-for-women-1.jpg?v=1755870561&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/horizon",
      hasSale: true,
      rating: 0,
    },
    {
      name: "GRANDEUR BELLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-belle",
      hasSale: true,
    },
    {
      name: "GRANDEUR NOBLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-noble",
      hasSale: true,
      rating: 4,
    },
    {
      name: "DAWN BY NATURE COLLECTION EDP MEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/dawn-by-nature-collection-long-lasting-perfume-for-men-1.jpg?v=1755871076&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/dawn",
      hasSale: true,
      rating: 0,
    },
    {
      name: "HORIZON BY NATURE COLLECTION EDP WOMEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/horizon-by-nature-collection-long-lasting-perfume-for-women-1.jpg?v=1755870561&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/horizon",
      hasSale: true,
      rating: 0,
    },
    {
      name: "GRANDEUR BELLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-belle",
      hasSale: true,
      rating: 0,
    },
    {
      name: "GRANDEUR NOBLE EDP UNISEX 200ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/grandeur-belle-unisex-perfume-for-men-and-women-long-lasting-200ml-perfume-1.jpg?v=1755187706&width=720",
      originalPrice: 350.0,
      salePrice: 199.0,
      href: "/products/grandeur-noble",
      hasSale: true,
      rating: 4,
    },
    {
      name: "HORIZON BY NATURE COLLECTION EDP WOMEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/horizon-by-nature-collection-long-lasting-perfume-for-women-1.jpg?v=1755870561&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/horizon",
      hasSale: true,
    },
    {
      name: "DAWN BY NATURE COLLECTION EDP MEN 100ML",
      brand: "LINEA DE BELLA",
      image:
        "https://www.linea-debella.com/cdn/shop/files/dawn-by-nature-collection-long-lasting-perfume-for-men-1.jpg?v=1755871076&width=720",
      originalPrice: 200.0,
      salePrice: 159.0,
      href: "/products/dawn",
      hasSale: true,
    },
  ];

  // Duplicate products for seamless infinite loop
  const products = [...baseProducts, ...baseProducts, ...baseProducts];
  const totalProducts = baseProducts.length; // Show actual count, not duplicated

  // Determine how many products to show based on screen size
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1024) return 4; // lg: 4 columns
    if (window.innerWidth >= 640) return 2; // sm: 2 columns
    return 1; // mobile: 1 column
  };

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount());
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - visibleCount;
      if (newIndex < 0) {
        // Loop to the end
        return products.length - visibleCount;
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + visibleCount;
      if (newIndex >= products.length - visibleCount + 1) {
        // Loop back to start
        return 0;
      }
      return newIndex;
    });
  };

  const visibleItems = products.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  return (
    <div className="py-8 md:py-12 px-4 bg-white relative overflow-visible">
      <div className="max-w-7xl mx-auto overflow-visible">
        {/* Title */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8"
          style={{ color: "#1a1a2e" }}
        >
          BEST-SELLERS
        </h2>

        {/* Carousel Container */}
        <div className="relative mb-6 md:mb-8 overflow-visible">
          {/* Previous Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous products"
          >
            <Image
              src="/icons/arrow-left.svg"
              alt="Previous"
              width={20}
              height={20}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>

          {/* Products Grid - Ensure no cards are cut */}
          <div className="min-w-0 pl-12 sm:pl-14 md:pl-16 pr-12 sm:pr-14 md:pr-16">
            <div className="flex gap-3 md:gap-4">
              {visibleItems.map((product, index) => (
                <div
                  key={`${currentIndex}-${index}`}
                  className="flex-shrink-0"
                  style={{
                    width:
                      visibleCount === 1
                        ? "100%"
                        : visibleCount === 2
                        ? "calc((100% - 12px) / 2 - 12px)"
                        : visibleCount === 4
                        ? "calc((100% - 36px) / 4 - 10px)"
                        : "calc((100% - 24px) / 3 - 10px)",
                  }}
                >
                  <ProductCard
                    name={product.name}
                    brand={product.brand}
                    image={product.image}
                    originalPrice={product.originalPrice}
                    salePrice={product.salePrice}
                    href={product.href}
                    hasSale={product.hasSale}
                    rating={product.rating}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next products"
          >
            <Image
              src="/icons/arrow-right.svg"
              alt="Next"
              width={20}
              height={20}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
        </div>

        {/* View All Button */}
        <div className="flex justify-center items-center w-full">
          <a
            href="/collections/best-seller-perfumes"
            className="bg-black text-white px-6 md:px-8 py-2.5 md:py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-sm md:text-base text-center"
          >
            View all
          </a>
        </div>
      </div>
    </div>
  );
}
