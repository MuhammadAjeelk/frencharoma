"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Rule } from "@/components/ui/SectionHeading";
import { FIELD_DARK, FOCUS_RING, viewAllClass } from "@/lib/design";

// Form chrome on the dark ground, matching the footer's newsletter field.
const INPUT = `block w-full px-4 py-3 text-sm ${FIELD_DARK} ${FOCUS_RING}`;
const LABEL = "block text-[13px] font-medium text-[#cbbfae] mb-1.5";
// Disabled has to stay visible on #2e2e2e — a dimmed gold, not a pale grey.
// The focus ring is spelled out rather than composed from FOCUS_RING: that
// constant carries `ring-offset-0`, and a gold ring flush on a gold fill is
// only 1.42:1. Overriding it would leave both offset utilities in the class
// list, where the winner depends on Tailwind's stylesheet order.
const SUBMIT =
  "w-full flex justify-center items-center border border-[#c9a25a] bg-[#c9a25a] py-3 px-4 text-sm font-semibold text-[#211d18] hover:bg-[#e3c489] hover:border-[#e3c489] focus-visible:ring-2 focus-visible:ring-[#e3c489] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e2e2e] disabled:bg-[#6f5c3a] disabled:border-[#6f5c3a] disabled:text-[#efe7db] disabled:cursor-not-allowed transition-colors";
// The required marker: red on the dark ground, not the old #ef4444.
const REQUIRED = "text-[#e8927f]";

function EyeIcon({ off }) {
  return off ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, user, loading: authLoading } = useAuth();
  const { error, success } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name);
      success("Account created successfully!");
      router.push(redirect);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingFallback />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#373838] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
            Create Account
          </h1>
          <Rule className="mt-2" />
        </div>
        <p className="mt-4 font-[family-name:var(--font-playfair)] text-base md:text-lg text-[#d2c1ac]">
          Join us for exclusive fragrances
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* The double gold frame the gender cards and the newsletter box use */}
        <div className="border border-[#c9a25a]/60 p-1.5">
          <div className="border border-[#c9a25a]/30 bg-[#2e2e2e] py-8 px-5 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className={LABEL}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={INPUT}
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={LABEL}>
                  Email address <span className={REQUIRED}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={INPUT}
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={LABEL}>
                  Password <span className={REQUIRED}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`${INPUT} pr-12`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-[#a99d8c] hover:text-[#e3c489] focus:outline-none focus-visible:text-[#e3c489] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={LABEL}>
                  Confirm Password <span className={REQUIRED}>*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={INPUT}
                  placeholder="Confirm your password"
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className={SUBMIT}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#efe7db]/30 border-t-[#efe7db] rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-7">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c9a25a]/25" />
                </div>
                <div className="relative flex justify-center text-[13px]">
                  <span className="px-3 bg-[#2e2e2e] text-[#a99d8c]">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/account/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                  className={`${viewAllClass("dark")} w-full justify-center`}
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#373838] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a25a]/25 border-t-[#c9a25a] rounded-full animate-spin" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupForm />
    </Suspense>
  );
}
