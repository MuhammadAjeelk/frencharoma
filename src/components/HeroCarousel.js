"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://www.linea-debella.com/cdn/shop/files/luxury_in_every_perfume_spray.webp?v=1767521658&width=1500",
      title: "BEST SELLERS",
      subtitle: "Discover our most loved fragrances — handpicked by thousands.",
      href: "/collections/shop-all?bestSeller=true",
    },
    {
      image: "https://www.linea-debella.com/cdn/shop/files/new_collection_of_perfumes_1.webp?v=1767521728&width=1500",
      title: "BUNDLE OFFERS",
      subtitle: "Buy 2 or 3 perfumes and save up to 20% — mix & match your favourites.",
      href: "/collections/shop-all?bundle=true",
    },
    {
      image: "https://www.linea-debella.com/cdn/shop/files/DIVE-INTO-LUXURY.jpg?v=1755525359&width=3000",
      title: "SPECIAL OFFERS",
      subtitle: "Up to 50% off on select perfumes — limited time, limited stock.",
      href: "/collections/shop-all?specialOffer=true",
    },
    {
      image: "https://www.linea-debella.com/cdn/shop/files/luxury_in_every_perfume_spray.webp?v=1767521658&width=1500",
      title: "DISCOVERY BOX",
      subtitle: "Pick any 5 testers at 25% off — explore before you commit.",
      href: "/collections/discovery-box",
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
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="w-[40%] flex justify-end">
                  <Link
                    href={slide.href}
                    className="bg-primary text-black px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 lg:px-8 lg:py-3 rounded-md text-[10px] sm:text-xs md:text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors shadow-lg font-semibold"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white py-3 sm:py-4 md:py-6">
        <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          <button onClick={prevSlide} className="text-black hover:text-gray-600 transition-colors" aria-label="Previous slide">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "w-2 h-2 bg-black rounded-full"
                    : "w-2 h-2 border-2 border-black rounded-full bg-transparent hover:bg-gray-200"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="text-black hover:text-gray-600 transition-colors" aria-label="Next slide">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
