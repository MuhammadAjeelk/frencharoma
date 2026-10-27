"use client";

import { useState } from "react";
import Image from "next/image";
import UniversalModal from "./UniversalModal";
import { DEFAULT_MEDIA } from "@/lib/siteMedia";

// title, one-line blurb (card), icon (1–8), and rich modal details
const FEATURES = [
  {
    icon: 1,
    title: "FRENCH INGREDIENTS",
    blurb: "Crafted with original French ingredients.",
    heading: "French Ingredients",
    media: "frenchIngredients",
  },
  {
    icon: 2,
    title: "40% CONCENTRATION",
    blurb: "Enhanced richness, projection, and lasting power.",
    heading: "High Concentration",
    media: "highConcentration",
  },
  {
    icon: 3,
    title: "LONG-LASTING",
    blurb: "Exceptionally long-lasting: 12 to 24 hours.",
    heading: "Long-Lasting",
    media: "longLasting",
  },
  {
    icon: 4,
    title: "AFFORDABLE LUXURY",
    blurb: "Imported quality, at local price.",
    heading: "Affordable Luxury",
    media: "affordableLuxury",
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
    media: "freeShipping",
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
      <strong key={`${key}-${i}`} className="font-bold text-[var(--fa-ink)]">{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${key}-${i}`}>{part}</span>
    ),
  );
}

// The trust strip under the hero — icon + two-line label, divided, in one row.
// Each strip item is a single asset with its label baked in; `icon` links the
// tile back to its FEATURES entry for the detail modal.
const STRIP = [
  { icon: 1, id: "frenchIngredients" },
  { icon: 2, id: "highConcentration" },
  { icon: 3, id: "longLasting" },
  { icon: 4, id: "affordableLuxury" },
  { icon: 7, id: "freeShipping" },
];

// Images come from the admin-managed map: trust.<id>.strip (desktop, label
// baked in), trust.<id>.icon (phones and tablets) and trust.<id>.popup.
export default function WhyChooseUs({ media = DEFAULT_MEDIA }) {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;
  const activeArt = active?.media ? media[`trust.${active.media}.popup`]?.src : null;

  return (
    <section className="bg-[var(--fa-dark)] py-7 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-5 gap-x-1 sm:gap-x-2">
        {STRIP.map((item, i) => {
          const feature = FEATURES.find((f) => f.icon === item.icon);
          const strip = media[`trust.${item.id}.strip`];
          const icon = media[`trust.${item.id}.icon`];
          if (!strip?.src || !icon?.src) return null;
          return (
            <div
              key={item.icon}
              className={`flex items-center justify-center px-2 md:px-4 ${
                i < STRIP.length - 1 ? "lg:border-r lg:border-[var(--fa-gold)]/30" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(FEATURES.indexOf(feature))}
                aria-label={feature?.title}
                className="group focus:outline-none"
              >
                <Image
                  src={icon.src}
                  alt={feature?.title || ""}
                  width={icon.width}
                  height={icon.height}
                  className="h-8 sm:h-9 md:h-10 w-auto lg:hidden transition-transform duration-300 group-hover:scale-105"
                />
                <Image
                  src={strip.src}
                  alt={feature?.title || ""}
                  width={strip.width}
                  height={strip.height}
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
        artwork={activeArt}
      >
        {active && !activeArt && active.details && (
          <div className="space-y-3">
            {active.details.map((para, idx) => (
              <p key={idx} className="text-[14px] text-[var(--fa-secondary)] leading-relaxed">
                {renderInline(para, idx)}
              </p>
            ))}
          </div>
        )}
      </UniversalModal>
    </section>
  );
}
