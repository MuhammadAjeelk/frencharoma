"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "processing", label: "Processing", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];
const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

function StatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-start justify-between relative px-2">
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute top-5 left-6 h-0.5 bg-black z-0 transition-all duration-500"
        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * (100 - 12)}%` : "0%" }}
      />
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${done ? "bg-black border-black" : "bg-white border-gray-300"}`}>
              <span className={done ? "" : "opacity-30"}>{step.icon}</span>
            </div>
            <p className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${done ? "text-black" : "text-gray-400"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-200 text-green-900",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter your order number.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber.trim().toUpperCase()}?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found.");
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-10 text-center" style={{ backgroundColor: "#f3f3f3" }}>
        <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Track Order</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#1a1a2e" }}>TRACK YOUR ORDER</h1>
        <p className="text-gray-500 text-sm mt-2">Enter your order number to check the status of your order.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Search Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Order Number *</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. FA-2501-1234"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address <span className="text-gray-400 font-normal">(optional, for verification)</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </form>
        </div>

        {/* Order Result */}
        {order && (
          <div className="space-y-5">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Order</p>
                  <p className="font-mono font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              {order.status !== "cancelled" ? (
                <StatusTimeline status={order.status} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium text-sm">This order has been cancelled.</p>
                </div>
              )}
              {order.trackingNumber && (
                <p className="mt-5 text-xs text-gray-500 text-center">
                  Courier Tracking: <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span>
                </p>
              )}
            </div>

            {/* Payment Info (for online orders) */}
            {order.paymentMethod === "online" && order.paymentStatus !== "confirmed" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">💳 Payment Status: {order.paymentStatus === "submitted" ? "Under Review" : "Pending"}</p>
                <p className="text-xs">
                  {order.paymentStatus === "pending"
                    ? "Please transfer payment and send proof via WhatsApp to complete your order."
                    : "Your payment receipt is under review. We'll confirm shortly."}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{[item.edition, item.size].filter(Boolean).join(" · ")} × {item.quantity}</p>
                      <p className="text-xs font-bold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>PKR {order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Delivery To</h3>
              <p className="text-sm text-gray-700">{order.customer?.name}</p>
              <p className="text-sm text-gray-600">{order.customer?.address}</p>
              <p className="text-sm text-gray-600">{[order.customer?.city, order.customer?.province].filter(Boolean).join(", ")}</p>
            </div>

            <Link href={`/orders/${order.orderNumber}`} className="w-full block text-center bg-black text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
              View Full Order Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
