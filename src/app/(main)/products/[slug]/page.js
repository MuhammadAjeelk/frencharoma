"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import UniversalModal from "@/components/UniversalModal";

// Helper: get lowest price across all enabled editions/variants
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

// Star rating display
function StarRating({ rating = 0, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-black" : "fill-none stroke-black"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

// Note pyramid visualization
function NotesPyramid({ notes }) {
  const layers = [
    {
      label: "Top Notes",
      sublabel: "First Impression",
      items: notes?.top || [],
      icon: "✦",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    {
      label: "Heart Notes",
      sublabel: "Soul of the Fragrance",
      items: notes?.middle || [],
      icon: "❋",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
    },
    {
      label: "Base Notes",
      sublabel: "Lasting Impression",
      items: notes?.base || [],
      icon: "◆",
      bg: "bg-stone-100",
      border: "border-stone-300",
      text: "text-stone-800",
    },
  ];

  const hasAny = layers.some((l) => l.items.length > 0);
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      {layers.map(
        (layer) =>
          layer.items.length > 0 && (
            <div
              key={layer.label}
              className={`rounded-xl border ${layer.bg} ${layer.border} p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-base ${layer.text}`}>{layer.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${layer.text}`}>
                    {layer.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{layer.sublabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {layer.items.map((note) => (
                  <span
                    key={note}
                    className={`text-xs px-2.5 py-1 rounded-full bg-white border ${layer.border} ${layer.text} font-medium`}
                  >
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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Selections
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Modal for related products quick view
  const [modalOpen, setModalOpen] = useState(false);

  // Related perfumes
  const [relatedPerfumes, setRelatedPerfumes] = useState([]);

  useEffect(() => {
    if (!slug) return;
    const fetchPerfume = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/perfumes/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data.perfume) {
          setPerfume(data.perfume);

          // Set default edition and variant
          const enabled = (data.perfume.editions || []).filter((e) => e.enabled);
          if (enabled.length > 0) {
            const firstEd = enabled[0];
            setSelectedEdition(firstEd);
            const firstVariant = (firstEd.variants || []).filter(
              (v) => v.isActive
            )[0];
            setSelectedVariant(firstVariant || null);
          }

          // Set default image
          setActiveImage(data.perfume.images?.main || null);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfume();
  }, [slug]);

  // Fetch related perfumes when perfume is loaded
  useEffect(() => {
    if (!perfume) return;
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams();
        if (perfume.gender) params.set("gender", perfume.gender);
        if (perfume.scentFamily) params.set("scentFamily", perfume.scentFamily);
        params.set("limit", "5");
        const res = await fetch(`/api/perfumes?${params.toString()}`);
        const data = await res.json();
        // Exclude current product
        setRelatedPerfumes(
          (data.perfumes || []).filter((p) => p.slug !== perfume.slug).slice(0, 4)
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [perfume]);

  const handleEditionChange = (edition) => {
    setSelectedEdition(edition);
    const firstVariant = (edition.variants || []).filter((v) => v.isActive)[0];
    setSelectedVariant(firstVariant || null);
    // Update image if edition has specific image
    const edImage = edition.images?.main || perfume?.images?.main || null;
    setActiveImage(edImage);
  };

  // All gallery images
  const allImages = (() => {
    if (!perfume) return [];
    const imgs = [];
    if (perfume.images?.main) imgs.push(perfume.images.main);
    if (perfume.images?.gallery) {
      for (const img of perfume.images.gallery) {
        if (!imgs.includes(img)) imgs.push(img);
      }
    }
    // Edition-specific images
    if (selectedEdition?.images?.main && !imgs.includes(selectedEdition.images.main)) {
      imgs.push(selectedEdition.images.main);
    }
    if (selectedEdition?.images?.gallery) {
      for (const img of selectedEdition.images.gallery) {
        if (!imgs.includes(img)) imgs.push(img);
      }
    }
    return imgs;
  })();

  // Variant images
  const variantImages = (() => {
    if (!selectedVariant?.images) return [];
    const imgs = [];
    if (selectedVariant.images.main) imgs.push(selectedVariant.images.main);
    if (selectedVariant.images.gallery) {
      for (const img of selectedVariant.images.gallery) {
        if (!imgs.includes(img)) imgs.push(img);
      }
    }
    return imgs;
  })();

  const displayImages = variantImages.length > 0 ? variantImages : allImages;

  const brandLabel = perfume
    ? Array.isArray(perfume.brands)
      ? perfume.brands.join(", ")
      : perfume.brand || ""
    : "";

  const enabledEditions = (perfume?.editions || []).filter((e) => e.enabled);

  const inStock =
    selectedVariant &&
    selectedVariant.stock > 0 &&
    selectedVariant.isActive;

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (notFound || !perfume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          This perfume might have been removed or is no longer available.
        </p>
        <Link
          href="/collections/shop-all"
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors font-semibold"
        >
          Browse All Perfumes
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-800 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/collections/shop-all"
              className="hover:text-gray-800 transition-colors"
            >
              Shop All
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {perfume.name}
            </span>
          </nav>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* ── LEFT: Image Gallery ── */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
                {activeImage || displayImages[0] ? (
                  <Image
                    src={activeImage || displayImages[0]}
                    alt={perfume.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors bg-white shrink-0 ${
                        activeImage === img
                          ? "border-black"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${perfume.name} view ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className="flex flex-col">
              {/* Brand */}
              {brandLabel && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  {brandLabel}
                </p>
              )}

              {/* Name */}
              <h1
                className="text-2xl sm:text-3xl font-bold mb-3 leading-tight"
                style={{ color: "#1a1a2e" }}
              >
                {perfume.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {perfume.gender && (
                  <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700 capitalize font-medium">
                    {perfume.gender}
                  </span>
                )}
                {perfume.scentFamily && (
                  <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                    {perfume.scentFamily}
                  </span>
                )}
                {(perfume.tags || []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              {perfume.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {perfume.description}
                </p>
              )}

              <div className="h-px bg-gray-100 mb-5" />

              {/* Edition Selector */}
              {enabledEditions.length > 1 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">
                    Edition
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {enabledEditions.map((ed) => (
                      <button
                        key={ed.key}
                        onClick={() => handleEditionChange(ed)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all capitalize ${
                          selectedEdition?.key === ed.key
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        {ed.key}
                      </button>
                    ))}
                  </div>
                  {selectedEdition?.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedEdition.description}
                    </p>
                  )}
                </div>
              )}

              {/* Size Selector */}
              {selectedEdition && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Size
                    </p>
                    {selectedVariant && (
                      <span className="text-xs text-gray-500">
                        {inStock
                          ? `${selectedVariant.stock} in stock`
                          : "Out of stock"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedEdition.variants || [])
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <button
                          key={v.size}
                          onClick={() => setSelectedVariant(v)}
                          className={`relative flex flex-col items-center justify-center px-4 py-2.5 text-sm rounded-lg border-2 transition-all min-w-[70px] ${
                            selectedVariant?.size === v.size
                              ? "border-black bg-black text-white shadow-md"
                              : v.stock === 0
                              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                              : "border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                          }`}
                          disabled={v.stock === 0}
                        >
                          <span className="font-semibold">{v.size}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              selectedVariant?.size === v.size
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            PKR {v.price.toFixed(0)}
                          </span>
                          {v.stock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-px bg-gray-300 rotate-45 absolute" />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="mb-5">
                {selectedVariant ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      PKR {selectedVariant.price.toFixed(2)}
                    </span>
                    {!inStock && (
                      <span className="text-sm text-red-500 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                ) : enabledEditions.length === 0 ? (
                  <p className="text-gray-400 text-sm">Price not available</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    From PKR {getLowestPrice(perfume.editions)?.toFixed(2) || "—"}
                  </p>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Quantity */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    −
                  </button>
                  <span className="px-4 py-3 text-gray-900 font-semibold min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        selectedVariant ? Math.min(selectedVariant.stock, q + 1) : q + 1
                      )
                    }
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  disabled={!inStock || !selectedVariant}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all ${
                    inStock && selectedVariant
                      ? "bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!selectedVariant
                    ? "Select a Size"
                    : !inStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>

              {/* Buy Now */}
              {inStock && selectedVariant && (
                <button className="animate-jiggle w-full py-3 px-6 rounded-lg font-bold text-sm border-2 border-black text-black hover:bg-black hover:text-white transition-all mb-6">
                  Buy Now
                </button>
              )}

              {/* SKU */}
              {selectedVariant?.sku && (
                <p className="text-xs text-gray-400 mb-4">
                  SKU: {selectedVariant.sku}
                </p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100">
                {[
                  { icon: "🚚", label: "Free Delivery", sub: "On orders over PKR 3000" },
                  { icon: "✅", label: "100% Authentic", sub: "Guaranteed genuine" },
                  { icon: "🔄", label: "Easy Returns", sub: "7-day return policy" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1">
                    <span className="text-xl">{b.icon}</span>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800">
                      {b.label}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500">{b.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Scent Notes Section ── */}
          {(perfume.notes?.top?.length > 0 ||
            perfume.notes?.middle?.length > 0 ||
            perfume.notes?.base?.length > 0) && (
            <div className="mt-16">
              <h2
                className="text-xl sm:text-2xl font-bold mb-6 text-center"
                style={{ color: "#1a1a2e" }}
              >
                FRAGRANCE NOTES
              </h2>
              <div className="max-w-xl mx-auto">
                <NotesPyramid notes={perfume.notes} />
              </div>
            </div>
          )}

          {/* ── Edition Details ── */}
          {enabledEditions.length > 0 && (
            <div className="mt-16">
              <h2
                className="text-xl sm:text-2xl font-bold mb-6 text-center"
                style={{ color: "#1a1a2e" }}
              >
                AVAILABLE EDITIONS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabledEditions.map((ed) => {
                  const activeVariants = (ed.variants || []).filter(
                    (v) => v.isActive
                  );
                  const edMin = activeVariants.reduce(
                    (min, v) => (v.price < min ? v.price : min),
                    Infinity
                  );
                  return (
                    <div
                      key={ed.key}
                      className={`rounded-xl border-2 p-5 transition-all ${
                        selectedEdition?.key === ed.key
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wide capitalize">
                          {ed.key} Edition
                        </h3>
                        {edMin < Infinity && (
                          <span className="text-sm font-bold">
                            From PKR {edMin.toFixed(0)}
                          </span>
                        )}
                      </div>
                      {ed.description && (
                        <p className="text-xs text-gray-500 mb-3">
                          {ed.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {activeVariants.map((v) => (
                          <span
                            key={v.size}
                            className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600"
                          >
                            {v.size} – PKR {v.price.toFixed(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Related Perfumes ── */}
          {relatedPerfumes.length > 0 && (
            <div className="mt-20">
              <h2
                className="text-xl sm:text-2xl font-bold mb-8 text-center"
                style={{ color: "#1a1a2e" }}
              >
                YOU MIGHT ALSO LIKE
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedPerfumes.map((rp) => {
                  const rpPrice = getLowestPrice(rp.editions);
                  const rpImage = rp.images?.main || null;
                  const rpBrand = Array.isArray(rp.brands)
                    ? rp.brands.join(", ")
                    : rp.brand || "";
                  return (
                    <div
                      key={rp._id}
                      className="group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      <Link
                        href={`/products/${rp.slug}`}
                        className="block relative w-full aspect-square bg-gray-50"
                      >
                        {rpImage ? (
                          <Image
                            src={rpImage}
                            alt={rp.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg
                              className="w-12 h-12 text-gray-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        {rpBrand && (
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                            {rpBrand}
                          </p>
                        )}
                        <Link href={`/products/${rp.slug}`}>
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                            {rp.name}
                          </h3>
                        </Link>
                        <div className="flex-1" />
                        {rpPrice !== null && (
                          <p className="text-sm font-bold text-gray-900 mb-2">
                            From PKR {rpPrice.toFixed(2)}
                          </p>
                        )}
                        <Link
                          href={`/products/${rp.slug}`}
                          className="block text-center border border-black text-black py-1.5 rounded hover:bg-black hover:text-white transition-colors text-xs font-medium"
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
        </div>
      </div>

      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        heading="Quick View"
      />
    </>
  );
}
