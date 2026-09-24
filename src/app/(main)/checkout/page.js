"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rule } from "@/components/ui/SectionHeading";
import { FIELD_DARK, FOCUS_RING, GUTTER, SECTION_Y } from "@/lib/design";

// ── Payment info – update these values as needed ──────────────────────────────
const BANK_INFO = {
  bankName: "Meezan Bank",
  accountTitle: "French Aromas",
  accountNumber: "01230-1234567-01",
  iban: "PK36MEZN0001230112345678",
};
const WHATSAPP_NUMBER = "923001234567"; // without + or spaces
// ─────────────────────────────────────────────────────────────────────────────

const PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Gilgit-Baltistan",
  "AJK",
  "ICT (Islamabad)",
];

// FIELD_DARK already carries the gold border, so the invalid state spells its
// treatment out in full rather than layering a second border-colour utility on
// top of it — which of the two won would come down to stylesheet order, not to
// the order of this string. #e8927f is the palette's danger tone (the one
// MENU_ITEM_DANGER uses); a plain red fails contrast on these grounds.
const FIELD_INVALID =
  "bg-[var(--fa-ink)] border border-[#e8927f] text-[var(--fa-cream)] placeholder-[var(--fa-muted-dark)] focus:outline-none focus:border-[#e8927f] transition-colors";

const fieldClass = (invalid) =>
  `w-full px-3 py-2.5 text-sm ${invalid ? FIELD_INVALID : FIELD_DARK} ${FOCUS_RING}`;

// globals.css draws :focus-visible in --accent (#211d18), which is all but
// invisible on this page's grounds, and FOCUS_RING's gold would sit invisibly
// on the gold button — so the submit control offsets its ring onto the card.
const BUTTON_FOCUS =
  "focus-visible:ring-2 focus-visible:ring-[var(--fa-gold-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fa-dark-deep)]";

export default function CheckoutPage() {
  const { items, subtotal, summary, clearCart, hydrated } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    notes: "",
  });

  // Pre-fill form when logged-in user is available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Carry the Order Note written on the cart page into the checkout notes.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fa_order_note");
      if (saved) setForm((prev) => (prev.notes ? prev : { ...prev, notes: saved }));
    } catch {}
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use the shared cart summary so checkout charges exactly the cart's
  // Net Amount (free shipping with any perfume or 2+ boxes; a lone box pays).
  const shipping = summary.shipping;
  const total = summary.netAmount;

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...(user?.id ? { userId: user.id } : {}),
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          province: form.province,
        },
        items: items.map((i) => ({
          perfumeId: i.perfumeId,
          name: i.name,
          slug: i.slug,
          image: i.image,
          edition: i.edition,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
        })),
        paymentMethod,
        subtotal,
        bundleDiscount: summary.bundle.savings,
        totalSavings: summary.totalSavings,
        shippingCost: shipping,
        total,
        notes: form.notes.trim(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      router.push(`/orders/${data.orderNumber}`);
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--fa-dark)]">
        <div className="w-8 h-8 border-2 border-[var(--fa-gold)]/25 border-t-[var(--fa-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--fa-dark)]">
      {/* Page Header */}
      <div className="py-8 md:py-10 text-center bg-[var(--fa-dark)] border-b border-[var(--fa-gold)]/30">
        <nav className="flex justify-center items-center gap-2 text-xs text-[var(--fa-on-dark)] mb-3">
          <Link href="/" className={`hover:text-[var(--fa-gold-hover)] transition-colors ${FOCUS_RING}`}>Home</Link>
          <span>/</span>
          <Link href="/cart" className={`hover:text-[var(--fa-gold-hover)] transition-colors ${FOCUS_RING}`}>Cart</Link>
          <span>/</span>
          <span className="text-[var(--fa-gold)] font-medium">Checkout</span>
        </nav>
        <div className="inline-block">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
            Checkout
          </h1>
          <Rule className="mt-2" />
        </div>
      </div>

      <div className={`${GUTTER} ${SECTION_Y}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Form */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Contact Info */}
              <div className="bg-[var(--fa-dark-deep)] border border-[var(--fa-gold)]/40 p-4 sm:p-6">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)] mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--fa-gold)] text-[var(--fa-ink)] text-xs flex items-center justify-center font-bold not-italic font-[family-name:var(--font-geist-sans)]">1</span>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Muhammad Ali"
                      className={fieldClass(errors.name)}
                    />
                    {errors.name && <p className="text-xs text-[#e8927f] mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ali@example.com"
                      className={fieldClass(errors.email)}
                    />
                    {errors.email && <p className="text-xs text-[#e8927f] mt-1.5">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0300 1234567"
                      className={fieldClass(errors.phone)}
                    />
                    {errors.phone && <p className="text-xs text-[#e8927f] mt-1.5">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-[var(--fa-dark-deep)] border border-[var(--fa-gold)]/40 p-4 sm:p-6">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)] mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--fa-gold)] text-[var(--fa-ink)] text-xs flex items-center justify-center font-bold not-italic font-[family-name:var(--font-geist-sans)]">2</span>
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">Street Address *</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House No. 12, Street 5, Block A..."
                      rows={2}
                      className={`${fieldClass(errors.address)} resize-none`}
                    />
                    {errors.address && <p className="text-xs text-[#e8927f] mt-1.5">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Lahore"
                        className={fieldClass(errors.city)}
                      />
                      {errors.city && <p className="text-xs text-[#e8927f] mt-1.5">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--fa-on-dark)] mb-1.5">Province</label>
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                        className={`${fieldClass(false)} [&>option]:bg-[var(--fa-ink)] [&>option]:text-[var(--fa-cream)]`}
                      >
                        <option value="">Select province</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[var(--fa-dark-deep)] border border-[var(--fa-gold)]/40 p-4 sm:p-6">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)] mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--fa-gold)] text-[var(--fa-ink)] text-xs flex items-center justify-center font-bold not-italic font-[family-name:var(--font-geist-sans)]">3</span>
                  Payment Method
                </h2>

                <div className="space-y-3 mb-4">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "cod" ? "border-[var(--fa-gold)] bg-[var(--fa-gold)]/10" : "border-[var(--fa-gold)]/25 hover:border-[var(--fa-gold)]/55"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className={`mt-0.5 accent-[var(--fa-gold)] ${FOCUS_RING}`}
                    />
                    <div>
                      <p className="font-semibold text-sm text-[var(--fa-cream)]">Cash on Delivery (COD)</p>
                      <p className="text-xs text-[var(--fa-on-dark)] mt-1">Pay with cash when your order arrives at your doorstep.</p>
                    </div>
                  </label>

                  {/* Online */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "online" ? "border-[var(--fa-gold)] bg-[var(--fa-gold)]/10" : "border-[var(--fa-gold)]/25 hover:border-[var(--fa-gold)]/55"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className={`mt-0.5 accent-[var(--fa-gold)] ${FOCUS_RING}`}
                    />
                    <div>
                      <p className="font-semibold text-sm text-[var(--fa-cream)]">Online Bank Transfer</p>
                      <p className="text-xs text-[var(--fa-on-dark)] mt-1">Transfer payment to our bank account and send receipt via WhatsApp. Order confirmed after payment verification.</p>
                    </div>
                  </label>
                </div>

                {/* Bank Details – shown when Online selected */}
                {paymentMethod === "online" && (
                  <div className="mt-2 p-4 bg-[var(--fa-ink)] border border-[var(--fa-gold)]/70">
                    <p className="font-[family-name:var(--font-playfair)] italic text-base text-[var(--fa-gold)] mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Bank Transfer Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--fa-muted-dark)]">Bank</span>
                        <span className="font-semibold text-[var(--fa-cream)] text-right">{BANK_INFO.bankName}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--fa-muted-dark)]">Account Title</span>
                        <span className="font-semibold text-[var(--fa-cream)] text-right">{BANK_INFO.accountTitle}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--fa-muted-dark)]">Account No.</span>
                        <span className="font-semibold text-[var(--fa-cream)] font-mono text-right">{BANK_INFO.accountNumber}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--fa-muted-dark)] shrink-0">IBAN</span>
                        <span className="font-semibold text-[var(--fa-cream)] font-mono text-xs text-right break-all">{BANK_INFO.iban}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--fa-gold)]/25 flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#25d366] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <p className="text-xs text-[var(--fa-on-dark)] leading-relaxed">
                        After placing your order, send payment proof on WhatsApp:{" "}
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-bold text-[var(--fa-gold)] underline hover:no-underline hover:text-[var(--fa-gold-hover)] transition-colors ${FOCUS_RING}`}
                        >
                          +{WHATSAPP_NUMBER}
                        </a>
                        . Your order will be confirmed once payment is verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-[var(--fa-dark-deep)] border border-[var(--fa-gold)]/40 p-4 sm:p-6">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)] mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--fa-gold)] text-[var(--fa-ink)] text-xs flex items-center justify-center font-bold not-italic font-[family-name:var(--font-geist-sans)]">4</span>
                  Order Notes <span className="text-[var(--fa-muted-dark)] font-normal text-sm not-italic font-[family-name:var(--font-geist-sans)]">(Optional)</span>
                </h2>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Special instructions for your order..."
                  rows={3}
                  className={`${fieldClass(false)} resize-none`}
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="bg-[var(--fa-dark-deep)] border border-[var(--fa-gold)]/40 p-4 sm:p-6 static lg:sticky lg:top-24">
                <div className="inline-block mb-4">
                  <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)]">Order Summary</h2>
                  <Rule className="mt-1.5" />
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-[var(--fa-ink)] border border-[var(--fa-gold)]/30">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full bg-[var(--fa-ink)]" />
                        )}
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--fa-gold)] text-[var(--fa-ink)] text-[10px] rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--fa-cream)] line-clamp-2">{item.name}</p>
                        {item.edition && <p className="text-[10px] text-[var(--fa-muted-dark)] capitalize mt-0.5">{item.edition} · {item.size}</p>}
                        <p className="text-xs font-bold text-[var(--fa-cream)] mt-0.5">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--fa-gold)]/25 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--fa-on-dark)]">
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  {summary.bundle.savings > 0 && (
                    <div className="flex justify-between text-[#4ade80]">
                      <span>Bundle Offer Discount</span>
                      <span>− PKR {summary.bundle.savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--fa-on-dark)]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-[#4ade80] font-medium" : ""}>
                      {shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[var(--fa-gold)] text-base pt-2 border-t border-[var(--fa-gold)]/25">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-5 border border-[var(--fa-gold)] bg-[var(--fa-gold)] text-[var(--fa-ink)] py-3.5 font-semibold text-sm transition-colors hover:bg-[var(--fa-gold-hover)] hover:border-[var(--fa-gold-hover)] ${BUTTON_FOCUS} disabled:bg-[#4a463c] disabled:border-[#4a463c] disabled:text-[var(--fa-on-dark)] disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--fa-on-dark)]/30 border-t-[var(--fa-on-dark)] rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod" ? "Place Order (COD)" : "Place Order & Pay Online"}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[var(--fa-muted-dark)] text-center mt-3">
                  By placing your order you agree to our terms of service.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
