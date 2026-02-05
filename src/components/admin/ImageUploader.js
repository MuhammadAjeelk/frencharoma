"use client";

import { useState, useRef, useId } from "react";
import { useToast } from "@/context/ToastContext";

export default function ImageUploader({
  value,
  onChange,
  onDelete,
  multiple = false,
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const inputId = useId();
  const { error } = useToast();

  const images = multiple ? (value || []) : (value ? [value] : []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();

      if (multiple) {
        files.forEach((file) => formData.append("files", file));
      } else {
        formData.append("file", files[0]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (multiple) {
        onChange([...images, ...data.urls]);
      } else {
        onChange(data.url);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (imageUrl) => {
    if (multiple) {
      onDelete(imageUrl);
    } else {
      onDelete();
    }
  };

  return (
    <div>
      {/* Image previews */}
      {images.length > 0 && (
        <div className={`mb-3 ${multiple ? "grid grid-cols-3 gap-2" : ""}`}>
          {images.map((url, index) => (
            <div
              key={index}
              className={`relative group ${multiple ? "" : "w-32 h-32"}`}
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className={`rounded-lg object-cover border border-gray-200 ${
                  multiple ? "w-full h-24" : "w-32 h-32"
                }`}
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {(multiple || images.length === 0) && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${multiple ? "multiple" : "single"}-${inputId}`}
          />
          <label
            htmlFor={`upload-${multiple ? "multiple" : "single"}-${inputId}`}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  {multiple ? "Add images" : "Upload image"}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP (max 5MB)
                </span>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
