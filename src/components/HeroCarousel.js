"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FOCUS_RING } from "@/lib/design";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/home/hero-shop-all-v4.webp",
      title: "SHOP ALL",
      href: "/collections/shop-all",
      bg: "#f1e6d9",
    },
    {
      image: "/images/home/hero-best-sellers-v4.webp",
      title: "BEST SELLERS",
      href: "/collections/shop-all?bestSeller=true",
      bg: "#e9d9c6",
    },
    {
      image: "/images/home/hero-special-offers-v4.webp",
      title: "SPECIAL OFFERS",
      href: "/collections/shop-all?specialOffer=true",
      bg: "#e7d3bb",
    },
    {
      image: "/images/home/hero-bundle-offers-v4.webp",
      title: "BUNDLE OFFERS",
      href: "/collections/shop-all",
      bg: "#eddcc4",
    },
    {
      image: "/images/home/hero-discovery-box-v4.webp",
      title: "DISCOVERY BOX",
      href: "/collections/discovery-box",
      cta: "Explore Collection",
      bg: "#f0e2cd",
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
      <div className="relative w-full aspect-2400/1071 overflow-hidden">
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

            {/* Shop Now — the artwork no longer carries it */}
            <div className="absolute left-[17%] top-[89%] z-20 -translate-x-1/2 -translate-y-1/2">
              <Link
                href={slide.href}
                className={`inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full bg-[var(--fa-ink)] text-[var(--fa-cream)] border border-[var(--fa-gold)] shadow-[0_4px_14px_rgba(0,0,0,0.3)] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-[var(--fa-gold)] hover:text-[var(--fa-ink)] px-2.5 py-1 text-[8px] sm:px-4 sm:py-1.5 sm:text-[10px] lg:px-6 lg:py-2.5 lg:text-xs ${FOCUS_RING}`}
              >
                {slide.cta || "Shop Now"}
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
                </svg>
              </Link>
            </div>
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
                    ? "bg-[var(--fa-ink)] border-[var(--fa-ink)]"
                    : "bg-transparent border-[var(--fa-ink)]/60 hover:bg-[var(--fa-ink)]/40"
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
