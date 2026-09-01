import Image from "next/image";
import Link from "next/link";

const SEASONS = [
  {
    label: "SUMMER & SPRING",
    desc: "Uplifting summer scents with remarkable freshness and lasting presence.",
    img: "/images/home/new/season-summer.webp",
    bg: "#e8efd9",
    border: "#c4d3a3",
    href: "/collections/shop-all?tags=spring,summer",
  },
  {
    label: "WINTER & AUTUMN",
    desc: "Deep, warm, and alluring fragrances for unforgettable winter moments.",
    img: "/images/home/new/season-winter.webp",
    bg: "#f3e7d2",
    border: "#dcc59c",
    href: "/collections/shop-all?tags=autumn,winter",
  },
  {
    label: "ALL SEASONS (VERSATILE)",
    desc: "Versatile fragrances crafted to complement every moment, mood, and season.",
    img: "/images/home/new/season-all.webp",
    bg: "#dcebf3",
    border: "#a8cbdd",
    href: "/collections/shop-all?tags=all-seasons",
  },
];

export default function ShopBySeason() {
  return (
    <section className="bg-[#d4c6ab] py-14 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-bold text-[#2a2620]">
            Shop By Season
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-[#2a2620]/60" />
          <p className="mt-4 text-[#4a4335] font-[family-name:var(--font-playfair)] text-sm md:text-lg">
            Discover the perfect expression for every time of year.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {SEASONS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-xl overflow-hidden border-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:-translate-y-1.5"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            >
              <div className="px-4 pt-4 text-center">
                <span className="inline-block bg-[#2a2620] text-[#c9a25a] text-[10px] sm:text-[11px] font-bold tracking-[0.12em] px-4 py-1.5 rounded-md border border-[#c9a25a]/50">
                  {s.label}
                </span>
                <p className="mt-3 text-[11px] sm:text-xs text-[#4a4335] leading-snug font-[family-name:var(--font-playfair)] px-1">
                  {s.desc}
                </p>
              </div>
              <div className="relative w-full aspect-square">
                <Image
                  src={s.img}
                  alt={s.label}
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 90vw, 30vw"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/collections/shop-all"
            className="inline-flex items-center gap-2 bg-[#2a2620] text-white border border-[#c9a25a]/60 px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-[0.14em] hover:bg-[#c9a25a] hover:text-[#1c1a17] transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
