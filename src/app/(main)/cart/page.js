"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { genderMeta } from "@/lib/gender";
import OrderSummary from "@/components/OrderSummary";
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
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
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
          <h3 className="font-bold text-gray-900 text-sm sm:text-base hover:text-gray-600 transition-colors leading-snug">
            {item.name}
            {gm && (
              <>
                {" – "}
                <span className={`font-semibold ${gm.text}`}>{gm.label}</span>
              </>
            )}
          </h3>
        </Link>

        {item.impressionName && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Impression of:{" "}
            <span className="font-semibold text-gray-800">{item.impressionName}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {editionLabel && (
            <span className="text-[11px] font-semibold text-[#9a7b32] bg-[#f7f0e2] border border-[#e8dcbf] px-2 py-0.5 rounded">
              Edition: {editionLabel}
            </span>
          )}
          {item.size && (
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              Size: {item.size}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors text-lg leading-none"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors text-lg leading-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price breakup (spec pt 5 mock) */}
      <div className="sm:text-right shrink-0 sm:w-44 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
        <div className="text-xl font-extrabold text-gray-900 leading-tight">
          {rs(lineSubtotal)}
        </div>
        {hasDisc && (
          <>
            <div className="text-sm text-[#a09890] line-through leading-tight">
              {rs(lineOriginal)}
            </div>
            <div className="mt-1.5 text-sm font-bold text-green-600 leading-tight">
              Savings {disc}%
            </div>
            <div className="text-sm font-bold text-green-600 leading-tight">
              {rs(lineDiscount)}
            </div>
          </>
        )}
        <button
          onClick={() => removeItem(item.id)}
          className="mt-2.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors inline-flex items-center gap-1 sm:justify-end"
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1a1a2e]">🎁 Discovery Box {box.number}</span>
          <span className="text-xs text-gray-500">
            {box.items.length} × 5ml{disc > 0 ? ` · ${disc}% off` : ""}
          </span>
        </div>
        <button
          onClick={() => box.items.forEach((i) => removeItem(i.id))}
          className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove box
        </button>
      </div>
      <div className="rounded-xl border border-[#e8dcbf] bg-[#fbf8f1] p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {box.items.map((i, idx) => (
            <div key={i.id} className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-100 p-1.5">
              <Link href={`/products/${i.slug}`} className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-50 shrink-0">
                {i.image ? (
                  <Image src={i.image} alt={i.name} fill className="object-cover" sizes="48px" />
                ) : null}
                <span className="absolute top-0 left-0 w-4 h-4 bg-[#b8964e] text-white rounded-br flex items-center justify-center text-[10px] font-bold leading-none">
                  {idx + 1}
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.slug}`}>
                  <p className="text-xs font-semibold text-gray-900 truncate hover:text-gray-600 transition-colors">{i.name}</p>
                </Link>
                <p className="text-[11px] text-gray-500">5ml · {rs(i.price)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8dcbf]">
          <span className="text-xs text-gray-500">Box total</span>
          <span className="flex items-baseline gap-2">
            {disc > 0 && <span className="text-xs text-gray-400 line-through">{rs(orig)}</span>}
            <span className="text-sm font-bold text-[#1a1a2e]">{rs(total)}</span>
          </span>
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-8 md:py-12 text-center" style={{ backgroundColor: "#f3f3f3" }}>
        <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Cart</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#1a1a2e" }}>
          YOUR CART
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-20 h-20 text-gray-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 text-sm">Discover our luxury fragrances and add them to your cart.</p>
            <Link
              href="/collections/shop-all"
              className="bg-black text-white px-8 py-3 rounded font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Shop All Perfumes
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1">
              {/* Free shipping banner (spec pt 1) */}
              {qualifiesFreeShip ? (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-4">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-green-800">
                    🎉 You have qualified for <span className="uppercase">free shipping</span>!
                  </p>
                </div>
              ) : (
                summary.singleBoxOnly && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                    <p className="text-sm text-amber-800 font-medium">
                      Add any perfume or another Discovery Box to qualify for{" "}
                      <span className="font-bold">FREE shipping</span>.
                    </p>
                  </div>
                )
              )}

              <div className="divide-y divide-gray-100">
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
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label htmlFor="order-note" className="block text-sm font-bold text-gray-900 mb-2">
                  Order Note
                </label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add any instructions for your order (e.g. gift wrap, delivery preference)…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e] transition-colors resize-y"
                />
              </div>
            </div>

            {/* Order Summary (spec pt 4) */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="border border-gray-200 rounded-2xl p-6 static lg:sticky lg:top-24">
                <OrderSummary summary={summary} itemCount={itemCount} />

                {/* Proceed to Checkout */}
                <Link
                  href="/checkout"
                  className="w-full mt-5 bg-[#2f2a6b] text-white py-3.5 rounded-lg font-bold text-sm hover:bg-[#241f55] transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>

                {/* Continue Shopping (spec pt 2) — different colour + idle life + hover */}
                <Link
                  href="/collections/shop-all"
                  className="group w-full mt-3 border-2 border-[#b8964e] text-[#b8964e] bg-white py-3 rounded-lg font-bold text-sm hover:bg-[#b8964e] hover:text-white hover:shadow-[0_10px_28px_rgba(184,150,78,0.35)] transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 animate-bobX group-hover:animate-none group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
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
