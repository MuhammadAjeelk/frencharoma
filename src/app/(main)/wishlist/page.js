"use client";

import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { items, removeItem, hydrated } = useWishlist();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: "#1a1a2e" }}>
          My Wishlist
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {items.length === 0
            ? "Your wishlist is empty. Browse our collection and save your favourites."
            : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No items yet</h3>
            <p className="text-sm text-gray-400 mb-6">Heart the perfumes you love and they'll appear here.</p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-sm"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item.slug} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow flex flex-col">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.slug)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-colors shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <Link href={`/products/${item.slug}`} className="block relative w-full aspect-square overflow-hidden bg-gray-50">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-gray-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  {item.brand && <p className="text-[10px] sm:text-xs text-gray-500 mb-2">{item.brand}</p>}
                  {item.price > 0 && (
                    <p className="text-sm font-bold text-gray-900 mb-3">From PKR {item.price.toLocaleString()}</p>
                  )}
                  <div className="flex-1" />
                  <Link
                    href={`/products/${item.slug}`}
                    className="block text-center border border-black text-black py-2 rounded hover:bg-black hover:text-white transition-colors text-xs sm:text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
