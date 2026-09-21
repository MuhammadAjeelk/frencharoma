"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { genderMeta, GENDER_ON_DARK } from "@/lib/gender";
import OrderSummary from "@/components/OrderSummary";
import { Rule } from "@/components/ui/SectionHeading";
import { GUTTER, FIELD_DARK, FOCUS_RING, FOCUS_RING_LIGHT } from "@/lib/design";
import Image from "next/image";
import Link from "next/link";

const EDITION_LABEL = {
  luxury: "Luxury Edition",
  premium: "Premium Edition",
  classic: "Classic Edition",
};

const rs = (n) => `Rs. ${Math.round(n).toLocaleString()}`;

// ── A single perfume line — full detail + price breakup (spec pt 2/6) ────────
function CartItemRow({ item, updateQuantity, removeItem }) {
  const gm = genderMeta(item.gender);
  const orig = item.originalPrice != null ? item.originalPrice : item.price;
  const hasDisc = orig > item.price;
  const disc =
    Number(item.discountPercent) ||
    (hasDisc ? Math.round((1 - item.price / orig) * 100) : 0);
  const lineOriginal = orig * item.quantity;
  const lineSubtotal = item.price * item.quantity;
  const lineDiscount = lineOriginal - lineSubtotal;
  const editionLabel =
    EDITION_LABEL[item.edition] ||
    (item.edition
      ? item.edition.charAt(0).toUpperCase() + item.edition.slice(1)
      : "");

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden bg-[#2e2e2e] border border-[#d1ae6d]">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#a99d8c]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`}>
          <h3 className="font-semibold text-[#efe7db] text-sm sm:text-base hover:text-[#e3c489] transition-colors leading-snug break-words">
            {item.name}
            {gm && (
              <>
                {" – "}
                <span className={`font-semibold ${GENDER_ON_DARK[item.gender] || "text-[#cbbfae]"}`}>
                  {gm.label}
                </span>
              </>
            )}
          </h3>
        </Link>

        {item.impressionName && (
          <p className="text-xs sm:text-sm text-[#a99d8c] mt-1 break-words">
            Impression of:{" "}
            <span className="font-semibold text-[#cbbfae]">{item.impressionName}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {editionLabel && (
            <span className="text-[11px] font-semibold text-[#211d18] bg-[#c9a25a] px-2.5 py-0.5 rounded-full">
              Edition: {editionLabel}
            </span>
          )}
          {item.size && (
            <span className="text-[11px] font-semibold text-[#cbbfae] border border-[#c9a25a]/45 px-2.5 py-0.5 rounded-full">
              Size: {item.size}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-[#c9a25a]/50">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className={`w-9 h-9 flex items-center justify-center text-lg leading-none text-[#c9a25a] hover:bg-[#c9a25a] hover:text-[#211d18] transition-colors ${FOCUS_RING}`}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 h-9 flex items-center justify-center text-sm font-semibold text-[#efe7db] min-w-[2.5rem] border-x border-[#c9a25a]/50">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className={`w-9 h-9 flex items-center justify-center text-lg leading-none text-[#c9a25a] hover:bg-[#c9a25a] hover:text-[#211d18] transition-colors ${FOCUS_RING}`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price breakup (spec pt 5 mock) */}
      <div className="sm:text-right shrink-0 sm:w-44 border-t sm:border-t-0 border-[#c9a25a]/20 pt-3 sm:pt-0">
        <div className="text-xl font-bold text-[#c9a25a] leading-tight">
          {rs(lineSubtotal)}
        </div>
        {hasDisc && (
          <>
            <div className="text-sm text-[#a99d8c] line-through leading-tight">
              {rs(lineOriginal)}
            </div>
            <div className="mt-1.5 text-sm font-semibold text-[#8fd3a3] leading-tight">
              Savings {disc}%
            </div>
            <div className="text-sm font-semibold text-[#8fd3a3] leading-tight">
              {rs(lineDiscount)}
            </div>
          </>
        )}
        <button
          onClick={() => removeItem(item.id)}
          className={`mt-2.5 text-xs text-[#e8a19a] hover:text-[#f2bab4] font-semibold transition-colors inline-flex items-center gap-1 sm:justify-end ${FOCUS_RING}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove
        </button>
      </div>
    </div>
  );
}

// ── A Discovery Box shown as one combined line ───────────────────────────────
function DiscoveryBoxCard({ box, removeItem }) {
  const orig = box.items.reduce(
    (s, i) => s + (i.originalPrice != null ? i.originalPrice : i.price) * i.quantity,
    0,
  );
  const total = box.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const disc = orig > total ? Math.round((1 - total / orig) * 100) : 0;

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-[family-name:var(--font-playfair)] italic text-base text-[#c9a25a]">
            Discovery Box {box.number}
          </span>
          <span className="text-xs text-[#a99d8c]">
            {box.items.length} × 5ml{disc > 0 ? ` · ${disc}% off` : ""}
          </span>
        </div>
        <button
          onClick={() => box.items.forEach((i) => removeItem(i.id))}
          className={`text-xs text-[#e8a19a] hover:text-[#f2bab4] font-semibold transition-colors flex items-center gap-1 ${FOCUS_RING}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove box
        </button>
      </div>

      {/* Double gold frame — the device the footer newsletter panel uses */}
      <div className="border border-[#c9a25a]/60 p-1.5">
        <div className="border border-[#c9a25a]/30 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {box.items.map((i, idx) => (
              <div key={i.id} className="flex items-center gap-2.5 bg-[#2e2e2e] border border-[#c9a25a]/25 p-1.5">
                <Link href={`/products/${i.slug}`} className="relative w-12 h-12 overflow-hidden bg-[#373838] border border-[#c9a25a]/30 shrink-0">
                  {i.image ? (
                    <Image src={i.image} alt={i.name} fill className="object-cover" sizes="48px" />
                  ) : null}
                  <span className="absolute top-0 left-0 w-4 h-4 bg-[#c9a25a] text-[#211d18] flex items-center justify-center text-[10px] font-bold leading-none">
                    {idx + 1}
                  </span>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${i.slug}`}>
                    <p className="text-xs font-semibold text-[#efe7db] truncate hover:text-[#e3c489] transition-colors">{i.name}</p>
                  </Link>
                  <p className="text-[11px] text-[#a99d8c]">5ml · {rs(i.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#c9a25a]/25">
            <span className="text-xs text-[#a99d8c]">Box total</span>
            <span className="flex items-baseline gap-2">
              {disc > 0 && <span className="text-xs text-[#a99d8c] line-through">{rs(orig)}</span>}
              <span className="text-sm font-bold text-[#c9a25a]">{rs(total)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    itemCount,
    summary,
    removeItem,
    updateQuantity,
    hydrated,
  } = useCart();

  const [note, setNote] = useState("");

  // Persist the order note so it survives navigation / can be read at checkout
  useEffect(() => {
    try {
      setNote(localStorage.getItem("fa_order_note") || "");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("fa_order_note", note);
    } catch {}
  }, [note]);

  const qualifiesFreeShip = itemCount > 0 && summary.shippingFree;

  // Ordering (spec pt 5): all perfumes first, then all discovery boxes.
  const perfumeGroups = [];
  const boxGroups = [];
  const boxSlot = new Map();
  let boxNo = 0;
  for (const item of items) {
    if (item.isDiscoveryBox && item.boxId) {
      if (boxSlot.has(item.boxId)) {
        boxGroups[boxSlot.get(item.boxId)].items.push(item);
      } else {
        boxNo += 1;
        boxSlot.set(item.boxId, boxGroups.length);
        boxGroups.push({ type: "box", boxId: item.boxId, number: boxNo, items: [item] });
      }
    } else {
      perfumeGroups.push({ type: "item", item });
    }
  }
  const cartGroups = [...perfumeGroups, ...boxGroups];

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#373838]">
        <div className="w-8 h-8 border-2 border-[#c9a25a]/25 border-t-[#c9a25a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#373838]">
      {/* Page header — the light band, the way the homepage opens a light section */}
      <div className="bg-[#d4c6ab] py-8 md:py-12 text-center">
        <div className={GUTTER}>
          <nav className="flex justify-center items-center gap-2 text-xs text-[#211d18]/70 mb-3">
            <Link href="/" className="hover:text-[#211d18] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#211d18] font-medium">Cart</span>
          </nav>
          <div className="inline-block">
            <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#211d18]">
              Your Cart
            </h1>
            <Rule color="#211d18" className="mt-2" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center">
            <svg className="w-20 h-20 text-[#c9a25a]/40 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-3xl font-normal text-[#c9a25a]">
                Your cart is empty
              </h2>
              <Rule className="mt-2" />
            </div>
            <p className="text-[#cbbfae] mt-5 mb-7 text-sm max-w-sm">
              Discover our luxury fragrances and add them to your cart.
            </p>
            <Link
              href="/collections/shop-all"
              className={`border border-[#c9a25a] bg-[#c9a25a] px-8 py-3 text-sm font-semibold text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] transition-colors ${FOCUS_RING}`}
            >
              Shop All Perfumes
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 min-w-0">
              {/* Free shipping banner (spec pt 1) */}
              {qualifiesFreeShip ? (
                <div className="flex items-center gap-2 border border-[#8fd3a3]/45 bg-[#2f4436] px-4 py-3 mb-4">
                  <svg className="w-5 h-5 text-[#8fd3a3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-[#a9e0ba]">
                    You have qualified for free shipping.
                  </p>
                </div>
              ) : (
                summary.singleBoxOnly && (
                  <div className="border border-[#c9a25a]/45 bg-[#43392a] px-4 py-3 mb-4">
                    <p className="text-sm text-[#e6cf9e]">
                      Add any perfume or another Discovery Box to qualify for{" "}
                      <span className="font-semibold text-[#f0dcb2]">FREE shipping</span>.
                    </p>
                  </div>
                )
              )}

              <div className="divide-y divide-[#c9a25a]/20 border-y border-[#c9a25a]/20">
                {cartGroups.map((g) =>
                  g.type === "box" ? (
                    <DiscoveryBoxCard key={g.boxId} box={g} removeItem={removeItem} />
                  ) : (
                    <CartItemRow
                      key={g.item.id}
                      item={g.item}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                    />
                  )
                )}
              </div>

              {/* Order Note (spec pt 3) */}
              <div className="mt-6">
                <label htmlFor="order-note" className="block text-sm font-semibold text-[#efe7db] mb-2">
                  Order Note
                </label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add any instructions for your order (e.g. gift wrap, delivery preference)…"
                  className={`w-full px-3.5 py-2.5 text-sm resize-y ${FIELD_DARK} ${FOCUS_RING}`}
                />
              </div>
            </div>

            {/* Order Summary (spec pt 4) — a light panel on the dark ground */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="border border-[#c9a25a] bg-[#efe7db] p-5 sm:p-6 static lg:sticky lg:top-24">
                <OrderSummary summary={summary} itemCount={itemCount} />

                {/* Proceed to Checkout */}
                <Link
                  href="/checkout"
                  className={`w-full mt-5 border border-[#c9a25a] bg-[#c9a25a] text-[#211d18] py-3.5 font-semibold text-sm hover:bg-[#e3c489] hover:border-[#e3c489] transition-colors text-center block ${FOCUS_RING_LIGHT}`}
                >
                  Proceed to Checkout
                </Link>

                {/* Continue Shopping (spec pt 2) — outlined, with the idle arrow */}
                <Link
                  href="/collections/shop-all"
                  className={`group w-full mt-3 border border-[#211d18]/70 text-[#211d18] py-3 font-semibold text-sm hover:bg-[#211d18] hover:text-[#efe7db] transition-colors text-center flex items-center justify-center gap-2 ${FOCUS_RING_LIGHT}`}
                >
                  <svg className="w-4 h-4 animate-bobX group-hover:animate-none group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#5c554b]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
