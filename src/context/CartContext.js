"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

// Bundle discount tiers: the nth item (1-indexed) gets this discount
const BUNDLE_DISCOUNTS = [0, 0.10, 0.15, 0.20];

function computeBundleSavings(items) {
  if (items.length < 2) return { savings: 0, breakdown: [] };

  const sorted = [...items].sort((a, b) => b.price - a.price);
  let totalSavings = 0;
  const breakdown = [];

  for (let i = 0; i < sorted.length; i++) {
    const discountRate = BUNDLE_DISCOUNTS[Math.min(i, BUNDLE_DISCOUNTS.length - 1)];
    const itemTotal = sorted[i].price * sorted[i].quantity;
    const saving = Math.round(itemTotal * discountRate);
    totalSavings += saving;
    if (discountRate > 0) {
      breakdown.push({
        id: sorted[i].id,
        name: sorted[i].name,
        discount: Math.round(discountRate * 100),
        saving,
      });
    }
  }

  return { savings: totalSavings, breakdown };
}

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
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const bundle = useMemo(() => {
    const uniqueProducts = items.length;
    if (uniqueProducts >= 2) {
      return computeBundleSavings(items);
    }
    return { savings: 0, breakdown: [] };
  }, [items]);

  const total = subtotal - bundle.savings;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        bundle,
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
