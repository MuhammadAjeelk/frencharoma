"use client";

import { useState } from "react";
import Link from "next/link";

// "What our customers say", from the 2026-10 mockups.
// - Desktop: the quote carousel in the left 52%, a divider, then three
//   promises. 149px tall in the 1369px mockup.
// - Phones: the quote alone, as drawn.
//
// Quotes are real approved reviews (4★ and up, with text) read when the
// homepage renders. Until there are any, the slot carries the brand line
// instead — with no stars and no customer name, so nothing reads as a review
// that was never written.

const PROMISES = [
  {
    title: "Free Shipping",
    text: "Across Pakistan",
    icon: "M2.5 7.5h11v8h-11zM13.5 10.5h4l3 3v2h-7zM6.5 18.6a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM16.8 18.6a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM4 5.5h5M2.5 9.5h-1M3 12h-1.5",
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
    <span className="flex justify-center gap-[0.22em]" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`w-[1.1em] h-[1.1em] ${i <= rating ? "text-[#e2a138]" : "text-[#e2a138]/30"}`} fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function Chevron({ dir }) {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Quote({ reviews }) {
  const [i, setI] = useState(0);
  const review = reviews.length ? reviews[i % reviews.length] : null;
  const step = (d) => setI((n) => (n + d + reviews.length) % reviews.length);
  const many = reviews.length > 1;

  return (
    <div className="relative">
      <p className="font-[family-name:var(--font-tinos)] text-[10px] md:text-[11px] leading-none uppercase tracking-[0.32em] text-[var(--fa-home-text)] pl-[15px] md:pl-[5.04vw]">
        What our customers say
      </p>
      <div className="mt-[10px] md:mt-[14px] flex items-center">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous review"
          disabled={!many}
          className="shrink-0 w-[40px] md:w-[3.6vw] flex justify-center text-[var(--fa-home-text)] hover:text-[var(--fa-gold-ink)] disabled:invisible"
        >
          <Chevron dir={-1} />
        </button>
        <figure className="flex-1 min-w-0 text-center font-[family-name:var(--font-tinos)]">
          <blockquote className="italic text-[12px] md:text-[17px] leading-snug text-[var(--fa-home-text)]">
            “{review ? (review.body.length > 120 ? `${review.body.slice(0, 117).trimEnd()}…` : review.body) : "More Than a Fragrance — A Feeling."}”
          </blockquote>
          {review ? (
            <>
              <div className="mt-[8px] text-[13px] md:text-[17px]">
                <Stars rating={review.rating} />
              </div>
              <figcaption className="mt-[6px] text-[11px] md:text-[13px] text-[var(--fa-home-text)]">
                {review.perfumeSlug ? (
                  <Link href={`/products/${review.perfumeSlug}`} className="hover:underline">
                    {review.name}
                  </Link>
                ) : (
                  review.name
                )}
              </figcaption>
            </>
          ) : (
            <figcaption className="mt-[8px] text-[11px] md:text-[13px] tracking-[0.06em] text-[var(--fa-home-text)]">French Aromas</figcaption>
          )}
        </figure>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next review"
          disabled={!many}
          className="shrink-0 w-[40px] md:w-[3.6vw] flex justify-center text-[var(--fa-home-text)] hover:text-[var(--fa-gold-ink)] disabled:invisible"
        >
          <Chevron dir={1} />
        </button>
      </div>
    </div>
  );
}

export default function CustomerStrip({ reviews = [] }) {
  return (
    <section className="bg-[var(--fa-home-strip)] min-h-[44.58vw] flex items-center md:min-h-0 md:h-[149px]">
      <div className="w-full md:h-full md:grid md:grid-cols-[51.9%_1fr] md:items-center">
        <div className="md:self-start md:pt-[25px] md:h-full md:border-r md:border-[var(--fa-home-text)]/12">
          <Quote reviews={reviews} />
        </div>

        <ul className="hidden md:grid grid-cols-3 -ml-[2.1vw] pr-[0.6vw]">
          {PROMISES.map((p) => (
            <li key={p.title} className="flex flex-col items-center text-center font-[family-name:var(--font-tinos)] text-[var(--fa-home-text-deep)]">
              <svg className="w-[32px] h-[32px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={p.icon} />
              </svg>
              <p className="mt-[10px] font-bold text-[15px] leading-none">{p.title}</p>
              <p className="mt-[6px] text-[14px] leading-none">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
