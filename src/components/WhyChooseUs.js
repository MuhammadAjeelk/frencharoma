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
    heading: "Original French Perfume Oils",
    details: [
      "We craft our fragrances using **premium, original French perfume oils** sourced from **renowned fragrance houses** — known for **exceptional purity, depth, and long-lasting performance**.",
      "By blending **authentic French essences** with skilled formulation, each scent delivers a **rich, luxurious experience** that lingers beautifully on the skin.",
    ],
  },
  {
    icon: 2,
    title: "40% CONCENTRATION",
    blurb: "Enhanced richness, projection, and lasting power.",
    heading: "Up to 40% Concentration of Fragrance Oils",
    details: [
      "Our perfumes are crafted with **up to 40% concentration of premium fragrance oils**, offering **richness, depth, and impressive longevity** — a more intense, refined, and enduring fragrance experience.",
    ],
  },
  {
    icon: 3,
    title: "LONG-LASTING",
    blurb: "Exceptionally long-lasting: 12 to 24 hours.",
    heading: "Long-Lasting Performance",
    details: [
      "Designed to **last from day to night** — a **long-lasting aroma, a strong scent trail (sillage)**, and **deep layers** that unfold beautifully over time. **One spray goes a long way.**",
    ],
  },
  {
    icon: 4,
    title: "AFFORDABLE LUXURY",
    blurb: "Imported quality, at local price.",
    heading: "Affordable Luxury",
    details: [
      "**Luxury shouldn't come with a luxury price tag.** Premium ingredients, rich oil concentrations, and elegant, long-lasting formulas — kept **genuinely affordable**. Feel the luxury vibes without the luxury price.",
    ],
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
    heading: "Countrywide Free Shipping",
    details: [
      "Enjoy **free shipping** on all perfume orders across Pakistan. Choose the fragrances you love, check out, and relax while we deliver them to your doorstep **at no additional charge**.",
    ],
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
// `icon` maps to /images/home/new/wc-<n>.webp and to the FEATURES entry for the modal.
const STRIP = [
  { icon: 1, lines: ["French", "Ingredients"] },
  { icon: 2, lines: ["High", "Concentration"] },
  { icon: 3, lines: ["Long-Lasting", "12 to 24 hrs"] },
  { icon: 4, lines: ["Long-Lasting", "12 to 24 hrs"] },
  { icon: 7, lines: [], wide: true }, // the truck art already reads FREE SHIPPING
];

export default function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;

  return (
    <section className="bg-[#373838] py-7 md:py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-7">
        {STRIP.map((item, i) => {
          const feature = FEATURES.find((f) => f.icon === item.icon);
          return (
            <div
              key={item.icon}
              className={`flex items-center justify-center px-2 md:px-4 ${
                i < STRIP.length - 1 ? "md:border-r md:border-black" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(FEATURES.indexOf(feature))}
                aria-label={feature?.title}
                className="group flex items-center gap-3 md:gap-4 focus:outline-none"
              >
                <span
                  className={`relative shrink-0 h-12 w-12 md:h-14 ${
                    item.wide ? "md:w-20" : "md:w-14"
                  } transition-transform duration-300 group-hover:scale-110`}
                >
                  <Image
                    src={`/images/home/new/wc-${item.icon}.webp`}
                    alt={feature?.title || ""}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </span>
                {item.lines.length > 0 && (
                  <span className="text-left text-[15px] md:text-[17px] leading-tight text-[#d1ae6d] transition-colors duration-200 group-hover:text-[#e3c489]">
                    {item.lines.map((line) => (
                      <span key={line} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <UniversalModal
        isOpen={openIndex != null}
        onClose={() => setOpenIndex(null)}
        heading={active?.heading || ""}
      >
        {active && (
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
