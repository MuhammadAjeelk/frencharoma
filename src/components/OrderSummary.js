"use client";

import Link from "next/link";

// No-decimals money, e.g. "Rs. 3,000"
const rs = (n) => `Rs. ${Math.round(n || 0).toLocaleString()}`;

// The Order Summary card — identical on the Add-to-Cart popup and the Cart page.
// Reads the shared `summary` object from CartContext so the numbers always match.
//
// Both hosts sit it on the warm light panel (#efe7db), so the type is ink on
// light throughout. `#15662f` is the savings green tuned for that ground — the
// old `text-green-600` only reached 2.7:1 against it.
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
      <div className="inline-block pb-3 mb-3">
        <h2 className="font-[family-name:var(--font-playfair)] italic text-xl font-normal text-[#211d18]">
          Order Summary
        </h2>
        <div className="mt-1.5 h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,#211d18_25%,#211d18_75%,transparent_100%)]" />
      </div>

      <div className="space-y-2.5 text-sm">
        {/* Total at full price */}
        <div className="flex justify-between gap-3 text-[#3f3931]">
          <span>
            Total Amount ({count} item{count !== 1 ? "s" : ""})
          </span>
          <span className="font-semibold text-[#211d18] whitespace-nowrap">{rs(totalOriginal)}</span>
        </div>

        {/* Trade discounts */}
        {perfumeDiscount > 0 && (
          <div className="flex justify-between gap-3 text-[#15662f]">
            <span className="font-semibold">
              Trade Discount on Perfume{perfumeUnits !== 1 ? "s" : ""}
            </span>
            <span className="font-semibold whitespace-nowrap">− {rs(perfumeDiscount)}</span>
          </div>
        )}

        {boxDiscount > 0 && (
          <div className="flex justify-between gap-3 text-[#15662f]">
            <span className="font-semibold leading-tight">
              Trade Discount on Discovery Box
              <span className="block text-[11px] font-medium text-[#15662f]/80">(Flat 40%)</span>
            </span>
            <span className="font-semibold whitespace-nowrap">− {rs(boxDiscount)}</span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between gap-3 text-[#211d18] pt-2 border-t border-[#211d18]/15">
          <span className="font-semibold">Subtotal</span>
          <span className="font-bold whitespace-nowrap">{rs(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between gap-3 text-[#211d18]">
          <span className="font-semibold">
            Shipping Charges{" "}
            {shippingFree && (
              <span className="font-semibold text-[#15662f]">(Saved {rs(200)})</span>
            )}
          </span>
          <span className={`font-semibold whitespace-nowrap ${shippingFree ? "text-[#15662f]" : "text-[#211d18]"}`}>
            {shipping === 0 ? "0" : rs(shipping)}
          </span>
        </div>

        {/* Bundle Offer Discount + per-perfume breakdown */}
        {perfumeUnits >= 1 && (
          <div>
            <div className="flex justify-between gap-3 text-[#15662f]">
              <span className="font-semibold">Bundle Offer Discount:</span>
              <span className="font-semibold whitespace-nowrap">{bundle.savings === 0 ? "0" : rs(bundle.savings)}</span>
            </div>
            <div className="mt-0.5 space-y-0.5 pl-3">
              {bundle.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between gap-3 text-[12px] text-[#1d7539]">
                  <span>({b.label}</span>
                  <span className="whitespace-nowrap">{b.saving === 0 ? "Rs. 000)" : `${rs(b.saving)})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free-shipping note for a lone Discovery Box */}
        {singleBoxOnly && (
          <div className="border border-[#c9a25a]/70 bg-[#e3d7c1] px-3 py-2.5 text-[12px] text-[#3f3931] leading-snug">
            <span className="font-bold text-[#211d18]">Note:</span> Free shipping is not available
            when your cart contains only one Discovery Box and no other products. Add any perfume or
            another discovery box to qualify for free shipping.
            <Link
              href="/pages/shipping-policy"
              className="block mt-1 font-semibold text-[#211d18] underline underline-offset-2 hover:text-[#6f5518] transition-colors"
            >
              Free Shipping Policy
            </Link>
          </div>
        )}
      </div>

      {/* Net Amount */}
      <div className="mt-4 bg-[#373838] px-4 py-3 flex justify-between items-center gap-3">
        <span className="font-semibold text-[#efe7db]">Net Amount:</span>
        <span className="font-bold text-lg text-[#c9a25a] whitespace-nowrap">{rs(netAmount)}</span>
      </div>

      {/* Net Savings */}
      {netSavings > 0 && (
        <div className="mt-2 bg-[#15662f] px-4 py-2.5 flex justify-between items-center gap-3">
          <span className="font-semibold text-[#e9f3ec]">Net Savings</span>
          <span className="font-bold text-[#e9f3ec] whitespace-nowrap">− {rs(netSavings)}</span>
        </div>
      )}
    </div>
  );
}
