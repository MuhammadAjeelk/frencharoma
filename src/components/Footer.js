"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// The footer from the 2026-10 mockups: brand, Shop / Company / Customer
// Service, the newsletter and social icons on one row over a charcoal ground
// that fades into a Paris skyline on the right, then a thin bar with the
// copyright and the legal links. Column positions are the 1369px mockup's,
// in vw. Phones stack the same content so it stays readable.
// No address or phone until the correct ones are confirmed.

// Fill in a URL to show its icon; until then the icon is left out rather
// than linking nowhere.
const SOCIALS = [
  {
    name: "Instagram",
    href: "",
    path: "M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zm4.5 5a4 4 0 100 8 4 4 0 000-8zm5.25-1.6a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z",
    stroke: true,
  },
  { name: "Facebook", href: "", path: "M14 8h3V4.5h-3c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.6v-6.5h2.8l.6-3.5h-3.4V8.8c0-.5.3-.8.8-.8z" },
  { name: "TikTok", href: "", path: "M15.5 3c.3 2.3 1.7 3.8 4 4v3.2c-1.5 0-2.9-.4-4-1.2v6.3a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 102 2.3V3h2.7z" },
  { name: "YouTube", href: "", path: "M21.6 8.2a2.6 2.6 0 00-1.8-1.9C18.2 6 12 6 12 6s-6.2 0-7.8.3a2.6 2.6 0 00-1.8 1.9C2 9.8 2 12 2 12s0 2.2.4 3.8a2.6 2.6 0 001.8 1.9C5.8 18 12 18 12 18s6.2 0 7.8-.3a2.6 2.6 0 001.8-1.9c.4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8zM10 15V9l5.2 3L10 15z" },
].filter((s) => s.href);

function Column({ title, links, className = "" }) {
  return (
    <div className={className}>
      <h3 className="font-[family-name:var(--font-tinos)] text-[14px] leading-none font-bold text-[#f1ece4]">{title}</h3>
      <ul className="mt-[9px] space-y-[9px]">
        {links.map((item) => (
          <li key={item.name} className="leading-none">
            <Link
              href={item.href}
              className="font-[family-name:var(--font-tinos)] text-[13px] md:text-[10.3px] text-[#d6cfc3] hover:text-[var(--fa-gold-hover)] transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Brand({ className = "" }) {
  return (
    <Link href="/" aria-label="French Aromas home" className={`inline-flex items-center gap-[12px] ${className}`}>
      <Image src="/images/home/v3/footer-fleur-mock-v2.webp" alt="" width={40} height={44} className="w-[38px] h-auto" />
      <span className="flex flex-col">
        <span className="font-[family-name:var(--font-tinos)] text-[22.6px] leading-none tracking-[0.03em] uppercase bg-[linear-gradient(180deg,#f3d699_0%,#c99a4c_100%)] bg-clip-text text-transparent">
          French Aromas
        </span>
        <span className="mt-[8px] font-[Arial,Helvetica,sans-serif] font-bold text-[6.6px] leading-none tracking-[0.2em] uppercase text-[#e9e2d6]">
          Inspired by French art of perfumery
        </span>
      </span>
    </Link>
  );
}

function NewsletterBlock({ email, setEmail, onSubmit }) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-tinos)] text-[14px] leading-none font-bold text-[#f1ece4]">Join Our Journey</h3>
      <p className="mt-[8px] font-[family-name:var(--font-tinos)] text-[11.5px] md:text-[11.3px] leading-none text-[#d6cfc3]">
        Be the first to know about new scents and exclusive offers.
      </p>
      <form onSubmit={onSubmit} className="mt-[11px] flex h-[39px] w-full max-w-[256px] md:max-w-none md:w-[18.7vw]">
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 min-w-0 rounded-l-[3px] bg-[#1f1f1f] border border-[#6f6250] border-r-0 px-[10px] font-[family-name:var(--font-tinos)] text-[12px] text-[#f1ece4] placeholder-[#a49b8e] focus:outline-none focus:border-[var(--fa-gold)] transition-colors"
          required
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="shrink-0 w-[41px] rounded-r-[3px] bg-[linear-gradient(180deg,#f2d7a6_0%,#d9b77c_100%)] text-[#2b2118] flex items-center justify-center hover:brightness-105 transition"
        >
          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
          </svg>
        </button>
      </form>
      <p className="mt-[16px] font-[family-name:var(--font-tinos)] italic text-[13px] leading-none tracking-[0.02em] text-[#d7b46e]">
        More Than a Fragrance — A Feeling
      </p>
    </div>
  );
}

function Socials({ className = "" }) {
  if (!SOCIALS.length) return null;
  return (
    <div className={`flex items-center gap-[15px] ${className}`}>
      {SOCIALS.map((s) => (
        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="text-white hover:text-[var(--fa-gold-hover)] transition-colors">
          <svg className="w-[19px] h-[19px]" viewBox="0 0 24 24" fill={s.stroke ? "none" : "currentColor"} stroke={s.stroke ? "currentColor" : "none"} strokeWidth={1.8} aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
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
    { name: "Contact", href: "/pages/contact" },
  ];

  const service = [
    { name: "Shipping", href: "/pages/shipping-policy" },
    { name: "Returns", href: "/pages/refund-policy" },
    { name: "FAQs", href: "/pages/faqs" },
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


  return (
    <>
      <footer className="relative overflow-hidden bg-[var(--fa-dark-deep)]">
        {/* Skyline art fading in from the right edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-[139px] w-[40vw] md:w-[13.8vw] bg-[url('/images/home/footer-paris-v1.webp')] bg-cover bg-center opacity-70 [mask-image:linear-gradient(90deg,transparent,black_55%)]"
        />

        {/* Desktop: one row, columns at the mockup's positions */}
        <div className="relative hidden md:grid h-[139px] grid-cols-[23.5vw_10.5vw_8.9vw_15.5vw_21.3vw_1fr] pl-[2.7vw] pt-[17px]">
          <Brand className="mt-[19px] self-start" />
          <Column title="Shop" links={shop} className="mt-[7px]" />
          <Column title="Company" links={company} className="mt-[7px]" />
          <Column title="Customer Service" links={service} className="mt-[7px]" />
          <NewsletterBlock email={email} setEmail={setEmail} onSubmit={handleSubscribe} />
          <Socials className="mt-[8px]" />
        </div>

        {/* Phones: the same content, stacked */}
        <div className="relative md:hidden px-5 pt-7 pb-6">
          <Brand />
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Column title="Shop" links={shop} />
            <Column title="Company" links={company} />
            <Column title="Customer Service" links={service} />
          </div>
          <div className="mt-7">
            <NewsletterBlock email={email} setEmail={setEmail} onSubmit={handleSubscribe} />
          </div>
          <Socials className="mt-5" />
        </div>

        <div className="relative border-t border-[var(--fa-gold)]/15">
          <div className="h-auto md:h-[53px] py-4 md:py-0 flex flex-col md:flex-row items-center gap-3 md:gap-0 px-5 md:pl-[2.85vw] font-[family-name:var(--font-tinos)] text-[13px] md:text-[13.5px] text-[#bdb6aa]">
            <p className="md:w-[33.95vw]">&copy; 2026 French Aromas. All rights reserved.</p>
            <div className="flex gap-[27px]">
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
