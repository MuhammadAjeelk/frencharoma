"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import UniversalModal from "@/components/UniversalModal";
import SectionHeading, { Rule } from "@/components/ui/SectionHeading";
import {
  GUTTER,
  SECTION_Y,
  CARD_FRAME,
  GOLD_GLOW_WITH_BORDER,
  PHOTO_HOVER,
  viewAllClass,
} from "@/lib/design";
import { getLowestPrice, isSignatureScent } from "@/lib/pricing";


// ── Notes Pyramid ──────────────────────────────────────────────────────────
function NotesPyramid({ notes }) {
  const layers = [
    { label: "Top Notes",   sublabel: "First Impression",      items: notes?.top    || [] },
    { label: "Heart Notes", sublabel: "Soul of the Fragrance", items: notes?.middle || [] },
    { label: "Base Notes",  sublabel: "Lasting Impression",    items: notes?.base   || [] },
  ];
  if (!layers.some((l) => l.items.length > 0)) {
    return <p className="text-sm italic text-[#211d18]/60">Fragrance notes coming soon.</p>;
  }
  return (
    <div className="space-y-3">
      {layers.map(
        (layer) =>
          layer.items.length > 0 && (
            <div key={layer.label} className="border border-[#c9a25a] bg-[#d4c6ab]/40 p-4">
              <p className="font-[family-name:var(--font-playfair)] italic text-base leading-tight text-[#211d18]">
                {layer.label}
              </p>
              <p className="mb-2.5 text-[11px] text-[#211d18]/60">{layer.sublabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {layer.items.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-[#c9a25a]/70 bg-white px-2.5 py-1 text-xs font-medium text-[#211d18]"
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

// ── Accordion Row (opens side modal) ──────────────────────────────────────
function AccordionRow({ title, onClick }) {
  return (
    <div className="border-t border-[#c9a25a]/25">
      <button
        onClick={onClick}
        className="group flex w-full items-center justify-between gap-3 px-2 py-4 text-left transition-colors hover:bg-[#c9a25a]/10"
      >
        <span className="text-sm font-semibold text-[#cbbfae] transition-colors group-hover:text-[#e3c489] break-words">
          {title}
        </span>
        <svg
          className="w-4 h-4 shrink-0 text-[#c9a25a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
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
  const { isInWishlist, toggleItem } = useWishlist();

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

  // Reviews
  const [reviews,         setReviews]         = useState([]);
  const [avgRating,       setAvgRating]       = useState(0);
  const [reviewTotal,     setReviewTotal]     = useState(0);
  const [showReviewForm,  setShowReviewForm]  = useState(false);
  const [reviewForm,      setReviewForm]      = useState({ name: "", rating: 5, title: "", body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // FAQ toggle
  const [openFaq,         setOpenFaq]         = useState(null);

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
            const actives = (firstEd.variants || []).filter((v) => v.isActive);
            const firstV = actives.find((v) => v.size !== "5ml") || actives[0] || null;
            setSelectedVariant(firstV);
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

  // ── Fetch reviews ───────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/reviews?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewTotal(data.total || 0);
      })
      .catch(() => {});
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!perfume || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfumeId: perfume._id,
          perfumeSlug: perfume.slug,
          name: reviewForm.name,
          rating: reviewForm.rating,
          title: reviewForm.title,
          body: reviewForm.body,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data.review, ...prev]);
        setReviewTotal((t) => t + 1);
        setShowReviewForm(false);
        setReviewForm({ name: "", rating: 5, title: "", body: "" });
      }
    } catch {}
    setReviewSubmitting(false);
  };

  // ── Edition change ─────────────────────────────────────────────────────
  const handleEditionChange = (ed) => {
    setSelectedEdition(ed);
    const actives = (ed.variants || []).filter((v) => v.isActive);
    setSelectedVariant(actives.find((v) => v.size !== "5ml") || actives[0] || null);
    setActiveImgIndex(0);
  };

  // ── Build display images (main + gallery) from an images object ────────
  const buildImageList = (imgObj) => {
    const imgs = [];
    if (imgObj?.main) imgs.push(imgObj.main);
    for (const i of imgObj?.gallery || []) {
      if (!imgs.includes(i)) imgs.push(i);
    }
    return imgs;
  };

  // When the selected variant has its own photos, the whole gallery (main +
  // thumbnails) reflects that variant. Otherwise fall back to the product's
  // default images.
  const variantImages = buildImageList(selectedVariant?.images);
  const displayImages =
    variantImages.length > 0 ? variantImages : buildImageList(perfume?.images);

  const currentImage =
    displayImages[Math.min(activeImgIndex, displayImages.length - 1)] || null;
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
        originalPrice: selectedVariant.price,
        discountPercent: disc,
        gender:    perfume.gender || "",
        impressionName: perfume.impressionName || "",
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
      <div className="min-h-screen flex items-center justify-center bg-[#373838]">
        <div className="w-10 h-10 rounded-full border-2 border-[#c9a25a]/25 border-t-[#c9a25a] animate-spin" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (notFound || !perfume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#373838] px-4 text-center">
        <div className="inline-block">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
            Product Not Found
          </h1>
          <Rule color="#c9a25a" className="mt-2" />
        </div>
        <p className="mt-5 mb-8 font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug text-[#d2c1ac]">
          This perfume might have been removed or is no longer available.
        </p>
        <Link href="/collections/shop-all" className={viewAllClass("dark")}>
          Browse All Perfumes
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
          </svg>
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
      <div className="min-h-screen bg-[#373838]">

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className={`${GUTTER} py-3`}>
        <nav className="flex items-center gap-2 text-xs text-[#a99d8c]">
          <Link href="/" className="transition-colors hover:text-[#e3c489]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/collections/shop-all" className="transition-colors hover:text-[#e3c489]">Shop All</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#cbbfae] truncate max-w-[9rem] sm:max-w-xs">{perfume.name}</span>
        </nav>
      </div>

      {/* ── Main Product Section ───────────────────────────────── */}
      <div className={`${GUTTER} pb-10 md:pb-12`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 items-start">

          {/* ───── LEFT: Image Gallery (sticky on desktop) ───── */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">

            {/* Main image + nav arrows */}
            <div className={`group relative w-full aspect-[6.818/7.5] bg-[#2e2e2e] ${CARD_FRAME} ${GOLD_GLOW_WITH_BORDER}`}>
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={perfume.name}
                  fill
                  className={`object-contain ${PHOTO_HOVER}`}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 px-4 text-center">
                  <svg className="w-16 h-16 text-[#c9a25a]/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs text-[#a99d8c]">Photography coming soon</span>
                </div>
              )}

              {/* Prev / Next arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImgIndex((i) => (i - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-[#c9a25a] bg-[#2e2e2e]/90 text-[#c9a25a] backdrop-blur-[2px] transition-colors duration-200 hover:bg-[#c9a25a] hover:text-[#211d18] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImgIndex((i) => (i + 1) % displayImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-[#c9a25a] bg-[#2e2e2e]/90 text-[#c9a25a] backdrop-blur-[2px] transition-colors duration-200 hover:bg-[#c9a25a] hover:text-[#211d18] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail row — below the main image, flush-left, images fill fully */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    aria-label={`Show image ${idx + 1} of ${displayImages.length}`}
                    aria-current={activeImgIndex === idx ? "true" : undefined}
                    className={`shrink-0 w-16 sm:w-[76px] aspect-[6.818/7.5] overflow-hidden border bg-[#2e2e2e] transition-colors duration-200 ${
                      activeImgIndex === idx
                        ? "border-[#e3c489]"
                        : "border-[#c9a25a]/35 hover:border-[#c9a25a]"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      width={76}
                      height={84}
                      className={`w-full h-full object-cover transition-opacity duration-200 ${
                        activeImgIndex === idx ? "opacity-100" : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ───── RIGHT: Product Info ───── */}
            <div className="flex flex-col">

            {/* Name + gender */}
            <div className="self-start max-w-full mb-3">
              <h1 className="font-[family-name:var(--font-playfair)] italic font-normal text-2xl sm:text-3xl md:text-4xl leading-tight text-[#c9a25a] break-words">
                {perfume.name}
                {genderLabel && (
                  <span className="ml-2 align-middle not-italic font-[family-name:var(--font-geist-sans)] text-sm sm:text-base text-[#a99d8c] whitespace-nowrap">
                    (For {genderLabel})
                  </span>
                )}
              </h1>
              <Rule color="#c9a25a" className="mt-2" />
            </div>

            {hasSpecialOffer && (
              <div className="mb-2">
                <span className="inline-flex items-center rounded-full border border-[#c9a25a] bg-[#c9a25a]/15 px-3 py-1 text-xs font-bold text-[#e3c489]">
                  Special Offer
                </span>
              </div>
            )}

            {/* Inspired by */}
            {brandLabel && (
              <p className="mb-1 text-sm text-[#a99d8c] break-words">
                Inspired By: <span className="font-semibold text-[#cbbfae]">{brandLabel}</span>
              </p>
            )}

            {perfume.impressionName && (
              <p className="mb-1 text-sm text-[#a99d8c] break-words">
                {!isSignatureScent(perfume.impressionName) && "Impression: "}
                <span className="font-semibold text-[#cbbfae]">{perfume.impressionName}</span>
              </p>
            )}

            {/* Scent family / concentration */}
            {perfume.scentFamily && (
              <p className="mb-1 text-sm text-[#a99d8c] break-words">
                Concentration: <span className="font-semibold text-[#cbbfae]">{perfume.scentFamily}</span>
              </p>
            )}

            {/* Globally Admired */}
            <p className="mb-3 text-sm text-[#a99d8c]">
              Globally Admired:{" "}
              <span className="font-bold text-[#e3c489]">
                {Math.min(100, Math.max(60, Number(perfume.globalAdmirePercent) || 60))}%
              </span>
            </p>

            {/* Season Tags */}
            {(() => {
              const SEASON_LABELS = {
                "spring-summer": "Summer & Spring",
                "autumn-winter": "Winter & Autumn",
                "spring":        "Spring",
                "summer":        "Summer",
                "autumn":        "Autumn",
                "winter":        "Winter",
                "all-seasons":   "Four Seasons (Versatile)",
              };
              const seasonTags = (perfume.tags || []).filter((t) => SEASON_LABELS[t]);
              return seasonTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {seasonTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#c9a25a]/45 bg-[#2e2e2e] px-3 py-1 text-xs font-medium text-[#cbbfae]"
                    >
                      {SEASON_LABELS[tag]}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            <div className="h-px bg-[#c9a25a]/25 my-4" />

            {/* ── Edition Selector ── */}
            {enabledEditions.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[13px] font-semibold text-[#a99d8c]">Choose Edition</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {enabledEditions.map((ed) => {
                    const activeVariants = (ed.variants || []).filter((v) => v.isActive);
                    // Price the actual bottle: exclude the 5ml tester unless it's
                    // the only size available for this edition.
                    const fullSize  = activeVariants.filter((v) => v.size !== "5ml");
                    const priced    = fullSize.length > 0 ? fullSize : activeVariants;
                    const minPrice  = priced.reduce((m, v) => (v.price < m ? v.price : m), Infinity);
                    const disc      = perfume.discountPercent || 0;
                    const dispPrice = disc > 0 && minPrice < Infinity
                      ? Math.round(minPrice * (1 - disc / 100))
                      : minPrice;
                    const isSelected = selectedEdition?.key === ed.key;
                    return (
                      <button
                        key={ed.key}
                        onClick={() => handleEditionChange(ed)}
                        aria-pressed={isSelected}
                        className={`flex min-w-[118px] flex-col items-center border px-4 py-2.5 capitalize transition-colors ${
                          isSelected
                            ? "border-[#e3c489] bg-[#c9a25a] text-[#211d18]"
                            : "border-[#c9a25a]/45 text-[#cbbfae] hover:border-[#e3c489] hover:text-[#e3c489]"
                        }`}
                      >
                        <span className="text-xs font-bold">{ed.key} Edition</span>
                        {minPrice < Infinity && (
                          <span className={`mt-0.5 text-xs font-semibold ${isSelected ? "text-[#211d18]/75" : "text-[#a99d8c]"}`}>
                            PKR {dispPrice.toLocaleString()}
                            {disc > 0 && <span className="ml-1 line-through opacity-70">{minPrice.toLocaleString()}</span>}
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
              <span className={`w-2.5 h-2.5 rounded-full ${inStock ? "bg-[#7cc47f]" : "bg-[#e07a72]"}`} aria-hidden="true" />
              <span className={`text-sm font-semibold ${inStock ? "text-[#7cc47f]" : "text-[#e07a72]"}`}>
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
                <p className="mb-2 text-[13px] font-semibold text-[#a99d8c]">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedEdition.variants || [])
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <button
                          key={v.size}
                          onClick={() => { setSelectedVariant(v); setActiveImgIndex(0); }}
                        title={v.stock === 0 ? `${v.size} — out of stock` : undefined}
                        aria-pressed={selectedVariant?.size === v.size}
                        className={`rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
                          selectedVariant?.size === v.size
                            ? "border-[#e3c489] bg-[#c9a25a] text-[#211d18]"
                            : v.stock === 0
                            ? "border-[#5a564f] text-[#8b8377] line-through hover:border-[#8b8377]"
                            : "border-[#c9a25a]/45 text-[#cbbfae] hover:border-[#e3c489] hover:text-[#e3c489]"
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
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-[#e3c489]">
                    PKR {final.toLocaleString()}
                  </span>
                  {disc > 0 && (
                    <>
                      <span className="text-base text-[#a99d8c] line-through">
                        PKR {orig.toLocaleString()}
                      </span>
                      <span className="rounded-full border border-[#e07a72]/60 bg-[#e07a72]/15 px-2.5 py-0.5 text-xs font-bold text-[#e8877f]">
                        -{disc}% OFF
                      </span>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Quantity ── */}
            <div className="mb-4">
              <p className="mb-2 text-[13px] font-semibold text-[#a99d8c]">Quantity</p>
              <div className="flex w-fit items-center border border-[#c9a25a]/45">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-4 py-2.5 text-lg font-bold leading-none text-[#cbbfae] transition-colors hover:bg-[#c9a25a] hover:text-[#211d18]"
                >
                  −
                </button>
                <span className="min-w-[48px] border-x border-[#c9a25a]/45 px-5 py-2.5 text-center font-bold text-[#e3c489]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      selectedVariant ? Math.min(selectedVariant.stock, q + 1) : q + 1
                    )
                  }
                  aria-label="Increase quantity"
                  className="px-4 py-2.5 text-lg font-bold leading-none text-[#cbbfae] transition-colors hover:bg-[#c9a25a] hover:text-[#211d18]"
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
                  aria-label="Choose a free 5-ml sample"
                  className="w-full cursor-pointer appearance-none border border-[#c9a25a]/45 bg-[#2e2e2e] px-4 py-2.5 pr-10 text-sm text-[#cbbfae] transition-colors focus:outline-none focus:border-[#e3c489]"
                >
                  <option value="">Choose free 5-ml sample from the list</option>
                  <option value="none">No sample, thanks</option>
                  <option value="flower-bouquet">Flower Bouquet</option>
                  <option value="white-pearls">White Pearls</option>
                  <option value="rose-elixir">Rose Elixir</option>
                  <option value="amber-noir">Amber Noir</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-[#c9a25a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] leading-tight text-[#a99d8c]">
                This list will show different testers for each individual perfume. According to perfume categories.
              </p>
            </div>

            {/* ── Feature icons row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[
                { icon: "/images/home/trust/free-shipping.webp",           label: "Free Shipping",      sub: "Across Rs. 7,000+" },
                { icon: "/images/home/trust/french-ingredients-icon.webp", label: "Original French",    sub: "Perfume Oils"      },
                { icon: "/images/home/trust/high-concentration-icon.webp", label: "High Concentration", sub: "of Perfume Oils"   },
                { icon: "/images/home/new/wc-6.webp",                      label: "Sample Gift",        sub: "in Every Box"      },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 border border-[#d1ae6d] bg-[#2e2e2e] px-1 py-3 text-center"
                >
                  <span className="relative w-8 h-8 sm:w-9 sm:h-9">
                    <Image src={b.icon} alt={b.label} fill className="object-contain" sizes="36px" />
                  </span>
                  <p className="text-[9px] sm:text-[10px] font-semibold leading-tight text-[#efe7db]">{b.label}</p>
                  <p className="text-[8px] sm:text-[9px] leading-tight text-[#cbbfae]">{b.sub}</p>
                </div>
              ))}
                </div>

            {/* ── ADD TO CART ── */}
                <button
                  disabled={!inStock || !selectedVariant}
              onClick={handleAddToCart}
              className={`mb-3 w-full border py-4 text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
                inStock && selectedVariant
                  ? "border-[#c9a25a] bg-[#c9a25a] text-[#211d18] hover:border-[#e3c489] hover:bg-[#e3c489]"
                  : "cursor-not-allowed border-[#5a564f] bg-[#45443f] text-[#8b8377]"
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
              className={`mb-3 w-full border py-4 text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
                inStock && selectedVariant
                  ? "border-[#c9a25a] text-[#c9a25a] hover:bg-[#c9a25a] hover:text-[#211d18]"
                  : "cursor-not-allowed border-[#5a564f] text-[#8b8377]"
              }`}
                >
                  Buy Now
                </button>

            {/* ── Wishlist ── */}
            <button
              onClick={() =>
                toggleItem({
                  slug: perfume.slug,
                  name: perfume.name,
                  brand: brandLabel,
                  image: perfume.images?.main || "",
                  price: getLowestPrice(perfume.editions) || 0,
                })
              }
              aria-pressed={isInWishlist(perfume.slug)}
              className={`mb-5 flex w-full items-center justify-center gap-2 border py-3 text-sm font-semibold tracking-[0.04em] transition-colors ${
                isInWishlist(perfume.slug)
                  ? "border-[#e07a72] bg-[#e07a72]/12 text-[#e8877f]"
                  : "border-[#c9a25a]/50 text-[#cbbfae] hover:border-[#e3c489] hover:text-[#e3c489]"
              }`}
            >
              <svg
                className={`w-4 h-4 ${isInWishlist(perfume.slug) ? "fill-[#e07a72] text-[#e07a72]" : ""}`}
                fill={isInWishlist(perfume.slug) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isInWishlist(perfume.slug) ? "In Your Wishlist" : "Add to Wishlist"}
            </button>

            {/* ── Short description ── */}
            {perfume.description && (
              <div className="mb-4 text-sm leading-relaxed text-[#cbbfae]">
                <p>
                  {descExpanded ? perfume.description : shortDesc}
                  {needsReadMore && !descExpanded && "…"}
                </p>
                {needsReadMore && (
                  <button
                    onClick={() => setDescExpanded((o) => !o)}
                    className="mt-1 text-xs text-[#c9a25a] underline underline-offset-2 transition-colors hover:text-[#e3c489]"
                  >
                    {descExpanded ? "Show Less" : "Read More..."}
                  </button>
                )}
              </div>
            )}

            {/* ── Accordion Rows → open side modal ── */}
            <div className="border-b border-[#c9a25a]/25">

              <AccordionRow
                title="Fragrance Profile"
                onClick={() =>
                  openModal("Fragrance Profile", <NotesPyramid notes={perfume.notes} />)
                }
              />

              <AccordionRow
                title={`Why Choose ${perfume.name}?`}
                onClick={() =>
                  openModal(`Why Choose ${perfume.name}?`, (
                    <div className="space-y-3 text-sm leading-relaxed text-[#211d18]">
                      <p>Our impression perfumes are crafted using <strong>100% original French perfume oils</strong>, ensuring the highest scent fidelity to the original fragrance.</p>
                      <p>With a concentration of up to <strong>35% perfume oil</strong>, our formulas last 12–16 hours on skin — outperforming most department-store alternatives.</p>
                      <p>Each bottle is filled with <strong>50ml</strong> of premium fragrance, providing incredible value compared to branded counterparts that cost 10× more.</p>
                    </div>
                  ))
                }
              />

              <AccordionRow
                title="Disclaimer"
                onClick={() =>
                  openModal("Disclaimer", (
                    <p className="text-sm leading-relaxed text-[#211d18]">
                      French Aromas perfumes are original impression fragrances inspired by luxury brands. We are not affiliated with or endorsed by the original brands. Our products are independently crafted using premium French perfume oils to recreate a similar scent experience.
                    </p>
                  ))
                }
              />

              <AccordionRow
                title="Shipping & Returns"
                onClick={() =>
                  openModal("Shipping & Returns", (
                    <div className="space-y-3 text-sm leading-relaxed text-[#211d18]">
                      <p><strong>Free Shipping</strong> on orders above PKR 7,000.</p>
                      <p><strong>Standard Delivery:</strong> 3–5 working days across Pakistan.</p>
                      <p><strong>Returns:</strong> We accept returns within 7 days of delivery if the product is unopened and in its original packaging.</p>
                    </div>
                  ))
                }
              />

              <AccordionRow
                title="FAQs"
                onClick={() =>
                  openModal("Frequently Asked Questions", (
                    <div className="space-y-4 text-sm leading-relaxed text-[#211d18]">
                      <div>
                        <p className="mb-1 font-semibold text-[#211d18]">Q: Why is the impression perfume so affordable compared to the original?</p>
                        <p>Our perfumes skip expensive branding & marketing costs. You only pay for the fragrance itself — crafted with the same French perfume oils.</p>
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-[#211d18]">Q: Is it also cheaper than other locally made impressions?</p>
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
      <div className={`bg-[#d4c6ab] ${SECTION_Y}`}>
        <div className={GUTTER}>
          <SectionHeading
            tone="light"
            title="Original vs. Impression"
            subtitle="Experience the Essence — Choose What Fits You Best."
            className="mb-10 md:mb-12"
          />

          <div className="flex items-center gap-4 sm:gap-6">

            {/* ── Left: Original perfume image ── */}
            <div className="hidden sm:flex flex-col items-center justify-center flex-shrink-0 w-[180px]">
              <div className="relative w-[160px] h-[220px]">
                {perfume.images?.main ? (
                  <Image
                    src={perfume.images.main}
                    alt="Original perfume"
                    fill
                    className="object-cover border border-[#d1ae6d]"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border border-[#d1ae6d] bg-[#c6b596]">
                    <span className="px-2 text-center text-[10px] text-[#211d18]/70 break-words">{brandLabel || "Original"}</span>
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute -top-3 -left-3 border border-[#c9a25a] bg-[#211d18] px-2 py-1 text-center font-bold leading-tight text-[#e3c489]"
                  style={{ fontSize: "9px", minWidth: "64px" }}>
                  <div>Price in PKR :</div>
                  <div className="text-[11px]">Rs. {brandLabel || "—"}</div>
                </div>
              </div>
            </div>

            {/* ── Center: Comparison table ── */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse border border-[#211d18]/25">
                <thead>
                  <tr>
                    <th className="bg-[#211d18] px-2 py-4 text-center text-sm sm:text-base font-bold text-[#c9a25a] sm:px-4">
                      Original Perfume
                    </th>
                    <th className="bg-[#373838] px-2 py-4 text-center text-sm sm:text-base font-bold text-[#d4c6ab] sm:px-4">
                      Features
                    </th>
                    <th className="bg-[#211d18] px-2 py-4 text-center text-sm sm:text-base font-bold text-[#c9a25a] sm:px-4">
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
                    <tr key={i} className={i % 2 === 0 ? "bg-[#ded2bc]" : "bg-[#d4c6ab]"}>
                      <td className="border border-[#211d18]/15 px-2 py-3 text-center text-sm sm:text-base text-[#211d18] sm:px-4 break-words">{orig}</td>
                      <td className="border border-[#211d18]/15 bg-[#c9bb9e] px-2 py-3 text-center text-sm sm:text-base font-bold text-[#211d18] sm:px-4">{feat}</td>
                      <td className="border border-[#211d18]/15 px-2 py-3 text-center text-sm sm:text-base text-[#211d18] sm:px-4 break-words">{imp}</td>
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
                    className="object-cover border border-[#d1ae6d]"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border border-[#d1ae6d] bg-[#c6b596]">
                    <span className="px-2 text-center text-[10px] text-[#211d18]/70 break-words">{perfume.name}</span>
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute -top-3 -right-3 border border-[#c9a25a] bg-[#211d18] px-2 py-1 text-center font-bold leading-tight text-[#e3c489]"
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
        <div className={`${GUTTER} ${SECTION_Y}`}>
          <SectionHeading
            tone="dark"
            title="You May Also Like..."
            subtitle="Which perfumes according to scent notes"
            className="mb-10 md:mb-12"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedPerfumes.map((rp) => {
                  const rpPrice = getLowestPrice(rp.editions);
              const rpBrand = (Array.isArray(rp.brands) && rp.brands.length > 0)
                ? rp.brands[0]
                    : rp.brand || "";
                  return (
                    <div
                      key={rp._id}
                  className={`group flex flex-col bg-[#2e2e2e] ${CARD_FRAME} ${GOLD_GLOW_WITH_BORDER}`}
                    >
                      <Link
                        href={`/products/${rp.slug}`}
                        className="relative block w-full aspect-square overflow-hidden bg-[#373838]"
                      >
                    {rp.images?.main ? (
                          <Image
                        src={rp.images.main}
                            alt={rp.name}
                            fill
                            className={`object-cover ${PHOTO_HOVER}`}
                        sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#373838]">
                        <svg className="w-10 h-10 text-[#c9a25a]/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-3">
                        {rpBrand && (
                          <p className="mb-0.5 text-[10px] text-[#a99d8c] line-clamp-1">{rpBrand}</p>
                        )}
                        <Link href={`/products/${rp.slug}`}>
                          <h3 className="mb-2 text-xs sm:text-sm font-semibold text-[#cbbfae] line-clamp-2 transition-colors hover:text-[#e3c489]">
                            {rp.name}
                          </h3>
                        </Link>
                        <div className="flex-1" />
                        {rpPrice !== null && (
                          <p className="mb-2 text-sm font-bold text-[#e3c489]">
                            PKR {rpPrice.toLocaleString()}
                          </p>
                        )}
                        <Link
                          href={`/products/${rp.slug}`}
                          className="block border border-[#c9a25a] py-1.5 text-center text-xs font-semibold text-[#c9a25a] transition-colors hover:bg-[#c9a25a] hover:text-[#211d18]"
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


      {/* ═══════════════════════════════════════════════════════
           FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════════════════ */}
      <div className={`bg-[#d4c6ab] ${SECTION_Y}`}>
        <div className={GUTTER}>
          <div className="max-w-3xl mx-auto">
          <SectionHeading
            tone="light"
            title="Frequently Asked Questions (FAQs)"
            subtitle="Common questions about our impression perfumes"
            className="mb-10 md:mb-12"
          />

          <div className="border border-[#211d18]/25">
            {[
              {
                q: "Why is the impression perfume so affordable compared to the original?",
                a: "Our perfumes skip expensive branding & marketing costs. You only pay for the fragrance itself — crafted with the same French perfume oils used by the originals.",
              },
              {
                q: "Is it also cheaper than other locally made impressions?",
                a: "Yes — we source directly from French oil suppliers and operate with minimal overhead, making our pricing the most competitive without sacrificing quality.",
              },
              {
                q: "How long does the fragrance last?",
                a: "With up to 35% perfume oil concentration, our fragrances typically last 12-16 hours on skin — outperforming most department store alternatives.",
              },
              {
                q: "Can I return the perfume if I don't like it?",
                a: "We accept returns within 7 days of delivery if the product is unopened and in its original packaging. See our return policy for details.",
              },
              {
                q: "Do you offer free shipping?",
                a: "Yes! Free shipping on all orders above PKR 7,000. Standard delivery takes 3-5 working days across Pakistan.",
              },
            ].map((faq, i) => (
              <div key={i} className={i > 0 ? "border-t border-[#211d18]/20" : ""}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#211d18]/5"
                >
                  <span className="text-sm font-semibold text-[#211d18]">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 shrink-0 text-[#211d18]/60 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-[#211d18]/85 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
           CUSTOMER REVIEWS
          ═══════════════════════════════════════════════════════ */}
      <div className={`${GUTTER} ${SECTION_Y}`}>
        <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-block">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal text-[#c9a25a]">
                Customer Reviews
              </h2>
              <Rule color="#c9a25a" className="mt-2" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-[#e3c489] fill-[#e3c489]" : "text-[#5c554b] fill-[#5c554b]"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[#a99d8c]">
                {avgRating > 0 ? `${avgRating} out of 5` : "No reviews yet"} ({reviewTotal} review{reviewTotal !== 1 ? "s" : ""})
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            aria-expanded={showReviewForm}
            className="shrink-0 self-start border border-[#c9a25a] px-5 py-2.5 text-sm font-semibold tracking-[0.04em] text-[#c9a25a] transition-colors hover:bg-[#c9a25a] hover:text-[#211d18] sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-8 border border-[#c9a25a]/40 bg-[#2e2e2e] p-5 animate-fadeIn">
            <h3 className="mb-4 font-[family-name:var(--font-playfair)] italic text-lg font-normal text-[#c9a25a]">Write Your Review</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border border-[#c9a25a]/40 bg-[#373838] px-4 py-2.5 text-sm text-[#cbbfae] placeholder-[#8b8377] transition-colors focus:outline-none focus:border-[#e3c489]"
              />
              <input
                type="text"
                placeholder="Review Title (optional)"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-[#c9a25a]/40 bg-[#373838] px-4 py-2.5 text-sm text-[#cbbfae] placeholder-[#8b8377] transition-colors focus:outline-none focus:border-[#e3c489]"
              />
            </div>
            <div className="mb-4">
              <p className="mb-2 text-[13px] font-semibold text-[#a99d8c]">Rating *</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    aria-label={`Rate ${star} out of 5`}
                    aria-pressed={reviewForm.rating === star}
                    className="p-1 focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 transition-colors ${star <= reviewForm.rating ? "text-[#e3c489] fill-[#e3c489]" : "text-[#5c554b] fill-[#5c554b]"}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Share your experience with this fragrance..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
              className="w-full border border-[#c9a25a]/40 bg-[#373838] px-4 py-2.5 text-sm text-[#cbbfae] placeholder-[#8b8377] transition-colors focus:outline-none focus:border-[#e3c489] mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowReviewForm(false)} className="border border-[#c9a25a]/50 px-5 py-2.5 text-sm font-medium text-[#cbbfae] transition-colors hover:border-[#e3c489] hover:text-[#e3c489]">
                Cancel
              </button>
              <button type="submit" disabled={reviewSubmitting || !reviewForm.name} className="border border-[#c9a25a] bg-[#c9a25a] px-5 py-2.5 text-sm font-semibold text-[#211d18] transition-colors hover:border-[#e3c489] hover:bg-[#e3c489] disabled:cursor-not-allowed disabled:border-[#5a564f] disabled:bg-[#45443f] disabled:text-[#8b8377]">
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-[#c9a25a]/30 bg-[#2e2e2e] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#e3c489] break-words">{review.name}</span>
                      {review.isVerifiedPurchase && (
                        <span className="rounded-full border border-[#7cc47f]/60 bg-[#7cc47f]/12 px-2 py-0.5 text-[10px] font-semibold text-[#7cc47f]">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "text-[#e3c489] fill-[#e3c489]" : "text-[#5c554b] fill-[#5c554b]"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[#a99d8c]">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                {review.title && <p className="mb-1 text-sm font-semibold text-[#cbbfae] break-words">{review.title}</p>}
                {review.body && <p className="text-sm leading-relaxed text-[#cbbfae] break-words">{review.body}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#c9a25a]/40 py-10 text-center">
            <p className="text-sm text-[#a99d8c]">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
        </div>
      </div>

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
