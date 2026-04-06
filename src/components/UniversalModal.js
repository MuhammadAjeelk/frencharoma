"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function UniversalModal({
  isOpen,
  onClose,
  heading,
  details,
  children,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[420px] md:w-[500px] bg-white z-50 shadow-[−20px_0_60px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e8e4df] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-[#1a1a2e]">{heading}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#faf8f5] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <Image
              src="/icons/close.svg"
              alt="Close"
              width={18}
              height={18}
              className="w-[18px] h-[18px] opacity-60"
            />
          </button>
        </div>

        <div className="p-6">
          {details && (
            <div className="mb-6">
              <div className="prose prose-sm max-w-none">
                <div className="text-[14px] text-[#4a4540] whitespace-pre-line leading-relaxed">
                  {details}
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
