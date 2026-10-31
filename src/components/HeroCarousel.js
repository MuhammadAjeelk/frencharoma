"use client";

import { useState, useEffect, useRef } from "react";
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

  // Restarts on every slide change, so a swipe gets a full 5s before the next.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, currentSlide]);

  // No dots, as in the mockups: the hero runs straight into the trust strip.
  // Slides advance on their own and can be swiped on touch screens.
  const touchX = useRef(null);
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null || slides.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    setCurrentSlide((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full">
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full aspect-[1290/1405] sm:aspect-[2880/985] overflow-hidden bg-[#e9d9c6]"
      >
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

    </div>
  );
}
