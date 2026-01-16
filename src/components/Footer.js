"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const footerRef = useRef(null);

  const popularCollection = [
    { name: "BEST-SELLING", href: "/collections/best-seller-perfumes" },
    { name: "SHOP ALL", href: "/collections/shop-all" },
    { name: "COLLECTION", href: "/collections" },
    { name: "NEW ARRIVALS", href: "/collections/new-arrivals" },
    { name: "BRANDS", href: "/collections/top-brands" },
    { name: "GIFT SETS", href: "/collections/gift-sets" },
    { name: "BLOGS", href: "/blogs/blog" },
  ];

  const support = [
    { name: "ABOUT US", href: "/pages/about-us" },
    { name: "TERMS & CONDITIONS", href: "/pages/terms-conditions" },
    { name: "PRIVACY POLICY", href: "/pages/privacy-policy" },
    { name: "SHIPPING POLICY", href: "/pages/shipping-policy" },
    { name: "REFUND POLICY", href: "/pages/refund-policy" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if user is near footer (within 500px of footer start)
      const footerStart = documentHeight - windowHeight;
      const isNearFooter = scrollY >= footerStart - 500;

      // Check if user is in WhatMakesUsSpecial section
      // We'll check if scroll position is past a certain point
      // Assuming WhatMakesUsSpecial is roughly 80% down the page
      const whatMakesUsSpecialThreshold = documentHeight * 0.75;
      const isInWhatMakesUsSpecial = scrollY >= whatMakesUsSpecialThreshold;

      setShowScrollTop(isNearFooter || isInWhatMakesUsSpecial);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <footer
        ref={footerRef}
        className="bg-[#f5f5f0] text-gray-800 py-8 md:py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Popular Collection */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-900">
                POPULAR COLLECTION
              </h3>
              <ul className="space-y-2">
                {popularCollection.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-900">
                SUPPORT
              </h3>
              <ul className="space-y-2">
                {support.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-900">
                ADDRESS
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold">Divina Perfumes L.L.C.</p>
                <p>Gold Souq, Gate No. 2, Deira, Dubai, UAE.</p>
                <Link
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Get Location
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-900">
                CONTACT
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">EMAIL:</span>{" "}
                  <a
                    href="mailto:divinaperfume@gmail.com"
                    className="hover:text-gray-900 transition-colors"
                  >
                    divinaperfume@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">CALL & WHATSAPP:</span>{" "}
                  <a
                    href="tel:+971581031864"
                    className="hover:text-gray-900 transition-colors"
                  >
                    +971581031864
                  </a>
                </p>
                <div className="mt-3">
                  <p className="font-semibold mb-1">TIMMING:</p>
                  <p>09:00 AM to 2:00 PM</p>
                  <p>4:00 PM to 10:00 PM</p>
                  <p className="text-gray-600">(Sunday Closed)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="border-t border-gray-300 pt-6 md:pt-8 mt-6 md:mt-8">
            <div className="max-w-md mx-auto md:mx-0">
              <p className="text-sm font-medium text-gray-900 mb-3 text-center md:text-left">
                Subscribe for Offers & Deals.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-3 md:px-4 py-2 rounded hover:bg-gray-900 transition-colors flex-shrink-0"
                  aria-label="Subscribe"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Section */}
      <div className="bg-[#f5f5f0] border-t border-gray-300 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-xs md:text-sm text-gray-700 text-center md:text-left">
              © 2026, Linea De Bella | Divina Perfumes
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
              <div className="text-xs font-semibold text-gray-600">VISA</div>
              <div className="text-xs font-semibold text-gray-600">
                Mastercard
              </div>
              <div className="text-xs font-semibold text-green-600">Tabby</div>
              <div className="text-xs font-semibold text-gray-600">Mada</div>
              <div className="text-xs font-semibold text-gray-600">
                Apple Pay
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="https://www.facebook.com/lineadebellaofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 10.049C18 5.603 14.419 2 10 2s-8 3.603-8 8.049C2 14.067 4.925 17.396 8.75 18v-5.624H6.719v-2.328h2.03V8.275c0-2.017 1.195-3.132 3.023-3.132.874 0 1.79.158 1.79.158v1.98h-1.009c-.994 0-1.303.621-1.303 1.258v1.51h2.219l-.355 2.326H11.25V18c3.825-.604 6.75-3.933 6.75-7.951" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/linea_debella/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.23 3.492c-.84-.037-1.096-.046-3.23-.046-2.144 0-2.39.01-3.238.055-.776.027-1.195.164-1.487.273a2.4 2.4 0 0 0-.912.593 2.5 2.5 0 0 0-.602.922c-.11.282-.238.702-.274 1.486-.046.84-.046 1.095-.046 3.23s.01 2.39.046 3.229c.004.51.097 1.016.274 1.495.145.365.319.639.602.913.282.282.538.456.92.602.474.176.974.268 1.479.273.848.046 1.103.046 3.238.046s2.39-.01 3.23-.046c.784-.036 1.203-.164 1.486-.273.374-.146.648-.329.921-.602.283-.283.447-.548.602-.922.177-.476.27-.979.274-1.486.037-.84.046-1.095.046-3.23s-.01-2.39-.055-3.229c-.027-.784-.164-1.204-.274-1.495a2.4 2.4 0 0 0-.593-.913 2.6 2.6 0 0 0-.92-.602c-.284-.11-.703-.237-1.488-.273Zm.427 4.806a4.105 4.105 0 1 1 5.805 5.805 4.105 4.105 0 0 1-5.805-5.805m1.882 5.371a2.668 2.668 0 1 0 2.042-4.93 2.668 2.668 0 0 0-2.042 4.93m5.922-5.942a.958.958 0 1 1-1.355-1.355.958.958 0 0 1 1.355 1.355"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@lineadebella"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.511 1.705h2.74s-.157 3.51 3.795 3.768v2.711s-2.114.129-3.796-1.158l.028 5.606A5.073 5.073 0 1 1 8.213 7.56h.708v2.785a2.298 2.298 0 1 0 1.618 2.205z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
