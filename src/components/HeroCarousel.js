"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/home/hero-best-sellers.webp",
      title: "BEST SELLERS",
      subtitle: "Most Loved. Most Trusted.",
      href: "/collections/shop-all?bestSeller=true",
      contain: true,
      bg: "#e7e0d1",
    },
    {
      image: "/images/home/luxury-edition-hero.webp",
      title: "LUXURY EDITION",
      subtitle: "A statement of refinement — crafted to leave an impression that lasts.",
      href: "/collections/shop-all?edition=luxury",
      contain: true,
      bg: "#efe6d8",
    },
    {
      image: "/images/home/bundle-offers-hero.webp",
      title: "BUNDLE OFFERS",
      subtitle: "Buy 2 or more and save more — discounts auto-applied at checkout.",
      href: "/collections/shop-all",
      contain: true,
      bg: "#f3ece1",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full">
      <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[700px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={slide.contain ? { backgroundColor: slide.bg || "#efe6d8" } : undefined}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={slide.contain ? "object-contain" : "object-cover"}
              priority={index === 0}
              sizes="100vw"
            />
            {!slide.contain && (
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="w-full flex justify-center sm:w-[40%] sm:justify-end">
                  <Link
                    href={slide.href}
                    className="bg-white text-[#1a1a2e] px-4 py-2 sm:px-5 sm:py-2.5 md:px-8 md:py-3 lg:px-10 lg:py-3.5 rounded-lg text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.14em] hover:bg-[#1a1a2e] hover:text-white transition-all duration-300 shadow-lg font-semibold border border-white/20"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
            )}
            {slide.contain && (
              <Link href={slide.href} className="absolute inset-0 z-10" aria-label={slide.title} />
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white py-4 sm:py-5 md:py-6">
        <div className="flex items-center justify-center gap-5 sm:gap-7 lg:gap-10">
          <button onClick={prevSlide} className="text-[#1a1a2e] hover:text-[#b8964e] transition-colors p-1" aria-label="Previous slide">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-6 h-1.5 bg-[#1a1a2e]"
                    : "w-1.5 h-1.5 bg-[#ccc8c2] hover:bg-[#8a847e]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="text-[#1a1a2e] hover:text-[#b8964e] transition-colors p-1" aria-label="Next slide">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
