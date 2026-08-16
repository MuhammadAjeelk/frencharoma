"use client";

import { useState } from "react";
import Image from "next/image";
import UniversalModal from "./UniversalModal";

// Body copy uses **double asterisks** to mark bold phrases. A line starting
// with "### " is a sub-heading, "> " is a bullet, and "Disclaimer:" renders
// the word in red + bold with the rest in black.
const FEATURES = [
  {
    icon: "/images/why/original-oils.webp",
    title: "Original French Perfume Oils",
    details: [
      "We take pride in crafting our fragrances using **premium and original French perfume oils** sourced from **renowned fragrance houses**. These oils are known for their **exceptional purity, depth, and long-lasting performance** — far superior to synthetic or low-grade alternatives used in many mass-market perfumes.",
      "By blending **authentic French essences** with skilled formulation, we ensure each scent delivers a **rich, luxurious experience** that lingers beautifully on the skin.",
      "When you choose our perfumes, you're choosing **true quality, craftsmanship, and a touch of French elegance** in every spray.",
    ],
  },
  {
    icon: "/images/why/concentration.webp",
    title: "Up to 40% Concentration of Fragrance Oils",
    details: [
      "Our perfumes are crafted with **up to 40% concentration of premium fragrance oils**, offering **richness, depth, and impressive longevity**. Unlike many mass-produced scents that fade quickly, our formulas are carefully blended to deliver **long-lasting performance, luxurious projection, and a scent trail that truly stands out.**",
      "This **higher oil concentration** means each spray gives you a **more intense, refined, and enduring fragrance experience** — because quality should never be compromised when it comes to your signature scent.",
    ],
  },
  {
    icon: "/images/why/long-lasting.webp",
    title: "Long-Lasting Performance",
    details: [
      "Our perfumes are designed to **last from day to night** — because a beautiful fragrance should stay with you, not disappear after a few hours. With carefully balanced ingredients and a **rich concentration of high-quality fragrance oils**, every scent we craft is made to perform.",
      "These scents provide a **long-lasting aroma, a strong scent trail (sillage)**, and **deep layers** that unfold beautifully over time.",
      "**One spray goes a long way** — giving you **confidence and elegance** that lingers.",
    ],
  },
  {
    icon: "/images/why/affordable.webp",
    title: "Affordable Luxury",
    details: [
      "We believe **luxury shouldn't have to come with a luxury price tag**. That's why we craft perfumes using **premium ingredients, rich oil concentrations, and elegant, long-lasting formulas** — yet keep our prices **genuinely affordable**.",
      "With us, you're not paying for **flashy branding or celebrity hype** — you're paying for **pure quality and craftsmanship**.",
      "Experience the richness, depth, and sophistication of high-end fragrances, at prices that are truly within reach. So you can **feel the luxury vibes without the luxury price**.",
    ],
  },
  {
    icon: "/images/why/iconic-100.webp",
    title: "More Than 100 Iconic Fragrances",
    details: [
      "We craft **exceptional fragrance impressions** inspired by **more than 100** of the world's most celebrated designer and niche perfumes. Our collection captures the essence and character of iconic creations from renowned fragrance houses, allowing you to experience **luxurious scent profiles at exceptional value**.",
      "Our inspirations include legendary names such as ***Louis Vuitton, Christian Dior, Yves Saint Laurent, Chanel, Creed, Tom Ford, Parfums de Marly, Maison Francis Kurkdjian, Jean Paul Gaultier, Xerjoff***, and many more.",
      "Disclaimer: Our fragrances are independently crafted impressions inspired by well-known perfumes. We are **not affiliated with, endorsed by, or associated with** any of the referenced designer brands or fragrance houses. All trademarks and brand names are the property of their respective owners and are used solely for identification and comparison purposes.",
    ],
  },
  {
    icon: "/images/why/free-shipping.webp",
    title: "Countrywide Free Shipping",
    details: [
      "Enjoy a luxurious shopping experience from start to finish — and let us take care of the delivery! We're excited to offer **free shipping** on all perfume orders across Pakistan.",
      "Simply choose the fragrances you love, check out, and relax while we deliver them straight to your doorstep **at no additional charge**.",
      "Beautiful perfumes, seamless service, and savings that make your purchase easier.",
      "### Free Shipping Policy for Discovery Boxes",
      "Our **Discovery Box** is already offered at an exclusive **40% discount**, with no profit margin, to help you explore our fragrances at an exceptional value.",
      "Because of this, **free shipping is not available when your cart contains only one Discovery Box** and no other products.",
      "However, you can still enjoy **FREE shipping** if your order includes:",
      "> **2 or more Discovery Boxes**, or",
      "> **1 Discovery Box with minimum 1 perfume**.",
      "Thank you for your understanding and support—we're committed to bringing you the best fragrances at the best possible value.",
    ],
  },
  {
    icon: "/images/why/surprise-gift.webp",
    title: "Free Surprise Gift in Every Box",
    details: [
      "Every perfume you order comes with a **FREE surprise mini perfume** tucked inside the box.",
      "It's our little way of saying thank you for choosing us, while giving you the chance to discover another beautiful fragrance from our collection.",
      "A small gift. A new scent. A little extra joy — just for you.",
    ],
  },
  {
    icon: "/images/why/trusted.webp",
    title: "Trusted by Regular Customers",
    details: [
      "We're proud to say that our perfumes aren't just loved — they're **trusted by a loyal community of returning customers** who choose us again and again.",
      "Their continued support and positive feedback inspire us to keep delivering unmatched quality and unforgettable scents.",
      "From first-time buyers who become regulars to fragrance lovers who recommend us to friends and family, our growing community is proof that when quality speaks, people come back.",
      "Join them and experience the difference for yourself.",
    ],
  },
];

// Two-line title breaks for the cards (modal heading still uses the full title).
const TITLE_BREAKS = {
  "Original French Perfume Oils": ["Original French", "Perfume Oils"],
  "Up to 40% Concentration of Fragrance Oils": ["Up to 40% Concentration", "of Fragrance Oils"],
  "Long-Lasting Performance": ["Long-Lasting", "Performance"],
  "Affordable Luxury": ["Affordable", "Luxury"],
  "More Than 100 Iconic Fragrances": ["More Than 100", "Iconic Fragrances"],
  "Countrywide Free Shipping": ["Countrywide", "Free Shipping"],
  "Free Surprise Gift in Every Box": ["Free Surprise Gift", "in Every Box"],
  "Trusted by Regular Customers": ["Trusted by", "Regular Customers"],
};

// Render inline segments: ***bold-italic*** and **bold**.
function renderInline(text, keyPrefix) {
  return text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-bold italic text-[#1f1a16]">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-bold text-[#1f1a16]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

// One paragraph / sub-heading / bullet / disclaimer line.
function DetailBlock({ text, idx }) {
  if (text.startsWith("### ")) {
    return (
      <h4 className="text-[15px] font-bold text-[#1a1a2e] mt-2 pt-1">
        {text.slice(4)}
      </h4>
    );
  }
  if (text.startsWith("> ")) {
    return (
      <div className="flex gap-2 pl-1.5">
        <span className="text-[#b8964e] font-bold leading-relaxed">›</span>
        <p className="text-[14px] text-[#4a4540] leading-relaxed">
          {renderInline(text.slice(2), idx)}
        </p>
      </div>
    );
  }
  if (text.startsWith("Disclaimer:")) {
    return (
      <p className="text-[13px] text-[#1f1a16] leading-relaxed border-t border-[#f0ece7] pt-3 mt-1">
        <strong className="text-red-600 font-bold">Disclaimer:</strong>
        {renderInline(text.slice("Disclaimer:".length), idx)}
      </p>
    );
  }
  return (
    <p className="text-[14px] text-[#4a4540] leading-relaxed">
      {renderInline(text, idx)}
    </p>
  );
}

export default function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex != null ? FEATURES[openIndex] : null;

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-white via-[#faf8f5] to-white border-t border-[#f0ece7]">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-9 md:mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b8964e]/10 border border-[#b8964e]/30 text-[#b8964e] text-[10px] font-bold uppercase tracking-[0.22em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b8964e] animate-pulse" />
            The French Aromas Promise
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#1a1a2e] via-[#3a3550] to-[#1a1a2e] bg-clip-text text-transparent">
            Why Choose French Aromas
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-gradient-to-r from-transparent via-[#b8964e] to-transparent" />
        </div>

        {/* 8-card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative flex flex-col items-center text-center rounded-2xl border border-[#e8e4df] bg-white/90 backdrop-blur-sm px-4 pt-6 pb-8 sm:pt-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#b8964e] hover:shadow-[0_14px_36px_rgba(184,150,78,0.16)]"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 transition-transform duration-300 group-hover:scale-[1.08]">
                <Image
                  src={f.icon}
                  alt={f.title}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <h3 className="text-[13px] sm:text-sm font-bold text-[#1f1a16] leading-snug group-hover:text-[#b8964e] transition-colors">
                {TITLE_BREAKS[f.title] ? (
                  <>
                    {TITLE_BREAKS[f.title][0]}
                    <br />
                    {TITLE_BREAKS[f.title][1]}
                  </>
                ) : (
                  f.title
                )}
              </h3>
              {/* Learn More — reveals in the bottom-right corner on hover */}
              <span className="pointer-events-none absolute bottom-2.5 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#b8964e] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Learn More →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal — bigger icon, tight to the text */}
      <UniversalModal
        isOpen={openIndex != null}
        onClose={() => setOpenIndex(null)}
        heading={active?.title || ""}
      >
        {active && (
          <div className="flex flex-col">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-2">
              <Image
                src={active.icon}
                alt={active.title}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
            <div className="space-y-3">
              {active.details.map((para, idx) => (
                <DetailBlock key={idx} text={para} idx={idx} />
              ))}
            </div>
          </div>
        )}
      </UniversalModal>
    </section>
  );
}
