"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HERO_DESKTOP, HERO_MOBILE } from "@/lib/siteMedia";
import { confirmShape } from "./imageCheck";

// Add, remove, reorder and edit hero slides. Changes are a local draft until
// "Save slides"; image uploads go up straight away so the draft can show them,
// but nothing reaches the homepage until the list is saved.

const LINK_SUGGESTIONS = [
  "/collections/shop-all",
  "/collections/shop-all?bestSeller=true",
  "/collections/shop-all?specialOffer=true",
  "/collections/discovery-box",
];

const newId = () => `slide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

async function uploadArt(file, kind) {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  const res = await fetch("/api/admin/hero", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data; // { src, width, height }
}

function Thumb({ art, label, wide }) {
  return (
    <div
      className={`relative bg-gray-100 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center ${
        wide ? "aspect-[2880/985] w-full max-w-md" : "aspect-[1290/1405] w-24 shrink-0"
      }`}
    >
      {art?.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
        <img src={art.src} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <span className="text-[11px] text-gray-500 text-center px-2">No phone image — hidden on phones</span>
      )}
    </div>
  );
}

function SlideRow({ slide, index, count, onChange, onMove, onRemove, setBusy, busy }) {
  const desktopRef = useRef(null);
  const mobileRef = useRef(null);
  const [error, setError] = useState("");

  const replace = (kind) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!(await confirmShape(file, kind === "mobile" ? HERO_MOBILE : HERO_DESKTOP))) return;
    setBusy(true);
    try {
      const art = await uploadArt(file, kind);
      onChange({ ...slide, [kind]: art });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
  const small = "px-2.5 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500">Slide {index + 1}</span>
        <div className="flex gap-1.5">
          <button type="button" className={small} disabled={busy || index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            ↑
          </button>
          <button type="button" className={small} disabled={busy || index === count - 1} onClick={() => onMove(1)} aria-label="Move down">
            ↓
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 border border-red-200 text-red-700 text-xs rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
            disabled={busy || count === 1}
            title={count === 1 ? "The hero needs at least one slide" : undefined}
            onClick={onRemove}
          >
            Remove slide
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0 space-y-2">
          <Thumb art={slide.desktop} label={`${slide.title} — desktop`} wide />
          <input ref={desktopRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={replace("desktop")} />
          <button type="button" className={small} disabled={busy} onClick={() => desktopRef.current?.click()}>
            Replace desktop image
          </button>
        </div>
        <div className="space-y-2">
          <Thumb art={slide.mobile} label={`${slide.title} — phone`} />
          <input ref={mobileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={replace("mobile")} />
          <div className="flex flex-col gap-1.5">
            <button type="button" className={small} disabled={busy} onClick={() => mobileRef.current?.click()}>
              {slide.mobile ? "Replace phone" : "Add phone image"}
            </button>
            {slide.mobile && (
              <button type="button" className={small} disabled={busy} onClick={() => onChange({ ...slide, mobile: null })}>
                Remove phone
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <label className="block">
          <span className="text-xs text-gray-600">Name (for screen readers)</span>
          <input className={field} value={slide.title} maxLength={80} onChange={(e) => onChange({ ...slide, title: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Opens when clicked</span>
          <input
            className={field}
            value={slide.href}
            list="hero-link-suggestions"
            placeholder="/collections/shop-all"
            onChange={(e) => onChange({ ...slide, href: e.target.value })}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default function HeroSlidesEditor() {
  const router = useRouter();
  const addRef = useRef(null);
  const [saved, setSaved] = useState(null); // last list from the server
  const [draft, setDraft] = useState([]);
  const [isDefault, setIsDefault] = useState(true);
  const [maxSlides, setMaxSlides] = useState(10);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const dirty = saved !== null && JSON.stringify(saved) !== JSON.stringify(draft);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load");
        setSaved(d.slides);
        setDraft(d.slides);
        setIsDefault(d.isDefault);
        setMaxSlides(d.maxSlides);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Warn before leaving with unsaved slide changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (i, slide) => setDraft((d) => d.map((s, j) => (j === i ? slide : s)));
  const move = (i, by) =>
    setDraft((d) => {
      const next = [...d];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });
  const remove = (i) => {
    if (!window.confirm(`Remove “${draft[i].title}” from the hero? (Takes effect when you save.)`)) return;
    setDraft((d) => d.filter((_, j) => j !== i));
  };

  const add = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    if (!(await confirmShape(file, HERO_DESKTOP))) return;
    setBusy(true);
    try {
      const desktop = await uploadArt(file, "desktop");
      setDraft((d) => [
        ...d,
        { id: newId(), title: "New slide", href: "/collections/shop-all", desktop, mobile: null },
      ]);
      setNotice("Slide added below. Add a phone image, set its name and link, then save.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (method) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method,
        headers: method === "PUT" ? { "Content-Type": "application/json" } : undefined,
        body: method === "PUT" ? JSON.stringify({ slides: draft }) : undefined,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed");
      setSaved(d.slides);
      setDraft(d.slides);
      setIsDefault(d.isDefault);
      setNotice("Saved — live on the homepage within a few seconds.");
      router.refresh(); // drop the browser's cached copy of the homepage
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const restore = () => {
    if (!window.confirm("Put the hero back to the original slides? Your uploaded images stay on the server.")) return;
    send("DELETE");
  };

  const full = draft.length >= maxSlides;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hero slides</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            The banners already include their “Explore Collection” button, so the whole slide is the
            link. Desktop 2880 × 985, phone 1290 × 1405. A slide with no phone image is hidden on phones.
          </p>
        </div>
        {!loading && !isDefault && (
          <button type="button" onClick={restore} disabled={busy} className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50">
            Restore original slides
          </button>
        )}
      </div>

      <datalist id="hero-link-suggestions">
        {LINK_SUGGESTIONS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>

      {loading ? (
        <div className="p-6 text-center">
          <div className="w-7 h-7 mx-auto border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {draft.map((slide, i) => (
              <SlideRow
                key={slide.id}
                slide={slide}
                index={i}
                count={draft.length}
                busy={busy}
                setBusy={setBusy}
                onChange={(s) => update(i, s)}
                onMove={(by) => move(i, by)}
                onRemove={() => remove(i)}
              />
            ))}
          </div>

          {/* Sticky so Save stays in reach while scrolling a long list */}
          <div className="sticky bottom-0 z-10 mt-4 -mx-1 px-1 py-3 bg-gray-50/95 backdrop-blur flex flex-wrap items-center gap-2">
            <input ref={addRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={add} />
            <button
              type="button"
              onClick={() => addRef.current?.click()}
              disabled={busy || full}
              title={full ? `At most ${maxSlides} slides` : undefined}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-800 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              + Add slide
            </button>
            <button
              type="button"
              onClick={() => send("PUT")}
              disabled={busy || !dirty}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {busy ? "Working…" : "Save slides"}
            </button>
            {dirty && (
              <button
                type="button"
                onClick={() => setDraft(saved)}
                disabled={busy}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                Discard changes
              </button>
            )}
            {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
            {notice && !error && <span className="text-xs text-green-700">{notice}</span>}
          </div>
        </>
      )}
    </section>
  );
}
