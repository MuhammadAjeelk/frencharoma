"use client";

import { useState } from "react";
import Image from "next/image";
import UniversalModal from "./UniversalModal";

export default function WhatMakesUsSpecial() {
  const [openModalIndex, setOpenModalIndex] = useState(null);

  const features = [
    {
      title: "AFFORDABLE LUXURY",
      description: "Offering Luxury & Premium Perfumes at Affordable Price",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-affordable-luxury.png?v=1754059967&width=200",
      details: `Experience the finest luxury fragrances without breaking the bank. We believe everyone deserves access to premium perfumes crafted with the highest quality ingredients.

Our collection features:
• Premium designer-inspired fragrances
• Long-lasting scents that rival high-end brands
• Carefully curated selection of unique notes
• Affordable pricing without compromising quality
• Regular discounts and special offers`,
    },
    {
      title: "SAFE & SECURE PAYMENT",
      description: "High-Level 100% Safe & Secure Payment",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-safe-srecure-paymentt.png?v=1754060148&width=200",
      details: `Your security is our top priority. We use industry-leading encryption and security measures.

Payment Security Features:
• SSL encrypted transactions
• PCI DSS compliant processing
• Multiple secure payment options
• Cash on Delivery available

Accepted: Visa, Mastercard, JazzCash, EasyPaisa, Bank Transfer, COD`,
    },
    {
      title: "FAST SHIPPING",
      description: "Fast Shipping Across Pakistan via Top Couriers",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-fast-shipping-wordwide.png?v=1754060113&width=200",
      details: `We deliver quickly and safely to your doorstep across Pakistan.

• Express Shipping: 2-3 business days
• Standard Shipping: 3-5 business days
• Free shipping on orders over PKR 7,000
• Fully tracked & insured shipments`,
    },
    {
      title: "24/7 SUPPORT",
      description: "24/7 Customer Support via Chat, Call & Email",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-24-7-support.png?v=1754060130&width=200",
      details: `Our dedicated team is available around the clock.

How to reach us:
• WhatsApp: +971581031864
• Email: divinaperfume@gmail.com
• Live Chat on website
• Phone support during business hours`,
    },
    {
      title: "ORIGINAL FRENCH OILS",
      description: "100% Original French Perfume Oils in Every Bottle",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-affordable-luxury.png?v=1754059967&width=200",
      details: `We source only the finest French perfume oils for our impression fragrances.

• Imported directly from France
• Premium-grade essential oils
• Up to 35% perfume oil concentration
• 12-16 hours longevity on skin
• Same scent DNA as the originals`,
    },
    {
      title: "HANDMADE WITH CARE",
      description: "Each Bottle is Individually Crafted & Quality Checked",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-safe-srecure-paymentt.png?v=1754060148&width=200",
      details: `Every bottle goes through rigorous quality control.

• Handcrafted in small batches
• Individual quality inspection
• Precision filling & sealing
• Batch number tracking
• Elegantly packaged for gifting`,
    },
    {
      title: "EASY RETURNS",
      description: "Hassle-Free 7-Day Return Policy on Unopened Products",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-fast-shipping-wordwide.png?v=1754060113&width=200",
      details: `Shop with confidence — if you're not satisfied, we make returns easy.

• 7-day return window
• Unopened products eligible for full refund
• Free return shipping on defective items
• Quick refund processing (3-5 days)`,
    },
    {
      title: "FREE SAMPLE GIFT",
      description: "A Complimentary 5ml Tester in Every Order",
      image: "https://www.linea-debella.com/cdn/shop/files/icon-24-7-support.png?v=1754060130&width=200",
      details: `Every order comes with a surprise tester — our way of saying thank you!

• Choose your free 5ml sample at checkout
• Discover new scents with every order
• Premium glass vial packaging
• Try before you buy your next bottle`,
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12" style={{ color: "#1a1a2e" }}>
          WHAT MAKE US SPECIAL?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => setOpenModalIndex(index)}
              className="group relative bg-white rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 text-center cursor-pointer border border-gray-100"
            >
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16">
                  <Image src={feature.image} alt={feature.title} fill className="object-contain" sizes="64px" />
                </div>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-2 md:mb-3 uppercase">{feature.title}</h3>
              <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              <p className="text-[10px] text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap for details
              </p>
            </div>
          ))}
        </div>
      </div>

      {openModalIndex !== null && (
        <UniversalModal
          isOpen={openModalIndex !== null}
          onClose={() => setOpenModalIndex(null)}
          heading={features[openModalIndex]?.title}
          details={features[openModalIndex]?.details}
        />
      )}
    </div>
  );
}
