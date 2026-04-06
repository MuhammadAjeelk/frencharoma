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
    <div className="py-14 md:py-20 px-4 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-[#b8964e] uppercase tracking-[0.2em] text-center mb-2">
          Why Choose Us
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#1a1a2e] tracking-tight mb-2">
          WHAT MAKES US SPECIAL?
        </h2>
        <div className="w-10 h-[2px] bg-[#b8964e] mx-auto mb-10 md:mb-14" />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => setOpenModalIndex(index)}
              className="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 text-center cursor-pointer border border-[#e8e4df] hover:border-[#b8964e]/30"
            >
              <div className="flex justify-center mb-4">
                <div className="relative w-12 h-12 md:w-14 md:h-14 p-2 bg-[#faf8f5] rounded-xl group-hover:bg-[#f3efe8] transition-colors">
                  <Image src={feature.image} alt={feature.title} fill className="object-contain p-1" sizes="56px" />
                </div>
              </div>
              <h3 className="text-[11px] md:text-xs font-bold text-[#1a1a2e] mb-2 uppercase tracking-[0.06em]">{feature.title}</h3>
              <p className="text-[10px] md:text-[11px] text-[#8a847e] leading-relaxed">{feature.description}</p>
              <div className="mt-3 w-0 group-hover:w-6 h-[1.5px] bg-[#b8964e] mx-auto transition-all duration-300" />
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
