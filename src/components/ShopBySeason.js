import Image from "next/image";
import Link from "next/link";

const SEASONS = [
  {
    label: "WINTER & AUTUMN",
    img: "/images/home/new/season-winter-v2.webp",
    href: "/collections/shop-all?tags=autumn,winter",
  },
  {
    label: "SUMMER & SPRING",
    img: "/images/home/new/season-summer-v2.webp",
    href: "/collections/shop-all?tags=spring,summer",
  },
  {
    label: "ALL SEASONS (VERSATILE)",
    img: "/images/home/new/season-all-v2.webp",
    href: "/collections/shop-all?tags=all-seasons",
  },
];

export default function ShopBySeason() {
  return (
    <section className="bg-[#d4c6ab] py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-10 md:mb-14">
          <div className="text-center">
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#211d18]">
              Shop By Season
              </h2>
              {/* rule spans the title only — solid in the middle, fading at the ends */}
              <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,#211d18_25%,#211d18_75%,transparent_100%)]" />
            </div>
            <p className="mt-5 text-[#211d18] font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug">
              Discover the perfect expression for every time of year.
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {SEASONS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group block overflow-hidden border border-[#2a2620] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)]"
            >
              {/* title and copy are part of the artwork */}
              <div className="relative w-full aspect-square">
                <Image
                  src={s.img}
                  alt={s.label}
                  fill
                  className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
                  sizes="(max-width:640px) 90vw, 30vw"
                />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
