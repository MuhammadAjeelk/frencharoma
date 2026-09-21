"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// useLayoutEffect measures before paint, so the text never flashes at full
// size and snaps down — but it warns during SSR, where there is nothing to
// measure anyway.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Holds a line of text on one line by stepping the type down until it fits,
// rather than cutting it off with an ellipsis. Pass the text being rendered as
// `fit` so the measurement re-runs when it changes; the ellipsis is still
// there as a last resort once `floor` is reached.
export default function FitText({
  as: Tag = "p",
  fit,
  floor = 9,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      el.style.fontSize = "";
      // A zero-width box measures as "fits" and would strand the text at full
      // size, so wait for a later pass instead.
      if (!el.clientWidth) return;
      let size = parseFloat(getComputedStyle(el).fontSize);
      // scrollWidth outruns clientWidth only while the line overflows.
      while (el.scrollWidth > el.clientWidth && size > floor) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
    };

    run();
    // Webfonts land after first paint and change the metrics under us.
    let live = true;
    document.fonts?.ready.then(() => live && run());

    // Watch the parent, not this element — resizing this element is what the
    // effect does, so observing it would loop.
    const box = el.parentElement;
    if (!box || typeof ResizeObserver === "undefined") {
      return () => {
        live = false;
      };
    }
    const ro = new ResizeObserver(run);
    ro.observe(box);
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [fit, floor]);

  return (
    <Tag
      ref={ref}
      className={`whitespace-nowrap overflow-hidden text-ellipsis ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
