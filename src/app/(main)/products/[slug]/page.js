"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import UniversalModal from "@/components/UniversalModal";

// ── Helper: lowest price across editions ───────────────────────────────────
function getLowestPrice(editions) {
  let lowest = Infinity;
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (v.isActive && v.price < lowest) lowest = v.price;
    }
  }
  return lowest === Infinity ? null : lowest;
}


// ── Notes Pyramid ──────────────────────────────────────────────────────────
function NotesPyramid({ notes }) {
  const layers = [
    { label: "Top Notes",   sublabel: "First Impression",      items: notes?.top    || [], icon: "✦", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800"  },
    { label: "Heart Notes", sublabel: "Soul of the Fragrance", items: notes?.middle || [], icon: "❋", bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-800"   },
    { label: "Base Notes",  sublabel: "Lasting Impression",    items: notes?.base   || [], icon: "◆", bg: "bg-stone-100", border: "border-stone-300",  text: "text-stone-800"  },
  ];
  if (!layers.some((l) => l.items.length > 0)) {
    return <p className="text-sm text-gray-400 italic">Fragrance notes coming soon.</p>;
  }
  return (
    <div className="space-y-3">
      {layers.map(
        (layer) =>
          layer.items.length > 0 && (
            <div key={layer.label} className={`rounded-xl border ${layer.bg} ${layer.border} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-base ${layer.text}`}>{layer.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${layer.text}`}>{layer.label}</p>
                  <p className="text-[10px] text-gray-400">{layer.sublabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {layer.items.map((note) => (
                  <span key={note} className={`text-xs px-2.5 py-1 rounded-full bg-white border ${layer.border} ${layer.text} font-medium`}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

// ── Accordion Row (opens side modal) ──────────────────────────────────────
function AccordionRow({ title, icon, onClick }) {
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors px-1 rounded"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg leading-none">{icon}</span>}
          <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</span>
        </div>
        <span className="text-gray-400 text-lg">▾</span>
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params  = useParams();
  const slug    = params?.slug;
  const router  = useRouter();
  const { addItem } = useCart();

  const [perfume,         setPerfume]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [notFound,        setNotFound]        = useState(false);
  const [cartAdded,       setCartAdded]       = useState(false);

  const [selectedEdition, setSelectedEdition] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImgIndex,  setActiveImgIndex]  = useState(0);
  const [quantity,        setQuantity]        = useState(1);

  const [relatedPerfumes, setRelatedPerfumes] = useState([]);
  const [descExpanded,    setDescExpanded]    = useState(false);
  const [selectedSample,  setSelectedSample]  = useState("");

  // Side modal state
  const [sideModal, setSideModal] = useState({ open: false, heading: "", content: null });
  const openModal  = (heading, content) => setSideModal({ open: true, heading, content });
  const closeModal = () => setSideModal((s) => ({ ...s, open: false }));

  // ── Fetch perfume ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/perfumes/${slug}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        if (data.perfume) {
          setPerfume(data.perfume);
          const enabled = (data.perfume.editions || []).filter((e) => e.enabled);
          if (enabled.length > 0) {
            const firstEd = enabled[0];
            setSelectedEdition(firstEd);
            const firstV = (firstEd.variants || []).filter((v) => v.isActive)[0];
            setSelectedVariant(firstV || null);
          }
          setActiveImgIndex(0);
        }
      } catch { setNotFound(true); }
      finally  { setLoading(false); }
    };
    run();
  }, [slug]);

  // ── Fetch related perfumes ─────────────────────────────────────────────
  useEffect(() => {
    if (!perfume) return;
    const run = async () => {
      try {
        const p = new URLSearchParams();
        if (perfume.gender)      p.set("gender",     perfume.gender);
        if (perfume.scentFamily) p.set("scentFamily", perfume.scentFamily);
        p.set("limit", "5");
        const res  = await fetch(`/api/perfumes?${p}`);
        const data = await res.json();
        setRelatedPerfumes(
          (data.perfumes || []).filter((x) => x.slug !== perfume.slug).slice(0, 4)
        );
      } catch {}
    };
    run();
  }, [perfume]);

  // ── Edition change ─────────────────────────────────────────────────────
  const handleEditionChange = (ed) => {
    setSelectedEdition(ed);
    const firstV = (ed.variants || []).filter((v) => v.isActive)[0];
    setSelectedVariant(firstV || null);
    // If edition has variant-specific image, show it
    const edImg = firstV?.images?.main;
    if (edImg) {
      const imgs = buildDisplayImages(perfume, ed);
      const idx  = imgs.indexOf(edImg);
      setActiveImgIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveImgIndex(0);
    }
  };

  // ── Build display images ───────────────────────────────────────────────
  const buildDisplayImages = (p, ed) => {
    if (!p) return [];
    const imgs = [];
    if (p.images?.main) imgs.push(p.images.main);
    if (p.images?.gallery) for (const i of p.images.gallery) if (!imgs.includes(i)) imgs.push(i);
    if (ed) {
      for (const v of ed.variants || []) {
        if (v.images?.main && !imgs.includes(v.images.main)) imgs.push(v.images.main);
        for (const g of v.images?.gallery || []) if (!imgs.includes(g)) imgs.push(g);
      }
    }
    return imgs;
  };

  const displayImages  = buildDisplayImages(perfume, selectedEdition);
  const currentImage   = displayImages[Math.min(activeImgIndex, displayImages.length - 1)] || null;
  const enabledEditions = (perfume?.editions || []).filter((e) => e.enabled);
  const inStock        = !!(selectedVariant && selectedVariant.stock > 0 && selectedVariant.isActive);
  const brandLabel     = perfume
    ? (Array.isArray(perfume.brands) && perfume.brands.length > 0 ? perfume.brands[0] : perfume.brand || "")
    : "";

  const shortDesc     = perfume?.description?.slice(0, 200) || "";
  const needsReadMore = (perfume?.description?.length || 0) > 200;
  const hasSpecialOffer = Boolean(
    perfume?.isSpecialOffer ||
      (perfume?.tags || []).some((t) => /special\s*-?\s*offer/i.test(t))
  );

  // ── Cart / Buy Now ─────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!inStock || !selectedVariant) return;
    const disc        = perfume.discountPercent || 0;
    const finalPrice  = disc > 0
      ? Math.round(selectedVariant.price * (1 - disc / 100))
      : selectedVariant.price;
    for (let i = 0; i < quantity; i++) {
      addItem({
        perfumeId: perfume._id,
        slug:      perfume.slug,
        name:      perfume.name,
        image:     perfume.images?.main || "",
        edition:   selectedEdition?.key || "",
        size:      selectedVariant.size,
        price:     finalPrice,
      });
    }
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!inStock || !selectedVariant) return;
    handleAddToCart();
    router.push("/checkout");
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (notFound || !perfume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Product Not Found</h1>
        <p className="text-gray-500 mb-6">This perfume might have been removed or is no longer available.</p>
        <Link href="/collections/shop-all" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors font-semibold">
          Browse All Perfumes
        </Link>
      </div>
    );
  }

  const genderLabel =
    perfume.gender === "unisex" ? "Unisex"
    : perfume.gender === "women" ? "Women"
    : perfume.gender === "men"   ? "Men"
    : null;

  return (
      <div className="min-h-screen bg-white">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
            <span>/</span>
          <Link href="/collections/shop-all" className="hover:text-gray-800 transition-colors">Shop All</Link>
            <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{perfume.name}</span>
          </nav>
        </div>

      {/* ── Main Product Section ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ───── LEFT: Image Gallery ───── */}
          <div className="flex gap-3">

            {/* Thumbnail strip – desktop only */}
            {displayImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2 w-[68px] flex-shrink-0" style={{ maxHeight: "560px", overflowY: "auto" }}>
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors bg-white ${
                      activeImgIndex === idx
                        ? "border-black shadow-sm"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      width={68}
                      height={68}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image + nav arrows */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-50 w-full" style={{ aspectRatio: "2 / 3" }}>
              {currentImage ? (
                  <Image
                  src={currentImage}
                    alt={perfume.name}
                    fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

              {/* Prev / Next arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImgIndex((i) => (i - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImgIndex((i) => (i + 1) % displayImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Mobile dot indicators */}
              {displayImages.length > 1 && (
                <div className="lg:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {displayImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === activeImgIndex ? "bg-black" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
            </div>

          {/* ───── RIGHT: Product Info ───── */}
            <div className="flex flex-col">

            {/* Name + gender */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight uppercase tracking-wide mb-1">
              {perfume.name}
              {genderLabel && (
                <span className="ml-2 text-base font-normal text-gray-500 normal-case tracking-normal">
                  (For {genderLabel})
                </span>
              )}
              </h1>

            {hasSpecialOffer && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full uppercase tracking-wide border border-rose-200">
                  🏷️ Special Offer
                </span>
              </div>
            )}

            {/* Inspired by */}
            {brandLabel && (
              <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-widest">
                Inspired By: <span className="text-gray-800">{brandLabel}</span>
              </p>
            )}

            {perfume.impressionName && (
              <p className="text-sm text-gray-600 mb-1">
                Impression: <span className="font-semibold text-gray-800">{perfume.impressionName}</span>
              </p>
            )}

            {/* Scent family / concentration */}
                {perfume.scentFamily && (
              <p className="text-sm text-gray-600 mb-3">
                Concentration: <span className="font-semibold">{perfume.scentFamily}</span>
                </p>
              )}

            {/* Season Tags */}
            {(() => {
              const SEASON_LABELS = {
                "spring-summer": "Spring & Summer",
                "autumn-winter": "Autumn & Winter",
                "spring":        "Spring",
                "summer":        "Summer",
                "autumn":        "Autumn",
                "winter":        "Winter",
                "all-seasons":   "All Seasons",
              };
              const seasonTags = (perfume.tags || []).filter((t) => SEASON_LABELS[t]);
              return seasonTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {seasonTags.map((tag) => (
                  <span
                    key={tag}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide"
                  >
                      {SEASON_LABELS[tag]}
                  </span>
                ))}
              </div>
              ) : null;
            })()}

            <div className="h-px bg-gray-100 my-3" />

            {/* ── Edition Selector ── */}
            {enabledEditions.length > 0 && (
              <div className="mb-4">
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">
                  Choose Edition
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {enabledEditions.map((ed) => {
                    const variants  = (ed.variants || []).filter((v) => v.isActive);
                    const minPrice  = variants.reduce((m, v) => (v.price < m ? v.price : m), Infinity);
                    const disc      = perfume.discountPercent || 0;
                    const dispPrice = disc > 0 && minPrice < Infinity
                      ? Math.round(minPrice * (1 - disc / 100))
                      : minPrice;
                    const isSelected = selectedEdition?.key === ed.key;
                    return (
                      <button
                        key={ed.key}
                        onClick={() => handleEditionChange(ed)}
                        className={`flex flex-col items-center px-4 py-2.5 rounded-lg border-2 transition-all min-w-[110px] capitalize ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wide">{ed.key} Edition</span>
                        {minPrice < Infinity && (
                          <span className={`text-xs mt-0.5 font-semibold ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                            PKR {dispPrice.toLocaleString()}
                            {disc > 0 && <span className="ml-1 line-through opacity-60">{minPrice.toLocaleString()}</span>}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}

            {/* ── Stock indicator ── */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2.5 h-2.5 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
              <span className={`text-sm font-semibold ${inStock ? "text-green-700" : "text-red-500"}`}>
                        {inStock
                  ? "In Stock"
                  : selectedVariant
                  ? "Out of Stock"
                  : "Select an option"}
                      </span>
                  </div>

            {/* ── Size selector ── */}
            {selectedEdition && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">Size:</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedEdition.variants || [])
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <button
                          key={v.size}
                          onClick={() => setSelectedVariant(v)}
                        disabled={v.stock === 0}
                        className={`px-5 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                            selectedVariant?.size === v.size
                            ? "bg-black text-white border-black shadow"
                              : v.stock === 0
                              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                              : "border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                          }`}
                      >
                        {v.size}
                        </button>
                      ))}
                  </div>
                </div>
              )}

            {/* ── Price display ── */}
            {selectedVariant && (() => {
              const disc = perfume.discountPercent || 0;
              const orig = selectedVariant.price;
              const final = disc > 0 ? Math.round(orig * (1 - disc / 100)) : orig;
              return (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    PKR {final.toLocaleString()}
                  </span>
                  {disc > 0 && (
                    <>
                      <span className="text-base text-gray-400 line-through">
                        PKR {orig.toLocaleString()}
                    </span>
                      <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        -{disc}% OFF
                      </span>
                    </>
                    )}
                  </div>
              );
            })()}

            {/* ── Quantity ── */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">Quantity:</p>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg leading-none"
                  >
                    −
                  </button>
                <span className="px-5 py-2.5 text-gray-900 font-bold min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        selectedVariant ? Math.min(selectedVariant.stock, q + 1) : q + 1
                      )
                    }
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg leading-none"
                  >
                    +
                  </button>
              </div>
            </div>

            {/* ── Free sample dropdown ── */}
            <div className="mb-4">
              <div className="relative">
                <select
                  value={selectedSample}
                  onChange={(e) => setSelectedSample(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value="">Choose free 5-ml sample from the list</option>
                  <option value="none">No sample, thanks</option>
                  <option value="flower-bouquet">Flower Bouquet</option>
                  <option value="white-pearls">White Pearls</option>
                  <option value="rose-elixir">Rose Elixir</option>
                  <option value="amber-noir">Amber Noir</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                This list will show different testers for each individual perfume. According to perfume categories.
              </p>
            </div>

            {/* ── Feature icons row ── */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { emoji: "🚚", label: "Free Shipping",      sub: "Across Rs. 7,000+"     },
                { emoji: "🌸", label: "Original French",    sub: "Perfume Oils"          },
                { emoji: "💎", label: "High Concentration", sub: "of Perfume Oils"       },
                { emoji: "🎁", label: "Sample Gift",        sub: "in Every Box"          },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center text-center gap-1 py-3 px-1 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <span className="text-2xl leading-none">{b.emoji}</span>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">{b.label}</p>
                  <p className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">{b.sub}</p>
                </div>
              ))}
                </div>

            {/* ── ADD TO CART ── */}
                <button
                  disabled={!inStock || !selectedVariant}
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all mb-3 ${
                    inStock && selectedVariant
                  ? "bg-black text-white hover:bg-gray-800 shadow hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
              {cartAdded
                ? "✓ Added to Cart!"
                : !selectedVariant
                    ? "Select a Size"
                    : !inStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

            {/* ── Buy Now ── */}
                <button
              disabled={!inStock || !selectedVariant}
              onClick={handleBuyNow}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all mb-5 border-2 ${
                inStock && selectedVariant
                  ? "border-black text-black hover:bg-black hover:text-white"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
                >
                  Buy Now
                </button>

            {/* ── Short description ── */}
            {perfume.description && (
              <div className="mb-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  {descExpanded ? perfume.description : shortDesc}
                  {needsReadMore && !descExpanded && "…"}
                </p>
                {needsReadMore && (
                  <button
                    onClick={() => setDescExpanded((o) => !o)}
                    className="text-gray-500 underline text-xs mt-1 hover:text-black transition-colors"
                  >
                    {descExpanded ? "Show Less" : "Read More..."}
                  </button>
                )}
              </div>
            )}

            {/* ── Accordion Rows → open side modal ── */}
            <div className="border-b border-gray-200">

              <AccordionRow
                title="Fragrance Profile"
                icon="🌸"
                onClick={() =>
                  openModal("Fragrance Profile", <NotesPyramid notes={perfume.notes} />)
                }
              />

              <AccordionRow
                title={`Why Choose ${perfume.name}?`}
                icon="⭐"
                onClick={() =>
                  openModal(`Why Choose ${perfume.name}?`, (
                    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                      <p>Our impression perfumes are crafted using <strong>100% original French perfume oils</strong>, ensuring the highest scent fidelity to the original fragrance.</p>
                      <p>With a concentration of up to <strong>35% perfume oil</strong>, our formulas last 12–16 hours on skin — outperforming most department-store alternatives.</p>
                      <p>Each bottle is filled with <strong>50ml</strong> of premium fragrance, providing incredible value compared to branded counterparts that cost 10× more.</p>
                    </div>
                  ))
                }
              />

              <AccordionRow
                title="Disclaimer"
                icon="ℹ️"
                onClick={() =>
                  openModal("Disclaimer", (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      French Aromas perfumes are original impression fragrances inspired by luxury brands. We are not affiliated with or endorsed by the original brands. Our products are independently crafted using premium French perfume oils to recreate a similar scent experience.
                    </p>
                  ))
                }
              />

              <AccordionRow
                title="Shipping & Returns"
                icon="📦"
                onClick={() =>
                  openModal("Shipping & Returns", (
                    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                      <p><strong>Free Shipping</strong> on orders above PKR 7,000.</p>
                      <p><strong>Standard Delivery:</strong> 3–5 working days across Pakistan.</p>
                      <p><strong>Returns:</strong> We accept returns within 7 days of delivery if the product is unopened and in its original packaging.</p>
                    </div>
                  ))
                }
              />

              <AccordionRow
                title="FAQs"
                icon="❓"
                onClick={() =>
                  openModal("Frequently Asked Questions", (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Q: Why is the impression perfume so affordable compared to the original?</p>
                        <p>Our perfumes skip expensive branding & marketing costs. You only pay for the fragrance itself — crafted with the same French perfume oils.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Q: Is it also cheaper than other locally made impressions?</p>
                        <p>Yes — we source directly from French oil suppliers and operate with minimal overhead, making our pricing the most competitive without sacrificing quality.</p>
                      </div>
                    </div>
                  ))
                }
              />

                  </div>
              </div>
            </div>
          </div>

      {/* ═══════════════════════════════════════════════════════
           ORIGINAL vs. IMPRESSION COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-white py-14 px-4 mt-2 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center uppercase tracking-wide mb-1" style={{ color: "#1a1a2e" }}>
            Original vs. Impression
              </h2>
          <p className="text-sm text-center text-gray-500 mb-10">
            Experience the Essence — Choose What Fits You Best.
          </p>

          <div className="flex items-center gap-4 sm:gap-6">

            {/* ── Left: Original perfume image ── */}
            <div className="hidden sm:flex flex-col items-center justify-center flex-shrink-0 w-[180px]">
              <div className="relative w-[160px] h-[220px]">
                {perfume.images?.main ? (
                  <Image
                    src={perfume.images.main}
                    alt="Original perfume"
                    fill
                    className="object-cover rounded-lg shadow-md"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 text-center px-2">{brandLabel}</span>
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute -top-3 -left-3 bg-red-600 text-white font-bold rounded-lg shadow-lg px-2 py-1 text-center leading-tight transform -rotate-6"
                  style={{ fontSize: "9px", minWidth: "64px" }}>
                  <div>Price in PKR :</div>
                  <div className="text-[11px]">Rs. {brandLabel || "—"}</div>
                </div>
              </div>
            </div>

            {/* ── Center: Comparison table ── */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse overflow-hidden rounded-xl" style={{ borderRadius: "12px" }}>
                <thead>
                  <tr>
                    <th className="text-white py-4 px-4 text-center font-bold text-sm sm:text-base" style={{ borderRadius: "10px 0 0 0", backgroundColor: "#1a1a2e" }}>
                      Original Perfume
                    </th>
                    <th className="bg-gray-500 text-white py-4 px-4 text-center font-bold text-sm sm:text-base">
                      Features
                    </th>
                    <th className="text-white py-4 px-4 text-center font-bold text-sm sm:text-base" style={{ borderRadius: "0 10px 0 0", backgroundColor: "#1a1a2e" }}>
                      Impression Perfume
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [brandLabel || "—",   "Fragrance Name",       perfume.name          ],
                    ["Ex Nihilo",          "Brand",                "French Aromas"       ],
                    ["French",             "Perfume Oil",          "French"              ],
                    ["Original",           "Scent Similarity",     "99% Same as original"],
                    ["10 – 12 hrs",        "Longevity",            "12 – 16 hrs"         ],
                    ["Original",           "Projection & Sillage", "99% Same as original"],
                    ["100 ML",             "Quantity",             "50 ML"               ],
                    ["NO",                 "Return Policy",        "YES"                 ],
                    ["NO",                 "Tester Availability",  "YES"                 ],
                  ].map(([orig, feat, imp], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 px-4 text-center text-gray-700 text-sm sm:text-base border border-gray-200">{orig}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900 text-sm sm:text-base bg-gray-100 border border-gray-200">{feat}</td>
                      <td className="py-3 px-4 text-center text-gray-700 text-sm sm:text-base border border-gray-200">{imp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Right: Our impression image ── */}
            <div className="hidden sm:flex flex-col items-center justify-center flex-shrink-0 w-[180px]">
              <div className="relative w-[160px] h-[220px]">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={perfume.name}
                    fill
                    className="object-cover rounded-lg shadow-md"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 text-center px-2">{perfume.name}</span>
                      </div>
                )}
                {/* Price badge */}
                <div className="absolute -top-3 -right-3 bg-red-600 text-white font-bold rounded-lg shadow-lg px-2 py-1 text-center leading-tight transform rotate-6"
                  style={{ fontSize: "9px", minWidth: "64px" }}>
                  <div>Price in PKR :</div>
                  <div className="text-[11px]">
                    {selectedVariant?.price
                      ? `Rs. ${selectedVariant.price.toLocaleString()}/-`
                      : getLowestPrice(perfume.editions)
                      ? `Rs. ${getLowestPrice(perfume.editions).toLocaleString()}/-`
                      : "—"}
                      </div>
                    </div>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
           YOU MAY ALSO LIKE
          ═══════════════════════════════════════════════════════ */}
          {relatedPerfumes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center uppercase tracking-wide mb-8" style={{ color: "#1a1a2e" }}>
            You May Also Like
              </h2>
         
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedPerfumes.map((rp) => {
                  const rpPrice = getLowestPrice(rp.editions);
              const rpBrand = (Array.isArray(rp.brands) && rp.brands.length > 0)
                ? rp.brands[0]
                    : rp.brand || "";
                  return (
                    <div
                      key={rp._id}
                  className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <Link
                        href={`/products/${rp.slug}`}
                        className="block relative w-full aspect-square overflow-hidden bg-gray-50"
                      >
                    {rp.images?.main ? (
                          <Image
                        src={rp.images.main}
                            alt={rp.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        {rpBrand && (
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{rpBrand}</p>
                        )}
                        <Link href={`/products/${rp.slug}`}>
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                            {rp.name}
                          </h3>
                        </Link>
                        <div className="flex-1" />
                        {rpPrice !== null && (
                          <p className="text-sm font-bold text-gray-900 mb-2">
                        PKR {rpPrice.toLocaleString()}
                          </p>
                        )}
                        <Link
                          href={`/products/${rp.slug}`}
                      className="block text-center border border-black text-black py-1.5 rounded-lg hover:bg-black hover:text-white transition-colors text-xs font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


      {/* ── Side Modal ── */}
      <UniversalModal
        isOpen={sideModal.open}
        onClose={closeModal}
        heading={sideModal.heading}
      >
        {sideModal.content}
      </UniversalModal>

    </div>
  );
}
