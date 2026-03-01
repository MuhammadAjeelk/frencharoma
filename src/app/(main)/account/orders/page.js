"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES = {
  pending:    "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed:  "bg-blue-50 text-blue-700 border border-blue-200",
  processing: "bg-purple-50 text-purple-700 border border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border border-indigo-200",
  delivered:  "bg-green-50 text-green-700 border border-green-200",
  cancelled:  "bg-red-50 text-red-700 border border-red-200",
};

const PAYMENT_STATUS_STYLES = {
  pending:   "bg-gray-50 text-gray-600 border border-gray-200",
  submitted: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border border-green-200",
  failed:    "bg-red-50 text-red-700 border border-red-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const firstImage = order.items?.[0]?.image;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          {firstImage ? (
            <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image src={firstImage} alt="" fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Order{" "}
              <span className="font-mono tracking-wide">{order.orderNumber}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
              <span className="font-medium text-gray-700">PKR {order.total?.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
          {/* Order status badge */}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
            {order.status}
          </span>
          {/* Payment status badge */}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${PAYMENT_STATUS_STYLES[order.paymentStatus] || PAYMENT_STATUS_STYLES.pending}`}>
            {order.paymentMethod === "cod" ? "COD" : `Payment ${order.paymentStatus}`}
          </span>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* Tracking number */}
      {order.trackingNumber && (
        <div className="px-5 pb-3 -mt-1">
          <p className="text-xs text-gray-500">
            Tracking:{" "}
            <span className="font-mono font-medium text-gray-800">{order.trackingNumber}</span>
          </p>
        </div>
      )}

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 sm:p-5 space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.image ? (
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {[item.edition, item.size].filter(Boolean).join(" · ")} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800 shrink-0">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>PKR {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : `PKR ${order.shippingCost?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>PKR {order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Order Timeline
                </p>
                <div className="space-y-2">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-800 capitalize">{h.status}</p>
                        {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                        <p className="text-xs text-gray-400">{formatDate(h.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View full order link */}
            <div className="pt-1">
              <Link
                href={`/orders/${order.orderNumber}`}
                className="text-xs text-black underline underline-offset-2 hover:opacity-70"
              >
                View full order page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login?redirect=/account/orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // user.id = string id from session; user.email = account email
        // URLSearchParams encodes values automatically — do NOT use encodeURIComponent here
        const params = new URLSearchParams();
        if (user.id) params.set("userId", user.id);
        if (user.email) params.set("email", user.email);
        const res = await fetch(`/api/orders?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/account"
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              My Account
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
          <Link
            href="/track-order"
            className="text-sm text-gray-600 hover:text-black underline underline-offset-2"
          >
            Track by order number
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-600 underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-black text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
