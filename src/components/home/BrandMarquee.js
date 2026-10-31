"use client";

import { useEffect, useRef } from "react";

// Shop by Brand as an endless marquee. The list is rendered twice and the
// strip's scroll position creeps forward each frame, wrapping by one copy's
// width, so it loops with no seam. Because it moves by scrolling (not a CSS
// transform) a visitor can still swipe it on a phone, and the arrows nudge it
// one card at a time. It pauses while hovered or touched, and stays still for
// visitors who ask for reduced motion.

const SPEED = 40; // px per second

function Chevron({ dir }) {
  return (
    <svg className="w-[45%] h-[45%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M19 12H5m0 0l6-6m-6 6l6 6" : "M5 12h14m0 0l-6-6m6 6l-6 6"} />
    </svg>
  );
}

export default function BrandMarquee({ items, label, itemClass, gapClass }) {
  const ref = useRef(null);
  const paused = useRef(false);
  const resumeAt = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    let last = performance.now();
    let pos = el.scrollLeft;
    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const half = el.scrollWidth / 2;
      if (!paused.current && now >= resumeAt.current && half > el.clientWidth) {
        // Pick up wherever a swipe or arrow left it.
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
        pos += (SPEED * dt) / 1000;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
        if (pos >= half && half > 0) el.scrollLeft = pos -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nudge = (dir) => {
    const el = ref.current;
    const first = el?.firstElementChild;
    if (!el || !first) return;
    const half = el.scrollWidth / 2;
    // Stay inside the doubled strip so a step back from the start still works.
    if (dir < 0 && el.scrollLeft < first.offsetWidth) el.scrollLeft += half;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    resumeAt.current = performance.now() + 1200;
    el.scrollBy({ left: dir * (first.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const hold = () => (paused.current = true);
  const release = () => {
    paused.current = false;
    resumeAt.current = performance.now() + 800;
  };

  const arrow =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-[2.63vw] h-[2.63vw] min-w-8 min-h-8 max-w-12 max-h-12 rounded-full items-center justify-center bg-[#2f2f2f] text-white hover:bg-black";

  return (
    <div className="relative" role="region" aria-label={label}>
      <div
        ref={ref}
        onMouseEnter={hold}
        onMouseLeave={release}
        onTouchStart={hold}
        onTouchEnd={release}
        onFocus={hold}
        onBlur={release}
        className={`flex overflow-x-auto scrollbar-none px-3 md:px-0 ${gapClass}`}
      >
        {[0, 1].map((copy) =>
          items.map((item, i) => (
            <div key={`${copy}-${i}`} className={`shrink-0 ${itemClass}`} aria-hidden={copy === 1 || undefined} inert={copy === 1 || undefined}>
              {item}
            </div>
          )),
        )}
      </div>
      <button type="button" aria-label="Previous brands" onClick={() => nudge(-1)} className={`${arrow} -left-[4.3vw]`}>
        <Chevron dir={-1} />
      </button>
      <button type="button" aria-label="Next brands" onClick={() => nudge(1)} className={`${arrow} -right-[4.3vw]`}>
        <Chevron dir={1} />
      </button>
    </div>
  );
}
