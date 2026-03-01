"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, hydrated } =
    useCart();

  const SHIPPING = itemCount > 0 ? 200 : 0;
  const total = subtotal + SHIPPING;

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
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-6">
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} className="shrink-0">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
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
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-gray-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.edition && (
                          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {item.edition}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.size}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        PKR {item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors text-lg leading-none"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors text-lg leading-none"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/collections/shop-all" className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="border border-gray-200 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                    <span className="font-medium text-gray-900">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">PKR {SHIPPING.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full mt-6 bg-black text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors text-center block"
                >
                  Proceed to Checkout
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
