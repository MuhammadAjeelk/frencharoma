"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Rule } from "@/components/ui/SectionHeading";
import { FIELD_DARK, FOCUS_RING } from "@/lib/design";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "processing", label: "Processing", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];
const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

const PANEL = "border border-[var(--fa-gold)]/40 bg-[var(--fa-dark-deep)] p-5 sm:p-6";

// Form chrome on the dark ground, matching the footer's newsletter field.
const INPUT = `w-full px-4 py-2.5 text-sm ${FIELD_DARK} ${FOCUS_RING}`;
const LABEL = "block text-[13px] font-medium text-[var(--fa-on-dark)] mb-1.5";

// A card heading: Playfair italic over a rule sized to the words.
function CardHeading({ children }) {
  return (
    <div className="inline-block mb-4">
      <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)]">
        {children}
      </h2>
      <Rule className="mt-1.5" />
    </div>
  );
}

function StatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-start justify-between relative px-2">
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-[var(--fa-gold)]/25 z-0" />
      <div
        className="absolute top-5 left-6 h-0.5 bg-[var(--fa-gold)] z-0 transition-all duration-500"
        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * (100 - 12)}%` : "0%" }}
      />
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center z-10 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg border-2 transition-all ${done ? "bg-[var(--fa-gold)] border-[var(--fa-gold)]" : "bg-[var(--fa-dark-deep)] border-[var(--fa-gold)]/35"}`}>
              <span className={done ? "" : "opacity-30"}>{step.icon}</span>
            </div>
            <p className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${done ? "text-[var(--fa-gold-hover)]" : "text-[var(--fa-muted-dark)]"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Status pills on the dark ground. Each stage keeps its own hue so they stay
// apart at a glance, and each text/tint pair clears 4.5:1.
function StatusBadge({ status }) {
  const map = {
    pending:    "bg-[#4a3a1c] text-[#e8c477] border border-[#8a6b2f]",
    confirmed:  "bg-[#1f3a2a] text-[#8fd6a6] border border-[#3f7355]",
    processing: "bg-[#1e3446] text-[#8cc4e8] border border-[#3c6a8a]",
    shipped:    "bg-[#332c4a] text-[#b9a8e8] border border-[#5f5290]",
    delivered:  "bg-[#2b4f36] text-[#b6ebc4] border border-[#57a06f]",
    cancelled:  "bg-[#4a2624] text-[#e8927f] border border-[#8f4a3c]",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-[var(--fa-ink)] text-[var(--fa-on-dark)] border border-[#6b6255]"}`}>
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
    <div className="min-h-screen bg-[var(--fa-dark)]">
      {/* Header */}
      <div className="bg-[var(--fa-dark-deep)] border-b border-[var(--fa-gold)]/40 py-10 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center items-center gap-2 text-xs text-[var(--fa-muted-dark)] mb-4">
            <Link href="/" className="hover:text-[var(--fa-gold-hover)] transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--fa-cream)] font-medium">Track Order</span>
          </nav>
          <div className="inline-block">
            <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
              Track Your Order
            </h1>
            <Rule className="mt-2" />
          </div>
          <p className="mt-4 font-[family-name:var(--font-playfair)] text-base md:text-lg text-[var(--fa-on-dark)]">
            Enter your order number to check the status of your order.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Form */}
        <div className={`${PANEL} mb-6`}>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="track-order-number" className={LABEL}>
                Order Number <span className="text-[#e8927f]">*</span>
              </label>
              <input
                id="track-order-number"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. FA-2501-1234"
                className={`${INPUT} font-mono uppercase`}
              />
            </div>
            <div>
              <label htmlFor="track-email" className={LABEL}>
                Email Address <span className="text-[var(--fa-muted-dark)] font-normal">(optional, for verification)</span>
              </label>
              <input
                id="track-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={INPUT}
              />
            </div>
            {error && (
              <p className="border border-[#8f4a3c] bg-[#4a2624]/50 px-3 py-2.5 text-sm text-[#e8927f] flex items-start gap-1.5" role="alert">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="min-w-0">{error}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-[var(--fa-gold)] bg-[var(--fa-gold)] py-3 text-sm font-semibold text-[var(--fa-ink)] hover:bg-[var(--fa-gold-hover)] hover:border-[var(--fa-gold-hover)] focus-visible:ring-2 focus-visible:ring-[var(--fa-gold-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fa-dark-deep)] disabled:bg-[#6f5c3a] disabled:border-[#6f5c3a] disabled:text-[var(--fa-cream)] disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--fa-cream)]/30 border-t-[var(--fa-cream)] rounded-full animate-spin" />
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
            <div className={PANEL}>
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--fa-muted-dark)] mb-0.5">Order</p>
                  <p className="font-mono font-semibold text-[var(--fa-cream)] text-lg break-all">{order.orderNumber}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              {order.status !== "cancelled" ? (
                <StatusTimeline status={order.status} />
              ) : (
                <div className="border border-[#8f4a3c] bg-[#4a2624]/50 px-4 py-3 text-center">
                  <p className="text-sm font-medium text-[#e8927f]">This order has been cancelled.</p>
                </div>
              )}
              {order.trackingNumber && (
                <p className="mt-5 text-xs text-[var(--fa-muted-dark)] text-center">
                  Courier Tracking: <span className="font-mono font-semibold text-[var(--fa-cream)] break-all">{order.trackingNumber}</span>
                </p>
              )}
            </div>

            {/* Payment Info (for online orders) */}
            {order.paymentMethod === "online" && order.paymentStatus !== "confirmed" && (
              <div className="border border-[#8a6b2f] bg-[#3a3020] p-4 text-sm">
                <p className="font-semibold text-[#e8c477] mb-1">💳 Payment Status: {order.paymentStatus === "submitted" ? "Under Review" : "Pending"}</p>
                <p className="text-xs text-[#d9c9a6]">
                  {order.paymentStatus === "pending"
                    ? "Please transfer payment and send proof via WhatsApp to complete your order."
                    : "Your payment receipt is under review. We'll confirm shortly."}
                </p>
              </div>
            )}

            {/* Items */}
            <div className={PANEL}>
              <CardHeading>Items Ordered</CardHeading>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative w-12 h-12 shrink-0 overflow-hidden border border-[var(--fa-gold)]/30 bg-[var(--fa-ink)]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full bg-[var(--fa-ink)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--fa-cream)]">{item.name}</p>
                      <p className="text-xs text-[var(--fa-muted-dark)] capitalize">{[item.edition, item.size].filter(Boolean).join(" · ")} × {item.quantity}</p>
                      <p className="text-xs font-semibold text-[var(--fa-gold)]">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--fa-gold)]/25 mt-5 pt-4 flex justify-between font-semibold text-[var(--fa-gold)]">
                <span>Total</span>
                <span>PKR {order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery */}
            <div className={PANEL}>
              <CardHeading>Delivery To</CardHeading>
              <div className="space-y-1 break-words">
                <p className="text-sm text-[var(--fa-cream)]">{order.customer?.name}</p>
                <p className="text-sm text-[var(--fa-muted-dark)]">{order.customer?.address}</p>
                <p className="text-sm text-[var(--fa-muted-dark)]">{[order.customer?.city, order.customer?.province].filter(Boolean).join(", ")}</p>
              </div>
            </div>

            <Link
              href={`/orders/${order.orderNumber}`}
              className="w-full block text-center border border-[var(--fa-gold)] bg-[var(--fa-gold)] py-3 text-sm font-semibold text-[var(--fa-ink)] hover:bg-[var(--fa-gold-hover)] hover:border-[var(--fa-gold-hover)] transition-colors"
            >
              View Full Order Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
