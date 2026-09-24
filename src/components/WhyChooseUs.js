"use client";

import { useState } from "react";
import Image from "next/image";
import UniversalModal from "./UniversalModal";

// title, one-line blurb (card), icon (1–8), and rich modal details
const FEATURES = [
  {
    icon: 1,
    title: "FRENCH INGREDIENTS",
    blurb: "Crafted with original French ingredients.",
    heading: "French Ingredients",
    image: "/images/home/trust/french-ingredients-popup-v3.png",
  },
  {
    icon: 2,
    title: "40% CONCENTRATION",
    blurb: "Enhanced richness, projection, and lasting power.",
    heading: "High Concentration",
    image: "/images/home/trust/high-concentration-popup-v1.png",
  },
  {
    icon: 3,
    title: "LONG-LASTING",
    blurb: "Exceptionally long-lasting: 12 to 24 hours.",
    heading: "Long-Lasting",
    image: "/images/home/trust/long-lasting-popup-v1.png",
  },
  {
    icon: 4,
    title: "AFFORDABLE LUXURY",
    blurb: "Imported quality, at local price.",
    heading: "Affordable Luxury",
    image: "/images/home/trust/affordable-luxury-popup-v1.png",
  },
  {
    icon: 5,
    title: "100+ ICONIC IMPRESSIONS",
    blurb: "Crafted to capture the same character and vibes.",
    heading: "More Than 100 Iconic Fragrances",
    details: [
      "We craft **exceptional fragrance impressions** inspired by **more than 100** of the world's most celebrated designer and niche perfumes — luxurious scent profiles at exceptional value.",
      "Disclaimer: Our fragrances are independently crafted impressions. We are **not affiliated with, endorsed by, or associated with** any referenced designer brands. All trademarks are the property of their respective owners.",
    ],
  },
  {
    icon: 6,
    title: "SURPRISE GIFT IN EVERY BOX",
    blurb: "A little extra delight to make you smile.",
    heading: "Free Surprise Gift in Every Box",
    details: [
      "Every perfume you order comes with a **FREE surprise mini perfume** tucked inside the box — a little way of saying thank you, and a chance to discover another beautiful fragrance.",
    ],
  },
  {
    icon: 7,
    title: "FREE SHIPPING",
    blurb: "Countrywide free shipping on perfumes.",
    heading: "Free Shipping",
    image: "/images/home/trust/free-shipping-popup-v1.png",
  },
  {
    icon: 8,
    title: "TRUSTED BY CUSTOMERS",
    blurb: "A growing community choosing us for quality.",
    heading: "Trusted by Regular Customers",
    details: [
      "Our perfumes aren't just loved — they're **trusted by a loyal community of returning customers** who choose us again and again. Join them and experience the difference for yourself.",
    ],
  },
];

function renderInline(text, key) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${key}-${i}`} className="font-bold text-[#1f1a16]">{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${key}-${i}`}>{part}</span>
    ),
  );
}

// The trust strip under the hero — icon + two-line label, divided, in one row.
// Each strip item is a single supplied asset with its label baked in; `icon`
// only links the tile back to its FEATURES entry for the detail modal.
const STRIP = [
  { icon: 1, src: "/images/home/trust/french-ingredients.webp", w: 770, h: 340, icon_src: "/images/home/trust/french-ingredients-icon.webp", iw: 174, ih: 240 },
  { icon: 2, src: "/images/home/trust/high-concentration.webp", w: 874, h: 345, icon_src: "/images/home/trust/high-concentration-icon.webp", iw: 155, ih: 240 },
  { icon: 3, src: "/images/home/trust/long-lasting.webp", w: 972, h: 346, icon_src: "/images/home/trust/long-lasting-icon.webp", iw: 275, ih: 240 },
  { icon: 4, src: "/images/home/trust/affordable-luxury.webp", w: 893, h: 346, icon_src: "/images/home/trust/affordable-luxury-icon.webp", iw: 269, ih: 240 },
  { icon: 7, src: "/images/home/trust/free-shipping.webp", w: 581, h: 344, icon_src: "/images/home/trust/free-shipping.webp", iw: 581, ih: 344 },
];

export default function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;

  return (
    <section className="bg-[#373838] py-7 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-5 gap-x-1 sm:gap-x-2">
        {STRIP.map((item, i) => {
          const feature = FEATURES.find((f) => f.icon === item.icon);
          return (
            <div
              key={item.icon}
              className={`flex items-center justify-center px-2 md:px-4 ${
                i < STRIP.length - 1 ? "lg:border-r lg:border-black" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(FEATURES.indexOf(feature))}
                aria-label={feature?.title}
                className="group focus:outline-none"
              >
                <Image
                  src={item.icon_src}
                  alt={feature?.title || ""}
                  width={item.iw}
                  height={item.ih}
                  className="h-8 sm:h-9 md:h-10 w-auto lg:hidden transition-transform duration-300 group-hover:scale-105"
                />
                <Image
                  src={item.src}
                  alt={feature?.title || ""}
                  width={item.w}
                  height={item.h}
                  className="hidden lg:block lg:h-[60px] w-auto transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </div>
          );
        })}
      </div>

      <UniversalModal
        isOpen={openIndex != null}
        onClose={() => setOpenIndex(null)}
        heading={active?.heading || ""}
        artwork={active?.image}
      >
        {active && !active.image && (
          <div className="space-y-3">
            {active.details.map((para, idx) => (
              <p key={idx} className="text-[14px] text-[#4a4540] leading-relaxed">
                {renderInline(para, idx)}
              </p>
            ))}
          </div>
        )}
      </UniversalModal>
    </section>
  );
}
