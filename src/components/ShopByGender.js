import Image from "next/image";
import Link from "next/link";

const GENDERS = [
  {
    name: "Men",
    tag: "Bold & Refined",
    img: "/images/home/new/gender-men.webp",
    href: "/collections/shop-all?gender=men",
  },
  {
    name: "Women",
    tag: "Elegant & Timeless",
    img: "/images/home/new/gender-women.webp",
    href: "/collections/shop-all?gender=women",
  },
  {
    name: "Unisex",
    tag: "Beyond Boundaries",
    img: "/images/home/new/gender-unisex.webp",
    href: "/collections/shop-all?gender=unisex",
  },
];

export default function ShopByGender() {
  return (
    <section className="bg-[#322e29] py-14 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-bold text-[#c9a25a]">
            Shop By Gender
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-[#c9a25a]/70" />
          <p className="mt-4 text-[#d8d2c8] font-[family-name:var(--font-playfair)] text-sm md:text-lg">
            Find the scent that reflects you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {GENDERS.map((g) => (
            <Link
              key={g.name}
              href={g.href}
              className="group relative block rounded-xl overflow-hidden border-2 border-[#c9a25a] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={g.img}
                  alt={g.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 90vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              </div>

              <span className="absolute top-3 left-4 font-[family-name:var(--font-playfair)] italic text-xl sm:text-2xl text-[#c9a25a] drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                {g.name}
              </span>

              {/* Animated line — draws left→right on hover with the tagline centered on it */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                <div className="relative h-4">
                  <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#c9a25a] w-0 group-hover:w-full transition-[width] duration-[650ms] ease-out" />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded bg-black/45 backdrop-blur-[2px] text-[#c9a25a] text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.22em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                    {g.tag}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/collections/shop-all"
            className="inline-flex items-center gap-2 bg-[#1c1a17] text-white border border-[#c9a25a]/60 px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-[0.14em] hover:bg-[#c9a25a] hover:text-[#1c1a17] transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
