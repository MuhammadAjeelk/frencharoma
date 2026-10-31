import Link from "next/link";

// The button drawn over a piece of homepage art (see `cta` in
// src/lib/siteMedia.js). Its box and font are in percent of the art, and the
// art's wrapper is a size container (`@container`), so the button scales with
// the image and keeps the exact spot and proportions the mockup gives it at
// any screen width.
//
// Looks are the mockup's button styles, named for what they look like.
const LOOKS = {
  // Dark pill, thin gold rim, Times label — the wide cards and phone banners.
  "pill-dark":
    "rounded-full bg-[#261e17]/90 border-[#c8a35e] text-[#ecdab3] font-[family-name:var(--font-tinos)]",
  // Coral pill with a dark rim (For Women).
  "pill-coral":
    "rounded-full bg-[#ee8478] border-[#5a271d] text-[#2f130c] font-[family-name:var(--font-tinos)]",
  // Clear pill, gold rim, light label (Unisex).
  "pill-outline":
    "rounded-full bg-black/10 border-[#d6b67a] text-[#f3e6c9] font-[family-name:var(--font-tinos)]",
  // Clear pill, gold rim, gold label (Shop Luxury on its black ground).
  "pill-outline-gold":
    "rounded-full bg-transparent border-[#c8a35e] text-[#dcc28d] font-[family-name:var(--font-tinos)]",
  // Square-cornered dark buttons with sans labels (Special Offers, Discovery Box).
  "rect-dark":
    "rounded-[0.25cqw] bg-[#2b2118] border-[#8f7444] text-[#f1dfb8] font-semibold font-[Arial,Helvetica,sans-serif]",
  "rect-dark-caps":
    "rounded-[0.25cqw] bg-[#2b2118] border-[#c8a35e] text-[#f1dfb8] font-bold uppercase tracking-[0.02em] font-[Arial,Helvetica,sans-serif]",
  // Charcoal pill, white caps (Bundle Offers).
  "pill-gray-caps":
    "rounded-full bg-[#3b3938] border-[#3b3938] text-white font-bold uppercase tracking-[0.04em] font-[Arial,Helvetica,sans-serif]",
};

function Arrow() {
  return (
    <svg className="w-[1.05em] h-[1.05em] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h16m0 0l-5.5-5.5M19.5 12l-5.5 5.5" />
    </svg>
  );
}

// Re-expresses a button measured on the full art for a card that shows only
// part of it: `start` and `span` are the visible slice, in percent of width.
export function cropCta(cta, start, span) {
  const k = 100 / span;
  return { ...cta, x: (cta.x - start) * k, w: cta.w * k, size: cta.size * k };
}

// `href` makes the button its own link (the edition banner's two halves);
// without it the button is decoration inside a card that is already a link.
// `phone` is the button's box below md when the card is cropped differently
// there (see ArtCard); it defaults to the same box.
export default function Cta({ cta, phone = cta, href, className = "" }) {
  if (!cta) return null;
  const style = {
    "--l": `${phone.x}%`,
    "--t": `${phone.y}%`,
    "--w": `${phone.w}%`,
    "--h": `${phone.h}%`,
    "--f": `${phone.size}cqw`,
    "--l-md": `${cta.x}%`,
    "--t-md": `${cta.y}%`,
    "--w-md": `${cta.w}%`,
    "--h-md": `${cta.h}%`,
    "--f-md": `${cta.size}cqw`,
    borderWidth: "max(1px, 0.11cqw)",
  };
  const cls = `absolute z-10 left-[var(--l)] top-[var(--t)] w-[var(--w)] h-[var(--h)] text-[length:var(--f)] md:left-[var(--l-md)] md:top-[var(--t-md)] md:w-[var(--w-md)] md:h-[var(--h-md)] md:text-[length:var(--f-md)] flex items-center justify-center gap-[0.35em] whitespace-nowrap leading-none border transition-[filter] duration-200 group-hover:brightness-110 ${
    LOOKS[cta.look] || LOOKS["pill-dark"]
  } ${className}`;
  const body = (
    <>
      <span>{cta.label}</span>
      <Arrow />
    </>
  );

  return href ? (
    <Link href={href} aria-label={cta.label} className={`${cls} hover:brightness-110`} style={style}>
      {body}
    </Link>
  ) : (
    <span aria-hidden="true" className={cls} style={style}>
      {body}
    </span>
  );
}
