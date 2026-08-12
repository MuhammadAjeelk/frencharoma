"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

// Bundle Offer: a flat discount off every perfume after the first
// (2nd, 3rd, 4th … each -Rs BUNDLE_PER_UNIT). Discovery boxes don't count.
const BUNDLE_PER_UNIT = 500;

// Flat shipping when charged. Free shipping applies to any order that has at
// least one perfume, or 2+ discovery boxes. A cart with ONLY one discovery box
// (and nothing else) is charged shipping (Discovery Box already at 40% off).
const SHIPPING_FLAT = 200;

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
  // Add-to-Cart confirmation popup (shows the Order Summary)
  const [addedOpen, setAddedOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

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
    // Perfume adds pop the confirmation summary; box testers (built on the
    // Discovery Box page) do not, so the box flow isn't interrupted.
    if (!item.isDiscoveryBox) {
      setLastAdded(item);
      setAddedOpen(true);
    }
  }, []);

  const openAdded = useCallback(() => setAddedOpen(true), []);
  const closeAdded = useCallback(() => setAddedOpen(false), []);

  // Total quantity of a specific perfume in the cart (across editions/sizes,
  // excluding discovery-box testers) — drives the "Added to Cart (N)" state.
  const perfumeQty = useCallback(
    (pid) =>
      items
        .filter((i) => !i.isDiscoveryBox && String(i.perfumeId) === String(pid))
        .reduce((s, i) => s + i.quantity, 0),
    [items],
  );

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

    // Bundle Offer — flat Rs BUNDLE_PER_UNIT off each perfume unit past the 1st.
    // Breakdown always lists the 1st perfume at Rs 0, then each extra at Rs 500.
    const perfumeUnits = perfumeItems.reduce((s, i) => s + i.quantity, 0);
    const bundleCount = Math.max(0, perfumeUnits - 1);
    const bundleSavings = bundleCount * BUNDLE_PER_UNIT;
    const bundleBreakdown = [];
    if (perfumeUnits >= 1) {
      bundleBreakdown.push({ label: "1st Perfume", saving: 0 });
      for (let n = 2; n <= perfumeUnits; n++) {
        bundleBreakdown.push({ label: `${ordinal(n)} Perfume`, saving: BUNDLE_PER_UNIT });
      }
    }

    // Shipping — free with any perfume, or 2+ discovery boxes. Only a lone
    // single Discovery Box (no other products) is charged.
    const boxCount = new Set(boxItems.map((i) => i.boxId).filter(Boolean)).size;
    const hasItems = items.length > 0;
    const shippingFree = perfumeUnits >= 1 || boxCount >= 2;
    const shipping = !hasItems ? 0 : shippingFree ? 0 : SHIPPING_FLAT;
    const shippingSaved = hasItems && shippingFree ? SHIPPING_FLAT : 0;
    const singleBoxOnly = perfumeUnits === 0 && boxCount === 1;

    // Net Amount (what the customer pays) and Net Savings (everything saved).
    const grandTotal = subtotal - bundleSavings; // pre-shipping (back-compat)
    const netAmount = grandTotal + shipping;
    const netSavings =
      perfumeDiscount + boxDiscount + shippingSaved + bundleSavings;

    return {
      totalOriginal,
      perfumeDiscount,
      boxDiscount,
      perfumeDiscMin,
      perfumeDiscMax,
      boxDiscPct,
      subtotal,
      bundle: { savings: bundleSavings, breakdown: bundleBreakdown, count: bundleCount },
      perfumeUnits,
      boxCount,
      shipping,
      shippingSaved,
      shippingFree,
      singleBoxOnly,
      grandTotal,
      netAmount,
      netSavings,
      // legacy alias
      totalSavings: netSavings,
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
        perfumeQty,
        addedOpen,
        lastAdded,
        openAdded,
        closeAdded,
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
