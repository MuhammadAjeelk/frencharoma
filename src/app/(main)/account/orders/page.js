"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Rule } from "@/components/ui/SectionHeading";
import { GOLD_GLOW_WITH_BORDER, viewAllClass } from "@/lib/design";

// Status pills on the dark ground. Each keeps its own hue so the six stages
// stay apart at a glance, and each pairs its text with a tint dark enough to
// clear 4.5:1. Pills are the one place `rounded-full` survives.
const STATUS_STYLES = {
  pending:    "bg-[#4a3a1c] text-[#e8c477] border border-[#8a6b2f]",
  confirmed:  "bg-[#1f3a2a] text-[#8fd6a6] border border-[#3f7355]",
  processing: "bg-[#1e3446] text-[#8cc4e8] border border-[#3c6a8a]",
  shipped:    "bg-[#332c4a] text-[#b9a8e8] border border-[#5f5290]",
  delivered:  "bg-[#2b4f36] text-[#b6ebc4] border border-[#57a06f]",
  cancelled:  "bg-[#4a2624] text-[#e8927f] border border-[#8f4a3c]",
};

const PAYMENT_STATUS_STYLES = {
  pending:   "bg-[var(--fa-ink)] text-[var(--fa-on-dark)] border border-[#6b6255]",
  submitted: "bg-[#4a3a1c] text-[#e8c477] border border-[#8a6b2f]",
  confirmed: "bg-[#1f3a2a] text-[#8fd6a6] border border-[#3f7355]",
  failed:    "bg-[#4a2624] text-[#e8927f] border border-[#8f4a3c]",
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
    <div className={`border border-[var(--fa-gold)]/40 bg-[var(--fa-dark-deep)] ${GOLD_GLOW_WITH_BORDER}`}>
      {/* Header row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-4 min-w-0">
          {/* Thumbnail */}
          {firstImage ? (
            <div className="relative w-14 h-14 shrink-0 overflow-hidden border border-[var(--fa-gold)]/30 bg-[var(--fa-ink)]">
              <Image src={firstImage} alt="" fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="w-14 h-14 shrink-0 border border-[var(--fa-gold)]/30 bg-[var(--fa-ink)] flex items-center justify-center text-[var(--fa-muted-dark)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--fa-cream)]">
              Order{" "}
              <span className="font-mono tracking-wide break-all">{order.orderNumber}</span>
            </p>
            <p className="text-xs text-[var(--fa-muted-dark)] mt-0.5">{formatDate(order.createdAt)}</p>
            <p className="text-xs text-[var(--fa-muted-dark)] mt-0.5">
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
              <span className="font-medium text-[var(--fa-gold)]">PKR {order.total?.toLocaleString()}</span>
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
            className="ml-1 text-xs text-[var(--fa-gold)] hover:text-[var(--fa-gold-hover)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:text-[var(--fa-gold-hover)]"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* Tracking number */}
      {order.trackingNumber && (
        <div className="px-4 sm:px-5 pb-3 -mt-1">
          <p className="text-xs text-[var(--fa-muted-dark)]">
            Tracking:{" "}
            <span className="font-mono font-medium text-[var(--fa-cream)] break-all">{order.trackingNumber}</span>
          </p>
        </div>
      )}

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-[var(--fa-gold)]/25">
          <div className="p-4 sm:p-5 space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.image ? (
                  <div className="relative w-12 h-12 shrink-0 overflow-hidden border border-[var(--fa-gold)]/30 bg-[var(--fa-ink)]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 border border-[var(--fa-gold)]/30 bg-[var(--fa-ink)]" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--fa-cream)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--fa-muted-dark)]">
                    {[item.edition, item.size].filter(Boolean).join(" · ")} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--fa-on-dark)] shrink-0">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t border-[var(--fa-gold)]/25 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-[var(--fa-muted-dark)]">
                <span>Subtotal</span>
                <span>PKR {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[var(--fa-muted-dark)]">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : `PKR ${order.shippingCost?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--fa-gold)] pt-2 border-t border-[var(--fa-gold)]/25">
                <span>Total</span>
                <span>PKR {order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="pt-2">
                <div className="inline-block mb-3">
                  <p className="font-[family-name:var(--font-playfair)] italic text-base text-[var(--fa-gold)]">
                    Order Timeline
                  </p>
                  <Rule className="mt-1" />
                </div>
                <div className="space-y-2">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--fa-gold)] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[var(--fa-cream)] capitalize">{h.status}</p>
                        {h.note && <p className="text-xs text-[var(--fa-on-dark)]">{h.note}</p>}
                        <p className="text-xs text-[var(--fa-muted-dark)]">{formatDate(h.timestamp)}</p>
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
                className="text-xs text-[var(--fa-gold)] hover:text-[var(--fa-gold-hover)] underline underline-offset-2 transition-colors"
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
      <div className="min-h-screen bg-[var(--fa-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--fa-gold)]/25 border-t-[var(--fa-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--fa-dark)] py-10 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-8 md:mb-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--fa-muted-dark)] hover:text-[var(--fa-gold-hover)] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Account
          </Link>

          <div className="mt-4 text-center">
            <div className="inline-block">
              <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
                My Orders
              </h1>
              <Rule className="mt-2" />
            </div>
          </div>

          <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
            <Link href="/track-order" className={viewAllClass("dark")}>
              Track by order number
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--fa-gold)]/25 border-t-[var(--fa-gold)] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="border border-[#8f4a3c] bg-[#4a2624]/40 p-6 text-center">
            <p className="text-sm text-[#e8927f]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-[#e8927f] hover:text-[#f2ad9e] underline underline-offset-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-[var(--fa-gold)]/40 bg-[var(--fa-dark-deep)] px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full border border-[var(--fa-gold)]/40 bg-[var(--fa-ink)] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[var(--fa-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-xl md:text-2xl font-normal text-[var(--fa-gold)]">
              No orders yet
            </h2>
            <p className="mt-3 text-sm text-[var(--fa-muted-dark)]">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/collections/shop-all"
              className="mt-6 inline-block border border-[var(--fa-gold)] bg-[var(--fa-gold)] px-6 py-3 text-sm font-semibold text-[var(--fa-ink)] hover:bg-[var(--fa-gold-hover)] hover:border-[var(--fa-gold-hover)] transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--fa-muted-dark)]">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
