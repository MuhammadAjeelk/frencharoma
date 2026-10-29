"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Layout from the 2026-10 homepage mockup: brand, three link columns and the
// newsletter on one row over a dark ground that fades into a Paris skyline,
// then a thin bar with the copyright and the two legal links.
// No address, phone or social links until the correct ones are confirmed.

function Column({ title, links, linkClass }) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-playfair)] text-[15px] font-semibold text-[var(--fa-cream)]">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {links.map((item) => (
          <li key={item.name}>
            <Link href={item.href} className={linkClass}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const shop = [
    { name: "Shop All", href: "/collections/shop-all" },
    { name: "Best Sellers", href: "/collections/shop-all?bestSeller=true" },
    { name: "Discovery Box", href: "/collections/discovery-box" },
  ];

  const company = [
    { name: "About Us", href: "/pages/about-us" },
    { name: "Blogs", href: "/blogs/blog" },
  ];

  const service = [
    { name: "Track Order", href: "/track-order" },
    { name: "Shipping", href: "/pages/shipping-policy" },
    { name: "Returns", href: "/pages/refund-policy" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail("");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const documentHeight = document.documentElement.scrollHeight;
      setShowScrollTop(window.scrollY >= documentHeight * 0.75);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass =
    "text-[13px] text-[var(--fa-on-dark)]/90 hover:text-[var(--fa-gold-hover)] transition-colors duration-200";

  return (
    <>
      <footer className="relative overflow-hidden bg-[var(--fa-dark-deep)] border-t border-[var(--fa-gold)]/40">
        {/* Skyline art fades in from the right edge, behind the newsletter */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-56 md:w-72 bg-[url('/images/home/footer-paris-v1.webp')] bg-cover bg-center opacity-60 [mask-image:linear-gradient(90deg,transparent,black_70%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-8 grid gap-8 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr_1.6fr] md:items-start">
          <div className="text-center md:text-left">
            <p className="font-[family-name:var(--font-playfair)] text-2xl lg:text-[26px] tracking-[0.06em] text-[var(--fa-gold-hover)] uppercase">
              French Aromas
            </p>
            <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-[var(--fa-on-dark)]">
              Inspired by French art of perfumery
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:contents">
            <Column title="Shop" links={shop} linkClass={linkClass} />
            <Column title="Company" links={company} linkClass={linkClass} />
            <Column title="Customer Service" links={service} linkClass={linkClass} />
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-[15px] font-semibold text-[var(--fa-cream)]">Join Our Journey</h3>
            <p className="mt-1 text-[12px] text-[var(--fa-on-dark)]">Be the first to know about new scents and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="mt-3 flex max-w-sm">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-[var(--fa-ink)] border border-[var(--fa-gold)]/50 border-r-0 rounded-l-md px-3 py-2.5 text-[13px] text-[var(--fa-cream)] placeholder-[var(--fa-muted-dark)] focus:outline-none focus:border-[var(--fa-gold)] transition-colors"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="shrink-0 rounded-r-md bg-[var(--fa-gold-hover)] px-3.5 text-[var(--fa-ink)] hover:bg-[var(--fa-gold)] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
                </svg>
              </button>
            </form>
            <p className="mt-3 font-[family-name:var(--font-playfair)] italic text-[14px] text-[var(--fa-gold-hover)]">
              More Than a Fragrance — A Feeling
            </p>
          </div>
        </div>

        <div className="relative border-t border-[var(--fa-gold)]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-10 text-[12px] text-[var(--fa-muted-dark)]">
            <p>&copy; 2026 French Aromas. All rights reserved.</p>
            <div className="flex gap-6 sm:ml-[12%]">
              <Link href="/pages/privacy-policy" className="hover:text-[var(--fa-gold-hover)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/pages/terms-conditions" className="hover:text-[var(--fa-gold-hover)] transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-[var(--fa-dark)] border border-[var(--fa-gold)] text-[var(--fa-gold)] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:bg-[var(--fa-gold)] hover:text-[var(--fa-ink)] transition-colors duration-200"
          aria-label="Back to top"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}
