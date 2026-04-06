"use client";

import Image from "next/image";
import Link from "next/link";

export default function BundleOffers() {
  const offers = [
    {
      title: "Buy any 2",
      image:
        "https://saeedghani.pk/cdn/shop/files/AttarDeals_763d0c36-3f2e-4513-af47-05e4cd986b7f_300x.jpg?v=1758541409",
      items: [
        "If you buy any 2 perfumes",
        "Discount on 1st one is 10%",
        "Discount on 2nd one is 15%",
      ],
      discount: "15%",
      href: "/collections/shop-all?bundle=buy-2",
    },
    {
      title: "Buy any 3",
      image:
        "https://saeedghani.pk/cdn/shop/files/AttarDeals_300x.jpg?v=1758541419",
      items: [
        "If you buy any 3 perfumes",
        "Discount on 1st one is 10%",
        "Discount on 2nd one is 15%",
        "Discount on 3rd one is 20%",
      ],
      discount: "20%",
      href: "/collections/shop-all?bundle=buy-3",
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Save More, Smell Better
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          BUNDLE OFFERS
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-10 md:mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {offers.map((offer, index) => (
            <Link
              key={index}
              href={offer.href}
              className="group relative rounded-xl overflow-hidden bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full border border-[#e8e4df]"
            >
              {/* Discount Badge */}
              <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10 bg-[#1a1a2e] text-white text-sm md:text-base font-bold px-3.5 md:px-4 py-1.5 md:py-2 rounded-lg shadow-lg">
                Up to {offer.discount}
              </div>

              {/* Image */}
              <div className="relative w-full h-48 md:h-64">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="p-5 md:p-7 flex flex-col grow">
                <div className="mb-4 pb-4 border-b border-[#f0ece7]">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1a1a2e]">
                    {offer.title}
                  </h3>
                </div>

                <ul className="space-y-2.5 md:space-y-3 grow">
                  {offer.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-3 text-[13px] md:text-sm text-[#4a4540] shrink-0"
                    >
                      <svg
                        className="w-4 h-4 text-[#b8964e] mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-5 md:mt-7 w-full bg-[#1a1a2e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2d2d44] transition-colors duration-200 text-sm tracking-wide uppercase">
                  Shop Now
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
