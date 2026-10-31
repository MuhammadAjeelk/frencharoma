"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

// A row of homepage cards.
// - Phones: a swipeable strip that snaps card by card, with the next card
//   peeking in from the right edge — the mobile mockup's rows, which carry no
//   arrows or dots.
// - md and up, `desktop="grid"`: a plain row of equal columns.
// - md and up, `desktop="scroll"`: stays a strip, with round dark arrows
//   outside it (Shop by Brand).
// `itemClass` sizes each card per breakpoint; `gapClass` sets the gutters.

function Chevron({ dir }) {
  return (
    <svg className="w-[45%] h-[45%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M19 12H5m0 0l6-6m-6 6l6 6" : "M5 12h14m0 0l-6-6m6 6l-6 6"} />
    </svg>
  );
}

export default function SnapRow({
  children,
  label,
  desktop = "grid",
  cols = 3,
  itemClass = "w-[84.2vw] md:w-auto",
  gapClass = "gap-2 md:gap-[9px]",
  className = "",
}) {
  const ref = useRef(null);
  const items = Children.toArray(children);
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync]);

  const go = (dir) => {
    const el = ref.current;
    const first = el?.firstElementChild;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const grid = desktop === "grid";
  const arrow =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-[2.63vw] h-[2.63vw] min-w-8 min-h-8 max-w-12 max-h-12 rounded-full items-center justify-center bg-[#2f2f2f] text-white hover:bg-black disabled:hover:bg-[#2f2f2f] disabled:cursor-default";

  return (
    <div className={`relative ${className}`} role="region" aria-label={label}>
      <div
        ref={ref}
        onScroll={sync}
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-px-3 px-3 scrollbar-none md:px-0 md:scroll-px-0 ${gapClass} ${
          grid ? `md:grid md:overflow-visible ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}` : ""
        }`}
      >
        {items.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClass}`}>
            {child}
          </div>
        ))}
        {/* Lets the last card snap flush with the right gutter on phones */}
        <div aria-hidden="true" className="shrink-0 w-px md:hidden" />
      </div>

      {!grid && items.length > 1 && (
        <>
          <button type="button" aria-label="Previous" disabled={edges.start} onClick={() => go(-1)} className={`${arrow} -left-[4.3vw]`}>
            <Chevron dir={-1} />
          </button>
          <button type="button" aria-label="Next" disabled={edges.end} onClick={() => go(1)} className={`${arrow} -right-[4.3vw]`}>
            <Chevron dir={1} />
          </button>
        </>
      )}
    </div>
  );
}
