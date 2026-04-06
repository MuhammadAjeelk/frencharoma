"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fa_wishlist");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("fa_wishlist", JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const removeItem = useCallback((slug) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const isInWishlist = useCallback(
    (slug) => items.some((i) => i.slug === slug),
    [items]
  );

  const toggleItem = useCallback(
    (item) => {
      if (isInWishlist(item.slug)) {
        removeItem(item.slug);
      } else {
        addItem(item);
      }
    },
    [isInWishlist, removeItem, addItem]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        hydrated,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
