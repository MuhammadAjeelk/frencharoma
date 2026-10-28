"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";
import { DEFAULT_HERO_SLIDES, HERO_DESKTOP as DESKTOP, HERO_MOBILE as MOBILE } from "@/lib/siteMedia";

// Each banner carries its own "Explore Collection" button in the artwork, so
// the whole slide is the link — there is no overlaid CTA any more.
//
// Phones get the square-ish mobile art where one has been supplied. A slide
// with no mobile art is left out below sm rather than squeezed: its wide art
// cropped into a 1290x1405 frame would lose the bottles and the copy.
// The slide list is admin-managed (Admin → Homepage Images); see
// DEFAULT_HERO_SLIDES in src/lib/siteMedia.js for the shape.

// Art direction: one <picture> per slide, so a phone downloads only the phone
// art and a desktop only the wide art. Two next/image elements toggled with
// CSS would fetch both.
function SlideArt({ slide, priority }) {
  const common = { alt: slide.title, sizes: "100vw", priority };
  const d = slide.desktop;
  const m = slide.mobile;
  const {
    props: { srcSet: desktopSrcSet, ...rest },
  } = getImageProps({
    ...common,
    src: d.src,
    width: d.width || DESKTOP.width,
    height: d.height || DESKTOP.height,
  });
  const mobileSrcSet = m?.src
    ? getImageProps({
        ...common,
        src: m.src,
        width: m.width || MOBILE.width,
        height: m.height || MOBILE.height,
      }).props.srcSet
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

export default function HeroCarousel({ slides: allSlides = DEFAULT_HERO_SLIDES }) {
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

  const all = allSlides.filter((s) => s.desktop?.src);
  const slides = isPhone ? all.filter((s) => s.mobile?.src) : all;

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

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[1290/1405] sm:aspect-[2880/985] overflow-hidden bg-[#e9d9c6]">
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
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
              key={slide.id}
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
