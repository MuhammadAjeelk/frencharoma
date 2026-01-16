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
  // Prevent body scroll when modal is open
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Modal */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[500px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <Image
              src="/icons/close.svg"
              alt="Close"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {details && (
            <div className="mb-6">
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-line">
                  {details}
                </div>
              </div>
            </div>
          )}

          {/* Custom children content */}
          {children}
        </div>
      </div>
    </>
  );
}
