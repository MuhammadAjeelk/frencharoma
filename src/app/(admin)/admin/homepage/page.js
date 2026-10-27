"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_MEDIA_SECTIONS } from "@/lib/siteMedia";

// Replace any homepage image. Each save re-renders the homepage once on the
// server; visitors keep getting the cached page, so this never slows the site.

const ASPECT_TOLERANCE = 0.08; // warn when an upload is >8% off the slot's shape

function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function SlotCard({ slot, override, onSaved, onReset }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(null); // "upload" | "reset" | null
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const current = override?.url
    ? { src: override.url, width: override.width, height: override.height }
    : slot.src
    ? { src: slot.src, width: slot.width, height: slot.height }
    : null;
  const isCustom = Boolean(override?.url);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setJustSaved(false);

    const size = await readImageSize(file);
    if (size) {
      const want = slot.width / slot.height;
      const got = size.width / size.height;
      if (Math.abs(got - want) / want > ASPECT_TOLERANCE) {
        const ok = window.confirm(
          `This image is ${size.width} × ${size.height}, but this spot is shaped for ` +
            `${slot.width} × ${slot.height}. It will be cropped to fit.\n\nUpload anyway?`,
        );
        if (!ok) return;
      }
    }

    setBusy("upload");
    try {
      const body = new FormData();
      body.append("key", slot.key);
      body.append("file", file);
      const res = await fetch("/api/admin/site-media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onSaved(data);
      setJustSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    if (!window.confirm(`Put “${slot.label}” back to the original image?`)) return;
    setError("");
    setJustSaved(false);
    setBusy("reset");
    try {
      const res = await fetch(`/api/admin/site-media?key=${encodeURIComponent(slot.key)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      onReset(slot.key);
      setJustSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      {/* Checkerboard so transparent icons are visible against it */}
      <div
        className="relative flex items-center justify-center h-44 p-3 bg-gray-100"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
        }}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
          <img src={current.src} alt={slot.label} className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-xs text-gray-500 text-center px-4">No image yet</p>
        )}
        {busy && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isCustom ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          {isCustom ? "Replaced" : current ? "Original" : "Empty"}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{slot.label}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{slot.hint}</p>
        {current?.width && (
          <p className="text-[11px] text-gray-400">
            Current: {current.width} × {current.height}
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {justSaved && !error && (
          <p className="text-xs text-green-700">Saved — live on the homepage within a few seconds.</p>
        )}

        <div className="mt-auto pt-2 flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={pick}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={Boolean(busy)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {busy === "upload" ? "Uploading…" : "Replace"}
          </button>
          {isCustom && (
            <button
              type="button"
              onClick={reset}
              disabled={Boolean(busy)}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {busy === "reset" ? "Resetting…" : "Reset"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomepageImagesPage() {
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-media")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load");
        setOverrides(Object.fromEntries((d.overrides || []).map((o) => [o.key, o])));
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const replacedCount = Object.keys(overrides).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Images</h1>
        <p className="text-gray-600 mt-1">
          Replace any image on the homepage. Uploads are resized and converted automatically, so
          large files are fine. The original stays available — “Reset” puts it back.
        </p>
        {!loading && !loadError && (
          <p className="text-sm text-gray-500 mt-2">
            {replacedCount === 0 ? "All images are the originals." : `${replacedCount} image${replacedCount === 1 ? "" : "s"} replaced.`}
          </p>
        )}
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {SITE_MEDIA_SECTIONS.map((section) => (
            <section key={section.id}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                {section.note && <p className="text-sm text-gray-500 mt-0.5">{section.note}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.slots.map((slot) => (
                  <SlotCard
                    key={slot.key}
                    slot={slot}
                    override={overrides[slot.key]}
                    onSaved={(data) =>
                      setOverrides((o) => ({
                        ...o,
                        [slot.key]: { key: slot.key, url: data.url, width: data.width, height: data.height },
                      }))
                    }
                    onReset={(key) =>
                      setOverrides((o) => {
                        const next = { ...o };
                        delete next[key];
                        return next;
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
