"use client";

import { useEffect, useRef, useState } from "react";

// Reveals its children with a gentle fade-up the first time they scroll into
// view. Used to give every homepage section the same elegant entrance.
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      // Positive bottom margin expands the root, so a section starts its
      // entrance ~20% of a viewport before it actually scrolls in.
      { threshold: 0, rootMargin: "0px 0px 20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
