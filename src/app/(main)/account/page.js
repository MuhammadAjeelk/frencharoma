"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Rule } from "@/components/ui/SectionHeading";
import { GOLD_GLOW_WITH_BORDER, FOCUS_RING } from "@/lib/design";

// A card heading: Playfair italic over a rule sized to the words — the device
// the footer columns and the homepage sections use.
function CardHeading({ children }) {
  return (
    <div className="inline-block mb-5">
      <h2 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[var(--fa-gold)]">
        {children}
      </h2>
      <Rule className="mt-1.5" />
    </div>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div>
      <p className="text-[12px] text-[var(--fa-muted-dark)]">{label}</p>
      <p className={`mt-0.5 text-[var(--fa-cream)] break-words ${className}`}>{value}</p>
    </div>
  );
}

function Chevron() {
  return (
    <svg className="w-5 h-5 shrink-0 text-[var(--fa-muted-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// Square row, thin gold frame, gold glow on hover — never a lift.
const ROW = `group flex items-center justify-between gap-3 border border-[var(--fa-gold)]/35 bg-[var(--fa-dark-deep)] p-4 ${GOLD_GLOW_WITH_BORDER}`;

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--fa-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--fa-gold)]/25 border-t-[var(--fa-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--fa-dark)] py-10 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block">
            <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[var(--fa-gold)]">
              My Account
            </h1>
            <Rule className="mt-2" />
          </div>
        </div>

        <div className="border border-[var(--fa-gold)]/40 bg-[var(--fa-dark-deep)]">
          {/* Account Info */}
          <div className="p-5 sm:p-6 border-b border-[var(--fa-gold)]/25">
            <CardHeading>Account Information</CardHeading>
            <div className="space-y-3 text-sm">
              <Field label="Name" value={user.name || "Not provided"} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} className="capitalize" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 sm:p-6">
            <CardHeading>Quick Actions</CardHeading>
            <div className="space-y-3">
              {isAdmin && (
                <Link href="/admin" className={ROW}>
                  <div className="flex items-center gap-3 min-w-0">
                    <svg
                      className="w-5 h-5 shrink-0 text-[var(--fa-gold)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-[var(--fa-cream)] truncate">Admin Panel</span>
                  </div>
                  <Chevron />
                </Link>
              )}

              <Link href="/account/orders" className={ROW}>
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    className="w-5 h-5 shrink-0 text-[var(--fa-gold)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[var(--fa-cream)] truncate">My Orders</span>
                </div>
                <Chevron />
              </Link>

              <Link href="/" className={ROW}>
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    className="w-5 h-5 shrink-0 text-[var(--fa-gold)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[var(--fa-cream)] truncate">Continue Shopping</span>
                </div>
                <Chevron />
              </Link>

              <button
                onClick={logout}
                className={`w-full flex items-center justify-between gap-3 border border-[#8f4a3c] bg-[var(--fa-dark-deep)] p-4 text-left transition-colors duration-300 hover:border-[#c26a55] hover:bg-[#4a2624]/50 ${FOCUS_RING}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    className="w-5 h-5 shrink-0 text-[#e8927f]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[#e8927f] truncate">Log Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
