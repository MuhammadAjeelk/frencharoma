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

// The trust strip under the hero, from the 2026-10 mockups.
// - Desktop: six tiles in one centred row, 71px tall in the 1369px mockup with
//   48px between them and a divider in each gap — kept in vw so the row holds
//   those proportions at any width.
// - Phones: two rows of three, each tile 41px tall, dividers between columns.
// Most tiles are one image with the label drawn in; "Trusted by Customers" is
// an icon with its label set as text. `icon` links a tile to its FEATURES
// entry for the popup.
const STRIP = [
  { icon: 1, id: "frenchIngredients" },
  { icon: 2, id: "highConcentration" },
  { icon: 3, id: "longLasting" },
  { icon: 4, id: "affordableLuxury" },
  { icon: 8, id: "trusted", label: ["Trusted by", "Customers"] },
  { icon: 7, id: "freeShipping" },
];

function Tile({ item, media, onOpen }) {
  const feature = FEATURES.find((f) => f.icon === item.icon);
  const art = media[item.label ? `trust.${item.id}.icon` : `trust.${item.id}.strip`];
  if (!art?.src) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(FEATURES.indexOf(feature))}
      aria-label={feature?.heading}
      className="group flex h-full items-center gap-[var(--tile-gap)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fa-gold-hover)]"
    >
      <Image
        src={art.src}
        alt={item.label ? "" : feature?.heading || ""}
        width={art.width}
        height={art.height}
        className="h-full w-auto transition-[filter] duration-300 group-hover:brightness-110"
      />
      {item.label && (
        <span className="text-left font-[family-name:var(--font-carlito)] text-[length:var(--tile-label)] leading-[1.18] text-[#cdaa63]">
          {item.label[0]}
          <br />
          {item.label[1]}
        </span>
      )}
    </button>
  );
}

// Images come from the admin-managed map: trust.<id>.strip (or .icon for the
// text-label tile) and trust.<id>.popup.
export default function WhyChooseUs({ media = DEFAULT_MEDIA }) {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;
  const activeArt = active?.media ? media[`trust.${active.media}.popup`]?.src : null;

  return (
    <section className="bg-[var(--fa-home-phone-dark)] md:bg-[var(--fa-dark)]">
      {/* Phones: 2 × 3 */}
      <ul
        className="md:hidden grid grid-cols-3 gap-y-[23px] pt-[10px] pb-[12px] [--tile-label:13.5px] [--tile-gap:8px]"
        aria-label="Why French Aromas"
      >
        {STRIP.map((item, i) => (
          <li
            key={item.id}
            className={`relative flex h-[41px] justify-center ${
              i % 3 ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[37px] before:w-px before:bg-[#cdaa63]/45" : ""
            }`}
          >
            <Tile item={item} media={media} onOpen={setOpenIndex} />
          </li>
        ))}
      </ul>

      {/* Desktop: one row */}
      <ul
        className="hidden md:flex items-center justify-center h-[7.96vw] [--tile-label:1.76vw] [--tile-gap:1.17vw]"
        aria-label="Why French Aromas"
      >
        {STRIP.map((item, i) => (
          <li key={item.id} className="flex items-center h-[5.19vw]">
            {i > 0 && <span aria-hidden="true" className="mx-[1.75vw] h-[4.4vw] w-px bg-[#cdaa63]/40" />}
            <Tile item={item} media={media} onOpen={setOpenIndex} />
          </li>
        ))}
      </ul>

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
