"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-200 text-green-900",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: "",
    paymentStatus: "",
    adminNotes: "",
    trackingNumber: "",
    statusNote: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setForm({
            status: data.order.status,
            paymentStatus: data.order.paymentStatus,
            adminNotes: data.order.adminNotes || "",
            trackingNumber: data.order.trackingNumber || "",
            statusNote: "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setForm((prev) => ({
          ...prev,
          status: data.order.status,
          paymentStatus: data.order.paymentStatus,
          adminNotes: data.order.adminNotes || "",
          trackingNumber: data.order.trackingNumber || "",
          statusNote: "",
        }));
        alert("Order updated successfully!");
      } else {
        alert(data.error || "Failed to update order.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "confirmed" }),
      });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setForm((prev) => ({ ...prev, paymentStatus: "confirmed" }));
        alert("Payment confirmed!");
      } else {
        alert(data.error || "Failed to confirm payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to confirm payment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link href="/admin/orders" className="text-sm text-black underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/orders" className="text-gray-500 hover:text-black transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* ── Confirm Payment Banner (online orders only) ── */}
        {order.paymentMethod === "online" && order.paymentStatus !== "confirmed" && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  Payment Confirmation Required
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  This is an online payment order. Current status:{" "}
                  <span className="font-semibold capitalize">{order.paymentStatus}</span>.
                  Once you verify the bank transfer receipt, click "Confirm Payment" to approve.
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmPayment}
              disabled={saving}
              className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Confirm Payment
            </button>
          </div>
        )}

        {/* ── Payment Confirmed Badge ── */}
        {order.paymentMethod === "online" && order.paymentStatus === "confirmed" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-green-800">Payment has been confirmed for this order.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Order Items + Customer */}
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {[item.edition, item.size].filter(Boolean).join(" · ")} × {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>PKR {order.shippingCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>PKR {order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Customer & Delivery</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Name</p>
                  <p className="font-medium">{order.customer?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <a href={`tel:${order.customer?.phone}`} className="font-medium text-blue-600 hover:underline">{order.customer?.phone}</a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href={`mailto:${order.customer?.email}`} className="font-medium text-blue-600 hover:underline truncate block">{order.customer?.email}</a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">City</p>
                  <p className="font-medium">{[order.customer?.city, order.customer?.province].filter(Boolean).join(", ")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <p className="font-medium">{order.customer?.address}</p>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Customer Notes</p>
                    <p className="font-medium text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* WhatsApp quick link */}
              <a
                href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp Customer
              </a>
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Status History</h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[h.status] || "bg-gray-100 text-gray-700"}`}>{h.status}</span>
                        {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(h.timestamp).toLocaleString("en-PK")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right – Admin Controls */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Update Order</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Order Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black bg-white capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black bg-white capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted (Receipt Sent)</option>
                    <option value="confirmed">Confirmed ✓</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={form.trackingNumber}
                    onChange={(e) => setForm((p) => ({ ...p, trackingNumber: e.target.value }))}
                    placeholder="e.g. TCS-1234567"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status Note</label>
                  <input
                    type="text"
                    value={form.statusNote}
                    onChange={(e) => setForm((p) => ({ ...p, statusNote: e.target.value }))}
                    placeholder="Optional note for this status change"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes (internal)</label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
                    rows={3}
                    placeholder="Internal notes about this order..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-3">Payment Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Transfer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold">PKR {order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
