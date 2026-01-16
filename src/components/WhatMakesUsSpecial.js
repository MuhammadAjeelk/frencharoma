"use client";

import Image from "next/image";

export default function WhatMakesUsSpecial() {
  const features = [
    {
      title: "AFFORDABLE LUXURY",
      description: "Offering Luxury & Premium Perfumes at Affordable Price",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-affordable-luxury.png?v=1754059967&width=200",
    },
    {
      title: "SAFE & SECURE PAYMENT",
      description: "High-Level 100% Safe & Secure Payment",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-safe-srecure-paymentt.png?v=1754060148&width=200",
    },
    {
      title: "FAST SHIPPING WORLDWIDE",
      description: "Fast Shipping Worldwide via Top Courier Partner",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-fast-shipping-wordwide.png?v=1754060113&width=200",
    },
    {
      title: "24/7 SUPPORT",
      description: "24/7 Customer Support via Chat, Call & Email",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-24-7-support.png?v=1754060130&width=200",
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12"
          style={{ color: "#1a1a2e" }}
        >
          WHAT MAKE US SPECIAL?
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 text-center"
            >
              {/* Icon Image */}
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3 uppercase">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
