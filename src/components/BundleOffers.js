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
    <div className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12"
          style={{ color: "#1a1a2e" }}
        >
          BUNDLE OFFERS
        </h2>

        {/* Bundle Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {offers.map((offer, index) => (
            <Link
              key={index}
              href={offer.href}
              className="group relative border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Discount Badge */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10 bg-red-600 text-white text-sm md:text-lg font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg">
                Up to {offer.discount}
              </div>

              {/* Image */}
              <div className="relative w-full h-48 md:h-64">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                {/* Header */}
                <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-200">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 underline">
                    {offer.title}
                  </h3>
                </div>

                {/* Offer Details */}
                <ul className="space-y-2 md:space-y-3 flex-grow">
                  {offer.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-gray-700"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0"
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

                {/* CTA Button - Always at bottom */}
                <button className="mt-4 md:mt-6 w-full bg-black text-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 text-sm md:text-base">
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
