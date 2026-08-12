"use client";

import Link from "next/link";

// No-decimals money, e.g. "Rs. 3,000"
const rs = (n) => `Rs. ${Math.round(n || 0).toLocaleString()}`;

// The Order Summary card — identical on the Add-to-Cart popup and the Cart page.
// Reads the shared `summary` object from CartContext so the numbers always match.
export default function OrderSummary({ summary, itemCount }) {
  const {
    totalOriginal,
    perfumeDiscount,
    boxDiscount,
    perfumeUnits,
    bundle,
    subtotal,
    shipping,
    shippingFree,
    singleBoxOnly,
    netAmount,
    netSavings,
  } = summary;

  const count = itemCount ?? 0;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 pb-3 mb-3 border-b border-gray-200">
        Order Summary
      </h2>

      <div className="space-y-2.5 text-sm">
        {/* Total at full price */}
        <div className="flex justify-between text-gray-700">
          <span>
            Total Amount ({count} item{count !== 1 ? "s" : ""})
          </span>
          <span className="font-semibold text-gray-900">{rs(totalOriginal)}</span>
        </div>

        {/* Trade discounts */}
        {perfumeDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="font-semibold">
              Trade Discount on Perfume{perfumeUnits !== 1 ? "s" : ""}
            </span>
            <span className="font-semibold">− {rs(perfumeDiscount)}</span>
          </div>
        )}

        {boxDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="font-semibold leading-tight">
              Trade Discount on Discovery Box
              <span className="block text-[11px] font-medium text-green-600/80">(Flat 40%)</span>
            </span>
            <span className="font-semibold">− {rs(boxDiscount)}</span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between text-gray-800 pt-2 border-t border-gray-100">
          <span className="font-semibold">Subtotal</span>
          <span className="font-bold">{rs(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-800">
          <span className="font-semibold">
            Shipping Charges{" "}
            {shippingFree && (
              <span className="font-semibold text-green-600">(Saved {rs(200)})</span>
            )}
          </span>
          <span className={`font-semibold ${shippingFree ? "text-green-600" : "text-gray-900"}`}>
            {shipping === 0 ? "0" : rs(shipping)}
          </span>
        </div>

        {/* Bundle Offer Discount + per-perfume breakdown */}
        {perfumeUnits >= 1 && (
          <div>
            <div className="flex justify-between text-green-600">
              <span className="font-semibold">Bundle Offer Discount:</span>
              <span className="font-semibold">{bundle.savings === 0 ? "0" : rs(bundle.savings)}</span>
            </div>
            <div className="mt-0.5 space-y-0.5 pl-3">
              {bundle.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-[12px] text-green-600/90">
                  <span>({b.label}</span>
                  <span>{b.saving === 0 ? "Rs. 000)" : `${rs(b.saving)})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free-shipping note for a lone Discovery Box */}
        {singleBoxOnly && (
          <div className="rounded-lg border border-[#c7c7e6] bg-[#f4f4fb] px-3 py-2.5 text-[12px] text-[#3a3a7a] leading-snug">
            <span className="font-bold">Note:</span> Free shipping is not available when your
            cart contains only one Discovery Box and no other products. Add any perfume or
            another discovery box to qualify for free shipping.
            <Link
              href="/pages/shipping-policy"
              className="block mt-1 font-bold text-[#b8964e] underline underline-offset-2"
            >
              Free Shipping Policy
            </Link>
          </div>
        )}
      </div>

      {/* Net Amount */}
      <div className="mt-4 rounded-lg bg-[#1a1a2e] text-white px-4 py-3 flex justify-between items-center">
        <span className="font-bold">Net Amount:</span>
        <span className="font-extrabold text-lg">{rs(netAmount)}</span>
      </div>

      {/* Net Savings */}
      {netSavings > 0 && (
        <div className="mt-2 rounded-lg bg-[#16a34a] text-white px-4 py-2.5 flex justify-between items-center">
          <span className="font-bold">Net Savings</span>
          <span className="font-extrabold">− {rs(netSavings)}</span>
        </div>
      )}
    </div>
  );
}
