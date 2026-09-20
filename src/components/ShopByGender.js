import Image from "next/image";
import Link from "next/link";

const GENDERS = [
  {
    name: "Men",
    tag: "Bold & Refined",
    img: "/images/home/new/gender-men-v2.webp",
    href: "/collections/shop-all?gender=men",
  },
  {
    name: "Women",
    tag: "Elegant & Timeless",
    img: "/images/home/new/gender-women-v2.webp",
    href: "/collections/shop-all?gender=women",
  },
  {
    name: "Unisex",
    tag: "Beyond Boundaries",
    img: "/images/home/new/gender-unisex-v2.webp",
    href: "/collections/shop-all?gender=unisex",
  },
];

export default function ShopByGender() {
  return (
    <section className="bg-[#373838] py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-10 md:mb-14">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-normal text-[#c9a25a]">
              Shop By Gender
            </h2>
            <div className="mx-auto mt-2 h-[2px] md:h-[3px] w-24 md:w-36 bg-[#c9a25a]" />
            <p className="mt-5 text-[#d2c1ac] font-[family-name:var(--font-playfair)] text-lg md:text-[28px] leading-snug">
              Find the scent that reflects you.
            </p>
          </div>

          <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
            <Link
              href="/collections/shop-all"
              className="inline-flex items-center gap-2.5 rounded-md border border-[#d2c1ac]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[#efe7db] transition-colors hover:bg-[#d2c1ac] hover:text-[#211d18]"
            >
              View All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {GENDERS.map((g) => (
            <Link
              key={g.name}
              href={g.href}
              className="group relative block border-2 border-[#d1ae6d] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative w-full aspect-[550/477] overflow-hidden border-2 border-[#d1ae6d]">
                <Image
                  src={g.img}
                  alt={g.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 90vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              </div>

              {/* Animated line — draws left→right on hover with the tagline centered on it */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                <div className="relative h-4">
                  <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#c9a25a] w-10 group-hover:w-full transition-[width] duration-[650ms] ease-out" />
                  {/* px-1 keeps the drawn line 4px clear of the chip's border */}
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-1 bg-[linear-gradient(90deg,#14110e_0%,#373838_30%,#373838_70%,#14110e_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                    <span className="block px-2.5 py-0.5 border border-[#d1ae6d] text-[#c9a25a] text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.22em] whitespace-nowrap">
                      {g.tag}
                    </span>
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
