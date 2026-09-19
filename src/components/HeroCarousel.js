"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/home/hero-shop-all-v2.webp",
      title: "SHOP ALL",
      href: "/collections/shop-all",
      bg: "#f1e6d9",
    },
    {
      image: "/images/home/hero-best-sellers-v2.webp",
      title: "BEST SELLERS",
      href: "/collections/shop-all?bestSeller=true",
      bg: "#e9d9c6",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-2400/1358 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ backgroundColor: slide.bg }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="100vw"
            />
            <Link href={slide.href} className="absolute inset-0 z-10" aria-label={slide.title} />
          </div>
        ))}

        {/* Dots — centered over the bottom of the image */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 sm:bottom-4 md:bottom-6 z-20 flex items-center justify-center gap-2.5 sm:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-colors duration-300 ${
                  index === currentSlide
                    ? "bg-[#2f2b26] border-[#2f2b26]"
                    : "bg-transparent border-[#2f2b26]/60 hover:bg-[#2f2b26]/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
