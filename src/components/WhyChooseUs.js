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

export default function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;

  return (
    <section className="bg-[#322e29] py-14 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-bold text-[#c9a25a]">
            Why Choose French Aromas?
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-[#c9a25a]/70" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {FEATURES.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group flex flex-col items-center text-center rounded-xl border border-[#c9a25a]/55 bg-[#3a352e] px-4 py-6 sm:py-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a25a] hover:bg-[#413b33]"
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 mb-3 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={`/images/home/new/wc-${f.icon}.webp`}
                  alt={f.title}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <h3 className="text-[12px] sm:text-sm font-bold tracking-wide text-[#e9dcc0] leading-snug">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[10px] sm:text-[11px] text-[#a89f8d] leading-snug">
                {f.blurb}
              </p>
            </button>
          ))}
        </div>
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
