import Image from "next/image";
import Link from "next/link";

const SCENTS = [
  {
    name: "Fresh",
    tag: "Bright – Clean – Refreshing",
    img: "/images/home/new/scent-fresh.webp",
  },
  {
    name: "Fruity",
    tag: "Juicy – Vibrant – Playful",
    img: "/images/home/new/scent-fruity.webp",
  },
  {
    name: "Floral",
    tag: "Elegant – Romantic – Delicate",
    img: "/images/home/new/scent-floral.webp",
  },
  {
    name: "Spicy",
    tag: "Bold – Warm – Intense",
    img: "/images/home/new/scent-spicy.webp",
  },
  {
    name: "Woody",
    tag: "Warm – Earthy – Sophisticated",
    img: "/images/home/new/scent-woody.webp",
  },
  {
    name: "Musky",
    tag: "Soft – Sensual – Alluring",
    img: "/images/home/new/scent-musky.webp",
  },
  {
    name: "Aromatic",
    tag: "Herbal – Refined – Invigorating",
    img: "/images/home/new/scent-aromatic.webp",
  },
  {
    name: "Leather",
    tag: "Rich – Smoky – Sophisticated",
    img: "/images/home/new/scent-leather.webp",
  },
  {
    name: "Oriental (Amber)",
    tag: "Sweet – Warm – Indulgent",
    img: "/images/home/new/scent-oriental.webp",
  },
  {
    name: "Chypre",
    tag: "Elegant – Sophisticated – Timeless",
    img: "/images/home/new/scent-chypre.webp",
  },
];

export default function ShopByScentProfile() {
  return (
    <section className="relative bg-[#322e29] py-14 md:py-20 px-4 overflow-hidden">
      {/* faint mandala watermark */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_20%_30%,#c9a25a_0,transparent_40%),radial-gradient(circle_at_80%_75%,#c9a25a_0,transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-bold text-[#c9a25a]">
            Shop By Scent Profile
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-[#c9a25a]/70" />
          <p className="mt-4 text-[#d8d2c8] font-[family-name:var(--font-playfair)] text-sm md:text-lg">
            Find the fragrance that matches your style.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 justify-center gap-3.5 sm:gap-5">
          {SCENTS.map((s) => (
            <Link
              key={s.name}
              href={`/collections/shop-all?scentFamily=${encodeURIComponent(s.name)}`}
              className="group rounded-2xl bg-[#efece3] border border-[#e2dccb] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="px-3 pt-4 text-center">
                <h3 className="font-[family-name:var(--font-playfair)] italic text-lg sm:text-2xl font-bold text-[#2a2620] leading-none">
                  {s.name}
                </h3>
                <p className="mt-1.5 text-[9px] sm:text-[11px] tracking-wide text-[#8a7f6b] uppercase">
                  {s.tag}
                </p>
              </div>
              <div className="relative w-full aspect-square">
                <Image
                  src={s.img}
                  alt={s.name}
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 45vw, 30vw"
                />
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
