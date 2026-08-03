"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

// Bundle Offer: a flat discount off every perfume after the first
// (2nd, 3rd, 4th … each -Rs BUNDLE_PER_UNIT). Discovery boxes don't count.
const BUNDLE_PER_UNIT = 500;

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

// undiscounted unit price (older carts may only have the final `price`)
const origOf = (i) => (i.originalPrice != null ? i.originalPrice : i.price);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fa_cart");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("fa_cart", JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((item) => {
    // Discovery-box testers are keyed per box so each box stays a distinct group
    const id = item.isDiscoveryBox && item.boxId
      ? `box-${item.boxId}-${item.perfumeId}`
      : `${item.perfumeId}-${item.edition || "default"}-${item.size || "default"}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const summary = useMemo(() => {
    const perfumeItems = items.filter((i) => !i.isDiscoveryBox);
    const boxItems = items.filter((i) => i.isDiscoveryBox);

    // Total at full (undiscounted) price
    const totalOriginal = items.reduce((s, i) => s + origOf(i) * i.quantity, 0);

    // Per-item discounts already applied to `price`
    const perfumeDiscount = perfumeItems.reduce(
      (s, i) => s + Math.max(0, origOf(i) - i.price) * i.quantity,
      0,
    );
    const boxDiscount = boxItems.reduce(
      (s, i) => s + Math.max(0, origOf(i) - i.price) * i.quantity,
      0,
    );

    // Subtotal after per-item discounts (what `price` already reflects)
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    // The range of perfume discount %s, for the "(20% – 40%)" label
    const pcts = perfumeItems
      .filter((i) => origOf(i) > i.price)
      .map((i) =>
        Number(i.discountPercent) ||
        Math.round((1 - i.price / origOf(i)) * 100),
      );
    const perfumeDiscMin = pcts.length ? Math.min(...pcts) : 0;
    const perfumeDiscMax = pcts.length ? Math.max(...pcts) : 0;

    const boxPcts = boxItems
      .filter((i) => origOf(i) > i.price)
      .map((i) =>
        Number(i.discountPercent) ||
        Math.round((1 - i.price / origOf(i)) * 100),
      );
    const boxDiscPct = boxPcts.length ? Math.max(...boxPcts) : 0;

    // Bundle Offer — flat Rs BUNDLE_PER_UNIT off each perfume unit past the 1st
    const perfumeUnits = perfumeItems.reduce((s, i) => s + i.quantity, 0);
    const bundleCount = Math.max(0, perfumeUnits - 1);
    const bundleSavings = bundleCount * BUNDLE_PER_UNIT;
    const bundleBreakdown = [];
    for (let n = 2; n <= perfumeUnits; n++) {
      bundleBreakdown.push({ label: `${ordinal(n)} Perfume`, saving: BUNDLE_PER_UNIT });
    }

    const grandTotal = subtotal - bundleSavings;
    const totalSavings = perfumeDiscount + boxDiscount + bundleSavings;

    return {
      totalOriginal,
      perfumeDiscount,
      boxDiscount,
      perfumeDiscMin,
      perfumeDiscMax,
      boxDiscPct,
      subtotal,
      bundle: { savings: bundleSavings, breakdown: bundleBreakdown, count: bundleCount },
      grandTotal,
      totalSavings,
    };
  }, [items]);

  const subtotal = summary.subtotal;
  const bundle = summary.bundle;
  const total = summary.grandTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        bundle,
        summary,
        hydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
