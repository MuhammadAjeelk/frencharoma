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
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-affordable-luxury.png?v=1754059967&width=200",
      details: `Experience the finest luxury fragrances without breaking the bank. We believe everyone deserves access to premium perfumes crafted with the highest quality ingredients.

Our collection features:
• Premium designer-inspired fragrances
• Long-lasting scents that rival high-end brands
• Carefully curated selection of unique notes
• Affordable pricing without compromising quality
• Regular discounts and special offers

We source our fragrances from trusted suppliers and ensure each bottle meets our strict quality standards. Whether you're looking for a signature scent or exploring new fragrances, we make luxury accessible to all.`,
    },
    {
      title: "SAFE & SECURE PAYMENT",
      description: "High-Level 100% Safe & Secure Payment",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-safe-srecure-paymentt.png?v=1754060148&width=200",
      details: `Your security is our top priority. We use industry-leading encryption and security measures to protect your personal and payment information.

Payment Security Features:
• SSL encrypted transactions
• PCI DSS compliant payment processing
• Multiple secure payment options
• No storage of sensitive card information
• Secure checkout process

Accepted Payment Methods:
• Credit & Debit Cards (Visa, Mastercard, Amex)
• PayPal
• Bank Transfer
• Cash on Delivery (select regions)

Your payment information is processed securely through trusted payment gateways. We never store your full card details, ensuring maximum protection for your financial data.`,
    },
    {
      title: "FAST SHIPPING WORLDWIDE",
      description: "Fast Shipping Worldwide via Top Courier Partner",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-fast-shipping-wordwide.png?v=1754060113&width=200",
      details: `We deliver your favorite fragrances quickly and safely to your doorstep, no matter where you are in the world.

Shipping Options:
• Express Shipping: 2-5 business days
• Standard Shipping: 5-10 business days
• International Shipping: 10-15 business days
• Free shipping on orders over PKR 200

Our Shipping Partners:
• DHL Express
• FedEx
• Local courier services
• Tracked delivery for all orders

We carefully package each order to ensure your perfumes arrive in perfect condition. All shipments are fully insured and tracked, so you can monitor your order every step of the way.`,
    },
    {
      title: "24/7 SUPPORT",
      description: "24/7 Customer Support via Chat, Call & Email",
      image:
        "https://www.linea-debella.com/cdn/shop/files/icon-24-7-support.png?v=1754060130&width=200",
      details: `Our dedicated customer support team is available around the clock to assist you with any questions or concerns.

How to Reach Us:
• Live Chat: Available 24/7 on our website
• Phone: +971 XX XXX XXXX (24/7)
• Email: support@frencharomas.com
• WhatsApp: Available for instant messaging

We're Here to Help With:
• Product inquiries and recommendations
• Order tracking and status updates
• Returns and exchanges
• Fragrance consultation
• Technical support
• General questions

Our friendly and knowledgeable team is committed to providing exceptional service and ensuring your complete satisfaction. Don't hesitate to reach out - we're always here to help!`,
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
              onClick={() => setOpenModalIndex(index)}
              className="group relative bg-white rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
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

              {/* Click indicator */}
              <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click for more info
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
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
