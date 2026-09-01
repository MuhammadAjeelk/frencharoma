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
    <section className="relative bg-[#d4c6ab] py-14 md:py-20 px-4 overflow-hidden">
      {/* faint lotus watermark */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_15%_50%,#2a2620_0,transparent_35%),radial-gradient(circle_at_85%_55%,#2a2620_0,transparent_35%)]" />
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-bold text-[#2a2620]">
            Shop By Editions
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-[#2a2620]/60" />
          <p className="mt-4 text-[#4a4335] font-[family-name:var(--font-playfair)] text-sm md:text-lg">
            Crafted for every mood and moment.
          </p>
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
              {/* Bottom tagline banner */}
              <span className="absolute bottom-0 inset-x-0 bg-[#1c1a17]/85 text-[#e9dcc0] text-[10px] sm:text-[11px] font-semibold tracking-[0.1em] text-center py-2.5">
                {e.tag}
              </span>
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
