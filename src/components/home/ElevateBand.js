import Link from "next/link";

// Phones only: the closing call to action from the mobile mockup.
export default function ElevateBand() {
  return (
    <section className="md:hidden bg-[var(--fa-dark-deep)] px-4 py-6 text-center">
      <p className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--fa-gold-hover)]">Elevate Everyday</p>
      <p className="font-[family-name:var(--font-playfair)] text-base text-[var(--fa-on-dark)]">With French Aromas</p>
      <Link
        href="/collections/shop-all"
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--fa-gold)] px-8 py-2 text-sm text-[var(--fa-cream)] hover:bg-[var(--fa-gold)] hover:text-[var(--fa-ink)] transition-colors"
      >
        Shop Now
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
        </svg>
      </Link>
    </section>
  );
}
