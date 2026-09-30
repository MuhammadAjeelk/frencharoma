"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";

// Each banner carries its own "Explore Collection" button in the artwork, so
// the whole slide is the link — there is no overlaid CTA any more.
//
// Phones get the square-ish mobile art where the designer supplied it. A slide
// with no mobile art is left out below sm rather than squeezed: its wide art
// cropped into a 1290x1405 frame would lose the bottles and the copy.
const SLIDES = [
  {
    title: "Best Sellers",
    href: "/collections/shop-all?bestSeller=true",
    desktop: "/images/home/hero-best-sellers-v5.webp",
    mobile: "/images/home/hero-best-sellers-mobile-v5.webp",
  },
  {
    title: "Special Offers",
    href: "/collections/shop-all?specialOffer=true",
    desktop: "/images/home/hero-special-offers-v5.webp",
    mobile: null,
  },
  {
    title: "Bundle Offers",
    href: "/collections/shop-all",
    desktop: "/images/home/hero-bundle-offers-v5.webp",
    mobile: "/images/home/hero-bundle-offers-mobile-v5.webp",
  },
  {
    title: "Discovery Box",
    href: "/collections/discovery-box",
    desktop: "/images/home/hero-discovery-box-v5.webp",
    mobile: "/images/home/hero-discovery-box-mobile-v5.webp",
  },
];

const DESKTOP = { width: 2880, height: 985 };
const MOBILE = { width: 1290, height: 1405 };

// Art direction: one <picture> per slide, so a phone downloads only the phone
// art and a desktop only the wide art. Two next/image elements toggled with
// CSS would fetch both.
function SlideArt({ slide, priority }) {
  const common = { alt: slide.title, sizes: "100vw", priority };
  const {
    props: { srcSet: desktopSrcSet, ...rest },
  } = getImageProps({ ...common, ...DESKTOP, src: slide.desktop });
  const mobileSrcSet = slide.mobile
    ? getImageProps({ ...common, ...MOBILE, src: slide.mobile }).props.srcSet
    : null;

  return (
    <picture>
      {mobileSrcSet && <source media="(max-width: 639px)" srcSet={mobileSrcSet} />}
      <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in rest */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover object-center" />
    </picture>
  );
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mount-guarded so SSR and the first client paint agree.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const slides = isPhone ? SLIDES.filter((s) => s.mobile) : SLIDES;

  // Crossing the breakpoint changes the slide count; keep the index in range.
  useEffect(() => {
    setCurrentSlide((i) => (i < slides.length ? i : 0));
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[1290/1405] sm:aspect-[2880/985] overflow-hidden bg-[#e9d9c6]">
        {slides.map((slide, index) => (
          <Link
            key={slide.title}
            href={slide.href}
            aria-label={slide.title}
            tabIndex={index === currentSlide ? 0 : -1}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <SlideArt slide={slide} priority={index === 0} />
          </Link>
        ))}
      </div>

      {/* Dots. On phones the art centres its own button right at the bottom
          edge, so the dots sit in a band beneath the image instead — the same
          ground as the trust strip below, so it reads as part of it. From sm
          the button is off to the side and the dots overlay the art. */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 py-2 bg-[var(--fa-dark)] sm:absolute sm:inset-x-0 sm:bottom-2.5 md:bottom-3.5 sm:z-20 sm:gap-3 sm:py-0 sm:bg-transparent">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border transition-colors duration-300 ${
                index === currentSlide
                  ? "bg-[var(--fa-gold)] border-[var(--fa-gold)] sm:bg-[var(--fa-ink)] sm:border-[var(--fa-ink)]"
                  : "bg-transparent border-[var(--fa-gold)]/70 sm:border-[var(--fa-ink)]/60 hover:bg-[var(--fa-ink)]/40"
              }`}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
      )}
    </div>
  );
}
