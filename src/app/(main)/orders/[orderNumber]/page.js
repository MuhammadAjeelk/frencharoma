"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const WHATSAPP_NUMBER = "923001234567";

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
    <div className="flex items-center justify-between relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-black z-0 transition-all duration-500"
        style={{
          width: currentIdx >= 0
            ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`
            : "0%",
        }}
      />
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center z-10 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                done ? "bg-black border-black" : "bg-white border-gray-300"
              }`}
            >
              <span className={done ? "filter-none" : "opacity-40"}>{step.icon}</span>
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

export default function OrderPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order not found");
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">😔</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || "We couldn't find this order."}</p>
          <Link href="/track-order" className="bg-black text-white px-6 py-2.5 rounded font-semibold text-sm hover:bg-gray-800 transition-colors">
            Track an Order
          </Link>
        </div>
      </div>
    );
  }

  const isOnline = order.paymentMethod === "online";
  const isCancelled = order.status === "cancelled";

  const whatsappMessage = encodeURIComponent(
    `Hello! I have placed an order #${order.orderNumber} on French Aromas. Please find my payment receipt attached. Total: PKR ${order.total?.toLocaleString()}`
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          {isCancelled ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl mx-auto mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Cancelled</h1>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-4">
                {isOnline ? "💳" : "🎉"}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isOnline ? "Order Placed — Payment Pending" : "Order Confirmed!"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isOnline
                  ? "Please transfer the payment and send your receipt via WhatsApp to confirm your order."
                  : "Thank you! Your order has been placed successfully."}
              </p>
            </>
          )}
          <p className="mt-3 text-sm text-gray-600">
            Order Number:{" "}
            <span className="font-bold text-black font-mono text-base">{order.orderNumber}</span>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Online Payment Action Box */}
        {isOnline && !isCancelled && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Action Required: Send Payment Proof
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Transfer <strong>PKR {order.total?.toLocaleString()}</strong> to our bank account and send your payment screenshot on WhatsApp. Your order will be processed once payment is confirmed.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Send Payment Proof on WhatsApp
            </a>
          </div>
        )}

        {/* Order Status */}
        {!isCancelled && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-6">Order Status</h2>
            <StatusTimeline status={order.status} />
            {order.trackingNumber && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                Tracking No: <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
              <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Payment</p>
              <p className="font-medium text-gray-900 capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Transfer"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {[item.edition, item.size].filter(Boolean).join(" · ")} × {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>PKR {order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>PKR {order.shippingCost?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>PKR {order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Delivery Information</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{order.customer?.name}</p>
            <p>{order.customer?.phone}</p>
            <p>{order.customer?.email}</p>
            <p className="text-gray-600 mt-1">{order.customer?.address}</p>
            <p className="text-gray-600">{[order.customer?.city, order.customer?.province].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/collections/shop-all" className="flex-1 text-center border border-black text-black py-3 rounded-lg font-semibold text-sm hover:bg-black hover:text-white transition-colors">
            Continue Shopping
          </Link>
          <Link href="/track-order" className="flex-1 text-center bg-black text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
            Track Another Order
          </Link>
        </div>
      </div>
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
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
