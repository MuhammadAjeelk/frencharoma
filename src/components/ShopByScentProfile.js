import Image from "next/image";
import Link from "next/link";

import { SCENTS } from "@/lib/scentProfiles";


export default function ShopByScentProfile() {
  return (
    <section className="relative bg-[var(--fa-dark)] py-10 md:py-12 overflow-hidden">
      {/* faint mandala watermark */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_20%_30%,var(--fa-gold)_0,transparent_40%),radial-gradient(circle_at_80%_75%,var(--fa-gold)_0,transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-10 md:mb-14">
          <div className="text-center">
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
              Shop By Scent Profile
              </h2>
              {/* rule spans the title only — solid in the middle, fading at the ends */}
              <div className="mt-2 h-[2px] md:h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,var(--fa-gold)_25%,var(--fa-gold)_75%,transparent_100%)]" />
            </div>
            <p className="mt-5 text-[var(--fa-on-dark)] font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug">
              Find the fragrance that matches your style.
            </p>
          </div>

          <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
            <Link
              href="/collections/shop-all"
              className="inline-flex items-center gap-2.5 rounded-md border border-[var(--fa-on-dark)]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[var(--fa-cream)] transition-colors hover:bg-[var(--fa-on-dark)] hover:text-[var(--fa-ink)]"
            >
              View All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 justify-center gap-3.5 sm:gap-5">
          {SCENTS.map((s, i) => (
            <Link
              key={s.name}
              href={`/collections/shop-all?scentFamily=${encodeURIComponent(s.name)}`}
              className={`group block overflow-hidden border border-[var(--fa-gold)] shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)] ${
                i === SCENTS.length - 1 && SCENTS.length % 3 === 1 ? "sm:col-start-2" : ""
              }`}
            >
              {/* name and tagline are part of the artwork */}
              <div className="relative w-full aspect-square">
                <Image
                  src={s.img}
                  alt={s.name}
                  fill
                  className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
                  sizes="(max-width:640px) 45vw, 30vw"
                />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
