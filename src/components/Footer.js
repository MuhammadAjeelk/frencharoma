"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// The rule under a heading: solid through the middle, fading at both ends.
// Same device the homepage sections use, sized to whatever sits above it.
function Rule({ className = "" }) {
  return (
    <div
      className={`h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)] ${className}`}
    />
  );
}

function Column({ title, children }) {
  return (
    <div>
      <div className="inline-block">
        <h3 className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a25a]">
          {title}
        </h3>
        <Rule className="mt-1.5" />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const shop = [
    { name: "Best Sellers", href: "/collections/shop-all?bestSeller=true" },
    { name: "Shop All", href: "/collections/shop-all" },
    { name: "Special Offers", href: "/collections/shop-all?specialOffer=true" },
    { name: "Discovery Box", href: "/collections/discovery-box" },
    { name: "Brands", href: "/collections/shop-all" },
    { name: "Blogs", href: "/blogs/blog" },
  ];

  const support = [
    { name: "About Us", href: "/pages/about-us" },
    { name: "Track Order", href: "/track-order" },
    { name: "Terms & Conditions", href: "/pages/terms-conditions" },
    { name: "Privacy Policy", href: "/pages/privacy-policy" },
    { name: "Shipping Policy", href: "/pages/shipping-policy" },
    { name: "Refund Policy", href: "/pages/refund-policy" },
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
    "text-[13px] text-[#cbbfae] hover:text-[#e3c489] transition-colors duration-200";

  return (
    <>
      <footer className="bg-[#373838] border-t-2 border-[#c9a25a] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Masthead */}
          <div className="text-center">
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-4xl font-normal text-[#c9a25a]">
                French Aromas
              </h2>
              <Rule className="mt-2" />
            </div>
            <p className="mt-4 font-[family-name:var(--font-playfair)] text-base md:text-lg text-[#cbbfae]">
              Luxury impressions, crafted to leave an impression that lasts.
            </p>
          </div>

          {/* Two navigation columns, then how to reach the shop */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Column title="Shop">
              <ul className="space-y-2.5">
                {shop.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={linkClass}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>

            <Column title="Support">
              <ul className="space-y-2.5">
                {support.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={linkClass}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>

            <Column title="Visit us">
              <div className="space-y-1.5 text-[13px] text-[#cbbfae]">
                <p>Gold Souq, Gate No. 2, Deira, Dubai, UAE.</p>
                <Link
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 pt-1 text-[#c9a25a] hover:text-[#e3c489] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Open in Maps
                </Link>
                <p className="pt-3 text-[#efe7db]">Open daily, except Sunday</p>
                <p>09:00 AM – 2:00 PM</p>
                <p>4:00 PM – 10:00 PM</p>
              </div>
            </Column>

            <Column title="Talk to us">
              <div className="space-y-1.5 text-[13px] text-[#cbbfae]">
                <a href="mailto:divinaperfume@gmail.com" className="block hover:text-[#e3c489] transition-colors">
                  divinaperfume@gmail.com
                </a>
                <a href="tel:+971581031864" className="block hover:text-[#e3c489] transition-colors">
                  +971 58 103 1864
                </a>
                <p className="pt-1 text-[#a99d8c]">Call or WhatsApp</p>
              </div>
            </Column>
          </div>

          {/* Newsletter — the double gold frame from the gender cards */}
          <div className="mt-12 border border-[#c9a25a]/60 p-1.5">
            <div className="border border-[#c9a25a]/30 px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a25a]">
                    Offers and new arrivals, now and then.
                  </p>
                  <p className="mt-1 text-[13px] text-[#a99d8c]">
                    No more than a couple of emails a month.
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
                  <label htmlFor="footer-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-[#211d18] border border-[#c9a25a]/40 px-4 py-2.5 text-[13px] text-[#efe7db] placeholder-[#a99d8c]/60 focus:outline-none focus:border-[#c9a25a] transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="shrink-0 border border-[#c9a25a] bg-[#c9a25a] px-6 py-2.5 text-[13px] font-semibold text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="bg-[#2e2e2e] border-t border-[#c9a25a]/20 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-[12px] text-[#a99d8c] text-center md:text-left">
              &copy; 2026, French Aromas
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <svg className="h-5 w-auto opacity-60" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="16" rx="3" fill="#1A1F71"/>
                <text x="24" y="11" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">VISA</text>
              </svg>
              <svg className="h-5 w-auto opacity-60" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="16" rx="3" fill="#333"/>
                <circle cx="19" cy="8" r="5" fill="#EB001B"/>
                <circle cx="29" cy="8" r="5" fill="#F79E1B"/>
                <circle cx="24" cy="8" r="3.2" fill="#FF5F00"/>
              </svg>
              <div className="h-5 px-2 bg-red-600/80 rounded flex items-center">
                <span className="text-white text-[8px] font-bold">JazzCash</span>
              </div>
              <div className="h-5 px-2 bg-green-600/80 rounded flex items-center">
                <span className="text-white text-[8px] font-bold">EasyPaisa</span>
              </div>
              <div className="h-5 px-2 bg-white/20 rounded flex items-center">
                <span className="text-white text-[8px] font-bold">COD</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/lineadebellaofficial" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#c9a25a] transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 10.049C18 5.603 14.419 2 10 2s-8 3.603-8 8.049C2 14.067 4.925 17.396 8.75 18v-5.624H6.719v-2.328h2.03V8.275c0-2.017 1.195-3.132 3.023-3.132.874 0 1.79.158 1.79.158v1.98h-1.009c-.994 0-1.303.621-1.303 1.258v1.51h2.219l-.355 2.326H11.25V18c3.825-.604 6.75-3.933 6.75-7.951" />
                </svg>
              </a>
              <a href="https://www.instagram.com/linea_debella/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#c9a25a] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.23 3.492c-.84-.037-1.096-.046-3.23-.046-2.144 0-2.39.01-3.238.055-.776.027-1.195.164-1.487.273a2.4 2.4 0 0 0-.912.593 2.5 2.5 0 0 0-.602.922c-.11.282-.238.702-.274 1.486-.046.84-.046 1.095-.046 3.23s.01 2.39.046 3.229c.004.51.097 1.016.274 1.495.145.365.319.639.602.913.282.282.538.456.92.602.474.176.974.268 1.479.273.848.046 1.103.046 3.238.046s2.39-.01 3.23-.046c.784-.036 1.203-.164 1.486-.273.374-.146.648-.329.921-.602.283-.283.447-.548.602-.922.177-.476.27-.979.274-1.486.037-.84.046-1.095.046-3.23s-.01-2.39-.055-3.229c-.027-.784-.164-1.204-.274-1.495a2.4 2.4 0 0 0-.593-.913 2.6 2.6 0 0 0-.92-.602c-.284-.11-.703-.237-1.488-.273Zm.427 4.806a4.105 4.105 0 1 1 5.805 5.805 4.105 4.105 0 0 1-5.805-5.805m1.882 5.371a2.668 2.668 0 1 0 2.042-4.93 2.668 2.668 0 0 0-2.042 4.93m5.922-5.942a.958.958 0 1 1-1.355-1.355.958.958 0 0 1 1.355 1.355" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@lineadebella" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#c9a25a] transition-colors" aria-label="TikTok">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.511 1.705h2.74s-.157 3.51 3.795 3.768v2.711s-2.114.129-3.796-1.158l.028 5.606A5.073 5.073 0 1 1 8.213 7.56h.708v2.785a2.298 2.298 0 1 0 1.618 2.205z" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-[#373838] border border-[#c9a25a] text-[#c9a25a] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:bg-[#c9a25a] hover:text-[#211d18] transition-colors duration-200"
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
