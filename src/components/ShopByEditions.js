import Image from "next/image";
import Link from "next/link";

const EDITIONS = [
  {
    label: "LUXURY EDITION",
    tag: "MORE REFINED – MORE LONG-LASTING.",
    img: "/images/home/new/edition-luxury.webp",
    href: "/collections/shop-all?edition=luxury",
  },
  {
    label: "PREMIUM EDITION",
    tag: "EVERYDAY EXCELLENCE – AFFORDABLE PRICE.",
    img: "/images/home/new/edition-premium.webp",
    href: "/collections/shop-all?edition=premium",
  },
];

export default function ShopByEditions() {
  return (
    <section className="relative bg-[#d4c6ab] py-10 md:py-12 overflow-hidden">
      {/* faint lotus watermark */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_15%_50%,#2a2620_0,transparent_35%),radial-gradient(circle_at_85%_55%,#2a2620_0,transparent_35%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-10 md:mb-14">
          <div className="text-center">
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#211d18]">
              Shop By Editions
              </h2>
              {/* rule spans the title only — solid in the middle, fading at the ends */}
              <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,#211d18_25%,#211d18_75%,transparent_100%)]" />
            </div>
            <p className="mt-5 text-[#211d18] font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug">
              Crafted for every mood and moment.
            </p>
          </div>

          <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
            <Link
              href="/collections/shop-all"
              className="inline-flex items-center gap-2.5 rounded-md border border-[#2a2620]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[#211d18] transition-colors hover:bg-[#2a2620] hover:text-[#d4c6ab]"
            >
              View All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {EDITIONS.map((e) => (
            <Link
              key={e.label}
              href={e.href}
              className="group relative block rounded-xl overflow-hidden border-2 border-[#c9a25a] shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative w-full aspect-[1100/1236]">
                <Image
                  src={e.img}
                  alt={e.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 90vw, 45vw"
                />
              </div>
              {/* Top banner label */}
              <span className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#1c1a17]/90 text-[#c9a25a] text-[11px] sm:text-xs font-bold tracking-[0.16em] px-5 py-1.5 rounded-md border border-[#c9a25a]/60 whitespace-nowrap">
                {e.label}
              </span>
              {/* Bottom — animated line draws left→right on hover, tagline centered on it */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                <div className="relative h-4">
                  <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#c9a25a] w-10 group-hover:w-full transition-[width] duration-[650ms] ease-out" />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded bg-black/50 backdrop-blur-[2px] text-[#c9a25a] text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                    {e.tag}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
