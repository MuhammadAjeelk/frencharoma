"use client";

import { useState } from "react";
import Link from "next/link";

// "What our customers say" plus three promises. Quotes are real approved
// reviews (4★ and up, with text) read when the homepage renders; with none,
// the quote half is left out rather than filled with invented testimonials.

const PROMISES = [
  {
    title: "Free Shipping",
    text: "Across Pakistan",
    icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  },
  {
    title: "Secure Payments",
    text: "Cash on Delivery • Bank Transfer",
    icon: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  },
  {
    title: "Dedicated Support",
    text: "We're Here to Help",
    icon: "M4 13v-1a8 8 0 0116 0v1M4 13a2 2 0 002 2h1v-5H6a2 2 0 00-2 2zM20 13a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2zM17 15v1a3 3 0 01-3 3h-2",
  },
];

function Stars({ rating }) {
  return (
    <span className="flex justify-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`w-4 h-4 ${i <= rating ? "text-[#e0a43a]" : "text-[#e0a43a]/30"}`} fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function Chevron({ dir }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function CustomerStrip({ reviews = [] }) {
  const [i, setI] = useState(0);
  const review = reviews.length ? reviews[i % reviews.length] : null;
  const step = (d) => setI((n) => (n + d + reviews.length) % reviews.length);

  return (
    <section className="bg-[var(--fa-home-strip)] py-7 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center gap-8">
        {review && (
          <div className="md:w-1/2 md:pr-8 md:border-r md:border-[var(--fa-ink)]/10">
            <p className="font-[family-name:var(--font-playfair)] text-[11px] uppercase tracking-[0.3em] text-[var(--fa-ink)]/80">
              What our customers say
            </p>
            <div className="mt-3 flex items-center gap-3">
              {reviews.length > 1 && (
                <button type="button" onClick={() => step(-1)} aria-label="Previous review" className="shrink-0 text-[var(--fa-ink)] hover:text-[var(--fa-gold-ink)]">
                  <Chevron dir={-1} />
                </button>
              )}
              <figure className="flex-1 text-center">
                <blockquote className="font-[family-name:var(--font-playfair)] italic text-base md:text-lg text-[var(--fa-ink)] leading-snug">
                  “{review.body.length > 140 ? `${review.body.slice(0, 137).trimEnd()}…` : review.body}”
                </blockquote>
                <div className="mt-2">
                  <Stars rating={review.rating} />
                </div>
                <figcaption className="mt-1 text-xs text-[var(--fa-secondary)]">
                  {review.perfumeSlug ? (
                    <Link href={`/products/${review.perfumeSlug}`} className="hover:underline">
                      {review.name}
                    </Link>
                  ) : (
                    review.name
                  )}
                </figcaption>
              </figure>
              {reviews.length > 1 && (
                <button type="button" onClick={() => step(1)} aria-label="Next review" className="shrink-0 text-[var(--fa-ink)] hover:text-[var(--fa-gold-ink)]">
                  <Chevron dir={1} />
                </button>
              )}
            </div>
          </div>
        )}

        <ul className={`grid grid-cols-3 gap-3 ${review ? "md:w-1/2" : "w-full"}`}>
          {PROMISES.map((p) => (
            <li key={p.title} className="flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-[var(--fa-ink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={p.icon} />
              </svg>
              <p className="mt-2 font-[family-name:var(--font-playfair)] font-semibold text-[13px] md:text-[15px] text-[var(--fa-ink)]">{p.title}</p>
              <p className="font-[family-name:var(--font-playfair)] text-[11px] md:text-[13px] text-[var(--fa-ink)]/85">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
