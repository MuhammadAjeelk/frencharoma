"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

// A row of homepage cards.
// - Phones: a swipeable strip that snaps one card at a time, with round
//   arrows over the edges and dots underneath (the mockup's mobile carousels).
// - md and up, `desktop="grid"`: a plain three-column row, no controls.
// - md and up, `desktop="scroll"`: stays a strip, with dark arrows outside the
//   row (Shop by Brand).
// `itemClass` sizes each card per breakpoint.

function Chevron({ dir }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function SnapRow({
  children,
  label,
  desktop = "grid",
  itemClass = "w-full md:w-auto",
  dots = true,
  tone = "light",
  className = "",
}) {
  const ref = useRef(null);
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: items.length <= 1 });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0) : el.clientWidth;
    setActive(Math.round(el.scrollLeft / Math.max(step, 1)));
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const go = (dir) => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first ? first.getBoundingClientRect().width : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  const goTo = (i) => {
    const el = ref.current;
    const target = el?.children[i];
    if (target) el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const grid = desktop === "grid";
  const phoneArrow =
    "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-opacity disabled:opacity-0 " +
    (tone === "dark"
      ? "bg-[var(--fa-cream)]/90 border-[var(--fa-cream)] text-[var(--fa-ink)]"
      : "bg-[var(--fa-cream)]/90 border-[var(--fa-ink)]/30 text-[var(--fa-ink)]");
  const deskArrow =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center bg-[#2b2b2b] text-white hover:bg-[var(--fa-ink)] transition-opacity disabled:opacity-30";

  return (
    <div className={`relative ${className}`} role="region" aria-label={label}>
      <div
        ref={ref}
        onScroll={sync}
        className={`flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none ${
          grid ? "md:grid md:grid-cols-3 md:gap-2 md:overflow-visible" : "md:gap-6"
        }`}
      >
        {items.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClass}`}>
            {child}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button type="button" aria-label="Previous" disabled={edges.start} onClick={() => go(-1)} className={`${phoneArrow} -left-2 md:hidden`}>
            <Chevron dir={-1} />
          </button>
          <button type="button" aria-label="Next" disabled={edges.end} onClick={() => go(1)} className={`${phoneArrow} -right-2 md:hidden`}>
            <Chevron dir={1} />
          </button>
          {!grid && (
            <>
              <button type="button" aria-label="Previous" disabled={edges.start} onClick={() => go(-1)} className={`${deskArrow} -left-14`}>
                <Chevron dir={-1} />
              </button>
              <button type="button" aria-label="Next" disabled={edges.end} onClick={() => go(1)} className={`${deskArrow} -right-14`}>
                <Chevron dir={1} />
              </button>
            </>
          )}
          {dots && (
            <div className="md:hidden mt-3 flex justify-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to card ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full border transition-colors ${
                    tone === "dark"
                      ? i === active ? "bg-[var(--fa-cream)] border-[var(--fa-cream)]" : "border-[var(--fa-cream)]/70"
                      : i === active ? "bg-[var(--fa-ink)] border-[var(--fa-ink)]" : "border-[var(--fa-ink)]/60"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
