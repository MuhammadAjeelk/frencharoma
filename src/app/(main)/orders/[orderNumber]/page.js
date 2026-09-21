"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Rule } from "@/components/ui/SectionHeading";
import { viewAllClass } from "@/lib/design";

const WHATSAPP_NUMBER = "923001234567";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "processing", label: "Processing", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

const PANEL = "border border-[#c9a25a]/40 bg-[#2e2e2e] p-5 sm:p-6";

const PRIMARY_BTN =
  "border border-[#c9a25a] bg-[#c9a25a] px-6 py-3 text-sm font-semibold text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] transition-colors";

// A card heading: Playfair italic over a rule sized to the words.
function CardHeading({ children }) {
  return (
    <div className="inline-block mb-5">
      <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[#c9a25a]">
        {children}
      </h2>
      <Rule className="mt-1.5" />
    </div>
  );
}

function StatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#c9a25a]/25 z-0" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-[#c9a25a] z-0 transition-all duration-500"
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
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg border-2 transition-all ${
                done ? "bg-[#c9a25a] border-[#c9a25a]" : "bg-[#2e2e2e] border-[#c9a25a]/35"
              }`}
            >
              <span className={done ? "filter-none" : "opacity-40"}>{step.icon}</span>
            </div>
            <p className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${done ? "text-[#e3c489]" : "text-[#a99d8c]"}`}>
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
      <div className="min-h-screen flex items-center justify-center bg-[#373838]">
        <div className="w-8 h-8 border-2 border-[#c9a25a]/25 border-t-[#c9a25a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#373838] px-4 py-16">
        <div className="w-full max-w-md border border-[#c9a25a]/40 bg-[#2e2e2e] px-6 py-10 text-center">
          <p className="text-4xl mb-4">😔</p>
          <div className="inline-block">
            <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-3xl font-normal text-[#c9a25a]">
              Order Not Found
            </h1>
            <Rule className="mt-2" />
          </div>
          <p className="mt-4 mb-7 text-sm text-[#a99d8c] break-words">
            {error || "We couldn't find this order."}
          </p>
          <Link href="/track-order" className={`inline-block ${PRIMARY_BTN}`}>
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
    <div className="min-h-screen bg-[#373838]">
      {/* Success Header */}
      <div className="bg-[#2e2e2e] border-b border-[#c9a25a]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          {isCancelled ? (
            <>
              <div className="w-16 h-16 rounded-full border border-[#8f4a3c] bg-[#4a2624] flex items-center justify-center text-2xl mx-auto mb-5">❌</div>
              <div className="inline-block">
                <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
                  Order Cancelled
                </h1>
                <Rule className="mt-2" />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full border border-[#c9a25a]/50 bg-[#211d18] flex items-center justify-center text-2xl mx-auto mb-5">
                {isOnline ? "💳" : "🎉"}
              </div>
              <div className="inline-block">
                <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
                  {isOnline ? "Order Placed — Payment Pending" : "Order Confirmed!"}
                </h1>
                <Rule className="mt-2" />
              </div>
              <p className="mt-4 font-[family-name:var(--font-playfair)] text-base md:text-lg text-[#d2c1ac]">
                {isOnline
                  ? "Please transfer the payment and send your receipt via WhatsApp to confirm your order."
                  : "Thank you! Your order has been placed successfully."}
              </p>
            </>
          )}
          <p className="mt-5 text-sm text-[#a99d8c]">
            Order Number:{" "}
            <span className="font-mono font-semibold text-[#efe7db] text-base break-all">{order.orderNumber}</span>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Online Payment Action Box */}
        {isOnline && !isCancelled && (
          <div className="border border-[#8a6b2f] bg-[#3a3020] p-5 sm:p-6">
            <h2 className="font-semibold text-[#e8c477] mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Action Required: Send Payment Proof
            </h2>
            <p className="text-sm text-[#d9c9a6] mb-5">
              Transfer <strong className="text-[#efe7db]">PKR {order.total?.toLocaleString()}</strong> to our bank account and send your payment screenshot on WhatsApp. Your order will be processed once payment is confirmed.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#25d366] bg-[#25d366] px-5 py-3 text-sm font-semibold text-[#10261a] hover:bg-[#3ddb78] hover:border-[#3ddb78] transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Send Payment Proof on WhatsApp
            </a>
          </div>
        )}

        {/* Order Status */}
        {!isCancelled && (
          <div className={PANEL}>
            <CardHeading>Order Status</CardHeading>
            <StatusTimeline status={order.status} />
            {order.trackingNumber && (
              <p className="mt-5 text-xs text-[#a99d8c] text-center">
                Tracking No: <span className="font-mono font-semibold text-[#efe7db] break-all">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className={PANEL}>
          <CardHeading>Order Details</CardHeading>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 text-sm mb-5">
            <div>
              <p className="text-xs text-[#a99d8c] mb-0.5">Order Number</p>
              <p className="font-mono font-semibold text-[#efe7db] break-all">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#a99d8c] mb-0.5">Date</p>
              <p className="font-medium text-[#efe7db]">
                {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#a99d8c] mb-0.5">Payment</p>
              <p className="font-medium text-[#efe7db] capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Transfer"}</p>
            </div>
            <div>
              <p className="text-xs text-[#a99d8c] mb-0.5">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-[#c9a25a]/25 pt-5 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden border border-[#c9a25a]/30 bg-[#211d18]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full bg-[#211d18]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#efe7db]">{item.name}</p>
                  <p className="text-xs text-[#a99d8c] capitalize mt-0.5">
                    {[item.edition, item.size].filter(Boolean).join(" · ")} × {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-[#c9a25a] mt-0.5">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#c9a25a]/25 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#a99d8c]">
              <span>Subtotal</span>
              <span>PKR {order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a99d8c]">
              <span>Shipping</span>
              <span>PKR {order.shippingCost?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#c9a25a] text-base pt-2 border-t border-[#c9a25a]/25">
              <span>Total</span>
              <span>PKR {order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className={PANEL}>
          <CardHeading>Delivery Information</CardHeading>
          <div className="text-sm text-[#cbbfae] space-y-1 break-words">
            <p className="font-semibold text-[#efe7db]">{order.customer?.name}</p>
            <p>{order.customer?.phone}</p>
            <p className="break-all">{order.customer?.email}</p>
            <p className="text-[#a99d8c] pt-1">{order.customer?.address}</p>
            <p className="text-[#a99d8c]">{[order.customer?.city, order.customer?.province].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/collections/shop-all" className={`${viewAllClass("dark")} flex-1 justify-center`}>
            Continue Shopping
          </Link>
          <Link href="/track-order" className={`flex-1 text-center ${PRIMARY_BTN}`}>
            Track Another Order
          </Link>
        </div>
      </div>
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
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-[#211d18] text-[#cbbfae] border border-[#6b6255]"}`}>
      {status}
    </span>
  );
}
