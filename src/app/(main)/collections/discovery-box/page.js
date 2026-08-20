"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRs } from "@/lib/pricing";
import { genderMeta } from "@/lib/gender";
import ProductCard from "@/components/ProductCard";
import UniversalModal from "@/components/UniversalModal";
import QuickAddModal from "@/components/QuickAddModal";
import PerfumeFilterBar, {
  SortSelect,
  matchesSeasonGroup,
} from "@/components/PerfumeFilterBar";

const BOX_SIZE = 5;
const DISCOUNT_PERCENT = 40;
const MAX_TESTERS = 30; // safety cap — up to 6 boxes

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

const discounted = (n) => Math.round(n * (1 - DISCOUNT_PERCENT / 100));

function get5mlVariant(editions) {
  for (const ed of editions || []) {
    if (!ed.enabled) continue;
    for (const v of ed.variants || []) {
      if (v.isActive && v.size === "5ml") return { edition: ed, variant: v };
    }
  }
  return null;
}

function getPerfumePrice(p) {
  const match = get5mlVariant(p?.editions);
  return match?.variant?.price ?? null;
}

// The Discovery Box sells the 5ml tester, so show that variant's own photo
// when it has one; otherwise fall back to the product's default image.
function get5mlImage(p) {
  const match = get5mlVariant(p?.editions);
  return match?.variant?.images?.main || p?.images?.main || "";
}

// A tester is only pickable while its 5ml variant has stock.
function is5mlInStock(p) {
  const match = get5mlVariant(p?.editions);
  return (match?.variant?.stock ?? 0) > 0;
}

// Brand/name/impression text match for the filter bar's search box.
function matchesQuery(p, q) {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const hay = [p.name, p.impressionName, p.brand, ...(p.brands || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(term);
}

function matchesEdition(p, edition) {
  if (edition === "all") return true;
  return (p.editions || []).some((e) => e.key === edition && e.enabled);
}

function matchesSpecialOffer(p) {
  if (p.isSpecialOffer) return true;
  return (p.tags || []).some((t) => /special\s*-?\s*offer/i.test(t));
}

// Client-side sort mirroring the API; every sort ties-break by Globally Admired.
function sortTesters(list, sort) {
  const price = (p) => {
    const m = get5mlVariant(p.editions);
    return m?.variant?.price ?? Infinity;
  };
  const admire = (p) => Number(p.globalAdmirePercent) || 0;
  const arr = [...list];
  const byAdmire = (a, b) => admire(b) - admire(a);
  switch (sort) {
    case "newest":
      return arr.sort(
        (a, b) => String(b._id).localeCompare(String(a._id)) || byAdmire(a, b),
      );
    case "name-asc":
      return arr.sort(
        (a, b) => (a.name || "").localeCompare(b.name || "") || byAdmire(a, b),
      );
    case "name-desc":
      return arr.sort(
        (a, b) => (b.name || "").localeCompare(a.name || "") || byAdmire(a, b),
      );
    case "price-asc":
      return arr.sort((a, b) => price(a) - price(b) || byAdmire(a, b));
    case "price-desc":
      return arr.sort((a, b) => price(b) - price(a) || byAdmire(a, b));
    case "discount-desc":
      return arr.sort(
        (a, b) =>
          (Number(b.discountPercent) || 0) - (Number(a.discountPercent) || 0) ||
          byAdmire(a, b),
      );
    default:
      return arr.sort(byAdmire); // global-admire-desc
  }
}

// ── Empty slot — hover shows "Empty", click hints where to pick ─────────────
function EmptySlot({ index, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/slot relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-dashed border-[#d8ccb0] bg-white flex items-center justify-center shrink-0 transition-all duration-200 hover:border-[#b8964e] hover:bg-[#fbf6ea] hover:scale-105"
    >
      <span className="text-sm sm:text-base font-bold text-gray-300 transition-opacity duration-150 group-hover/slot:opacity-0">
        {index + 1}
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-[#b8964e] opacity-0 transition-opacity duration-150 group-hover/slot:opacity-100">
        Empty
      </span>
    </button>
  );
}

// ── Filled slot — click scrolls to card, hover shows a bigger preview, × removes
function FilledSlot({
  perfume,
  onRemove,
  onScrollTo,
  onPreview,
  onPreviewEnd,
  tone = "active",
}) {
  const border = tone === "done" ? "border-green-400" : "border-[#b8964e]";
  return (
    <button
      type="button"
      onClick={onScrollTo}
      onMouseEnter={(e) => onPreview?.(perfume, e.currentTarget)}
      onMouseLeave={() => onPreviewEnd?.()}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 ${border} group shrink-0 transition-transform duration-200 hover:scale-105`}
    >
      {get5mlImage(perfume) ? (
        <Image
          src={get5mlImage(perfume)}
          alt={perfume.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
      <span
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0 right-0 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-bl flex items-center justify-center text-[13px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        ×
      </span>
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DiscoveryBoxPage() {
  const { addItem } = useCart();

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // flat list of picked IDs, grouped into boxes of 5
  const [addedToCart, setAddedToCart] = useState(false);
  const [checkoutPromptOpen, setCheckoutPromptOpen] = useState(false);
  const [modalPerfume, setModalPerfume] = useState(null); // Quick View target
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState(null); // filled-slot hover preview
  const [previewLeft, setPreviewLeft] = useState(0); // centered under hovered slot
  const [hint, setHint] = useState(false); // "select fragrances" message
  const hintTimer = useRef(null);
  const rowRef = useRef(null);
  const barRef = useRef(null);

  const showHint = useCallback(() => {
    setHint(true);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 2600);
    document
      .getElementById("disc-collection")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Position the hover preview directly below the hovered slot, centred.
  const handlePreview = useCallback((perfume, el) => {
    if (barRef.current && el) {
      const bar = barRef.current.getBoundingClientRect();
      const slot = el.getBoundingClientRect();
      const center = slot.left - bar.left + slot.width / 2;
      // Keep the (~330px wide) preview inside the bar.
      setPreviewLeft(Math.min(Math.max(center, 170), bar.width - 170));
    }
    setPreview(perfume);
  }, []);

  // One click moves exactly one complete box (forward/backward).
  const scrollRow = (dir) => {
    const row = rowRef.current;
    if (!row) return;
    const box = row.querySelector("[data-box]");
    const step = box ? box.offsetWidth + 12 /* gap-3 */ : 300;
    row.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // ── Filters (same set as Shop All) ───────────────────────────────────────
  const [gender, setGender] = useState("all");
  const [edition, setEdition] = useState("all");
  const [season, setSeason] = useState("all");
  const [scentFamily, setScentFamily] = useState("");
  const [featured, setFeatured] = useState("all");
  const [brand, setBrand] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sort, setSort] = useState("global-admire-desc");

  const DEFAULT_SORT = "global-admire-desc";
  const hasActiveFilters =
    gender !== "all" ||
    edition !== "all" ||
    season !== "all" ||
    scentFamily !== "" ||
    featured !== "all" ||
    onlyInStock ||
    brand.trim() !== "";
  const hasControlChanges = hasActiveFilters || sort !== DEFAULT_SORT;

  const resetFilters = () => {
    setGender("all");
    setEdition("all");
    setSeason("all");
    setScentFamily("");
    setFeatured("all");
    setBrand("");
    setOnlyInStock(false);
    setSort(DEFAULT_SORT);
  };

  const matchesFeatured = (p) => {
    if (featured === "bestSeller") return !!p.isBestSeller;
    if (featured === "specialOffer") return matchesSpecialOffer(p);
    if (featured === "signature") return !!p.isSignature;
    if (featured === "newArrival") return !!p.isNewArrival;
    return true;
  };

  // Filtering only changes what's visible — `perfumes` stays the source of
  // truth for slots and selection, so a picked tester survives a filter change.
  const visiblePerfumes = useMemo(() => {
    const filtered = perfumes.filter(
      (p) =>
        matchesQuery(p, brand) &&
        (gender === "all" || p.gender === gender) &&
        matchesEdition(p, edition) &&
        matchesSeasonGroup(p.tags, season) &&
        (!scentFamily ||
          (p.scentFamily || "").toLowerCase() === scentFamily.toLowerCase()) &&
        matchesFeatured(p) &&
        (!onlyInStock || is5mlInStock(p)),
    );
    return sortTesters(filtered, sort);
  }, [
    perfumes,
    brand,
    gender,
    edition,
    season,
    scentFamily,
    featured,
    onlyInStock,
    sort,
  ]);

  // Fetch available perfumes
  useEffect(() => {
    fetch("/api/perfumes?limit=200&sort=global-admire-desc")
      .then((r) => r.json())
      .then((data) => {
        const all = data.perfumes || [];
        // Only perfumes that actually offer a 5ml tester belong in the box.
        const testers = all.filter((p) => get5mlVariant(p.editions));
        testers.sort(
          (a, b) => Number(is5mlInStock(b)) - Number(is5mlInStock(a)),
        );
        setPerfumes(testers);
        setSelected((prev) =>
          prev.filter((id) => testers.some((t) => t._id === id)),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Restore the in-progress selection from a previous visit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fa_discovery_selected");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr))
          setSelected(arr.filter((x) => typeof x === "string"));
      }
    } catch {}
  }, []);

  // Persist the selection so a refresh keeps the boxes being built
  useEffect(() => {
    try {
      localStorage.setItem("fa_discovery_selected", JSON.stringify(selected));
    } catch {}
  }, [selected]);

  const perfumeById = useCallback(
    (id) => perfumes.find((p) => p._id === id) || null,
    [perfumes],
  );

  // ── Selection logic — pick/unpick; picks auto-group into boxes of 5 ───────
  const handlePerfumeClick = useCallback(
    (perfumeId) => {
      setSelected((prev) => {
        if (prev.includes(perfumeId))
          return prev.filter((id) => id !== perfumeId);
        const perfume = perfumes.find((p) => p._id === perfumeId);
        if (perfume && !is5mlInStock(perfume)) return prev; // sold out — not pickable
        if (prev.length >= MAX_TESTERS) return prev; // safety cap
        return [...prev, perfumeId];
      });
    },
    [perfumes],
  );

  const removeTester = useCallback((perfumeId) => {
    setSelected((prev) => prev.filter((id) => id !== perfumeId));
  }, []);

  const scrollToPerfume = useCallback((perfumeId) => {
    const el = document.getElementById(`disc-card-${perfumeId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ── Boxes (groups of 5) ──────────────────────────────────────────────────
  const packs = chunk(selected, BOX_SIZE);
  const completePacks = packs.filter((pk) => pk.length === BOX_SIZE);
  const completeCount = completePacks.length;
  const boxedIds = completePacks.flat();
  const activePackIds =
    selected.length % BOX_SIZE === 0 ? [] : packs[packs.length - 1] || [];
  const activeCount = activePackIds.length;
  const hasPartial = activeCount > 0;
  const canCheckout = completeCount >= 1;

  // Per-box price helpers
  const packOriginal = (ids) =>
    ids.reduce((sum, id) => sum + (getPerfumePrice(perfumeById(id)) || 0), 0);

  // ── Checkout — only complete boxes are charged (40% off) ──────────────────
  const commitBoxes = () => {
    const stamp = Date.now();
    completePacks.forEach((pack, bi) => {
      const boxId = `${stamp}-${bi}`;
      for (const id of pack) {
        const p = perfumeById(id);
        if (!p) continue;
        const match = get5mlVariant(p.editions);
        const basePrice = match?.variant?.price ?? getPerfumePrice(p) ?? 0;
        addItem({
          perfumeId: p._id,
          slug: p.slug,
          name: p.name,
          image: get5mlImage(p),
          edition: match?.edition?.key || "classic",
          size: "5ml",
          price: discounted(basePrice),
          originalPrice: basePrice,
          discountPercent: DISCOUNT_PERCENT,
          gender: p.gender || "",
          impressionName: p.impressionName || "",
          isDiscoveryBox: true,
          boxId,
        });
      }
    });
    setSelected(activePackIds); // keep the half-filled box for later
    setCheckoutPromptOpen(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    if (hasPartial) {
      setCheckoutPromptOpen(true);
      return;
    }
    commitBoxes();
  };

  // ── Aggregate pricing (complete boxes only) ──────────────────────────────
  const totalOriginal = packOriginal(boxedIds);
  const totalDiscounted = discounted(totalOriginal);
  const savings = totalOriginal - totalDiscounted;

  // Active box slots (the box currently being filled)
  const slots = Array.from({ length: BOX_SIZE }, (_, i) => {
    const id = activePackIds[i];
    return id ? perfumeById(id) : null;
  });

  // Reusable active/new box (always the far-left box)
  const activeBox = (
    <div
      data-box
      className="shrink-0 rounded-xl border-2 border-dashed border-[#b8964e]/60 bg-[#fbf8f1] p-2.5"
    >
      <div className="flex items-center justify-between gap-3 mb-1.5 px-0.5">
        <span className="text-[13px] sm:text-sm font-bold text-[#b8964e] whitespace-nowrap">
          Discovery Box {completeCount + 1}
        </span>
        <span className="text-[11px] sm:text-xs font-bold text-gray-400 whitespace-nowrap">
          {activeCount}/{BOX_SIZE}
        </span>
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        {slots.map((perfume, i) =>
          perfume ? (
            <FilledSlot
              key={i}
              perfume={perfume}
              onRemove={() => removeTester(perfume._id)}
              onScrollTo={() => scrollToPerfume(perfume._id)}
              onPreview={handlePreview}
              onPreviewEnd={() => setPreview(null)}
            />
          ) : (
            <EmptySlot key={i} index={i} onClick={showHint} />
          ),
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ── Top banner — FLAT 40% OFF + Discovery Box ────────────────────── */}
      <div className="relative bg-[#1a1a2e] text-white border-y-[6px] border-[#c9a25a]">
        {/* Breadcrumb overlaid so it doesn't offset the vertically-centred logo */}
        <nav className="absolute top-3.5 left-4 z-10 flex items-center gap-2 text-[11px] text-white/40">
          <Link href="/" className="hover:text-white/70">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/60">Discovery Box</span>
        </nav>
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-6 md:py-7">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            {/* Left — FLAT 40% OFF logo (Century Schoolbook) */}
            <div
              className="shrink-0 flex items-stretch text-[#c9a25a] -translate-y-4 md:-translate-y-8"
              style={{
                fontFamily:
                  '"Century Schoolbook", "Century Schoolbook L", "TeX Gyre Schola", Georgia, "Times New Roman", serif',
              }}
            >
              <span className="self-center text-2xl md:text-4xl tracking-[0.08em] text-white/90">
                FLAT
              </span>
              <span className="text-[7.5rem] md:text-[13rem] font-normal leading-[0.72] -ml-1 md:-ml-2">
                {DISCOUNT_PERCENT}
              </span>
              <span className="self-stretch flex flex-col justify-between items-start -ml-1 -my-1 md:-my-3">
                <span
                  className="text-5xl md:text-8xl font-bold leading-none"
                  style={{ transform: "translateY(0.35em)" }}
                >
                  %
                </span>
                <span
                  className="text-3xl md:text-5xl tracking-[0.06em] text-white/90 leading-none"
                  style={{ transform: "translateY(0.6em)" }}
                >
                  OFF
                </span>
              </span>
            </div>

            {/* Gold vertical divider */}
            <div className="hidden md:block self-stretch w-px bg-[#c9a25a]/50" />

            {/* Right — title, subtitle, description */}
            <div className="max-w-2xl text-center">
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-white inline-block border-b-2 border-[#c9a25a] pb-1">
                Discovery Box
              </h1>
              <p
                className="text-[#c9a25a] font-semibold mt-2.5 text-sm md:text-lg italic"
                style={{ fontFamily: 'Calibri, "Segoe UI", Candara, Optima, "Trebuchet MS", sans-serif' }}
              >
                Discover Fragrances Before You Buy ...
              </p>
              <div className="flex items-center gap-2 my-3 justify-center">
                <span className="h-px w-14 md:w-28 bg-[#c9a25a]/50" />
                <span className="w-2 h-2 rotate-45 bg-[#c9a25a]" />
                <span className="h-px w-14 md:w-28 bg-[#c9a25a]/50" />
              </div>
              <p className="text-white/70 text-xs md:text-sm max-w-2xl leading-relaxed mx-auto">
                Build your discovery box with any{" "}
                <strong className="text-[#c9a25a]">5 fragrances</strong> in 5ml
                bottles and enjoy a{" "}
                <strong className="text-[#c9a25a]">Flat 40% OFF</strong> —
                Explore, compare, and discover your favorites—More you explore,
                more you love our Fragrances.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky box builder ───────────────────────────────────────────── */}
      <div
        ref={barRef}
        className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3.5 sm:py-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Left arrow — only once 2+ boxes are ready */}
            {completeCount >= 2 && (
              <button
                type="button"
                onClick={() => scrollRow(-1)}
                aria-label="Previous box"
                className="group/cap shrink-0 flex items-center justify-center px-1"
              >
                <svg
                  className="w-8 h-12 sm:w-10 sm:h-14 fill-[#5f5f4f] group-hover/cap:fill-[#b8964e] transition-colors duration-200"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M16 3 L6 12 L16 21 Z" />
                </svg>
              </button>
            )}

            {/* Far-left = new box, ready boxes move to the right */}
            <div
              ref={rowRef}
              className="flex items-stretch gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-thin py-1"
            >
              {activeBox}

              {completePacks.map((pack, bi) => {
                const orig = packOriginal(pack);
                return (
                  <div
                    key={bi}
                    data-box
                    className="shrink-0 rounded-xl border-2 border-green-300 bg-green-50/70 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5 px-0.5">
                      <span className="text-[13px] sm:text-sm font-bold text-green-700 whitespace-nowrap">
                        Discovery Box {bi + 1} ✓
                      </span>
                      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-[#1f1a16] strike-diagonal">
                          {formatRs(orig)}
                        </span>
                        <span className="text-[12px] sm:text-[13px] font-bold text-green-700">
                          {formatRs(discounted(orig))}
                        </span>
                      </span>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {pack.map((id) => {
                        const p = perfumeById(id);
                        return p ? (
                          <FilledSlot
                            key={id}
                            perfume={p}
                            tone="done"
                            onRemove={() => removeTester(id)}
                            onScrollTo={() => scrollToPerfume(id)}
                            onPreview={handlePreview}
                            onPreviewEnd={() => setPreview(null)}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right arrow — only once 2+ boxes are ready */}
            {completeCount >= 2 && (
              <button
                type="button"
                onClick={() => scrollRow(1)}
                aria-label="Next box"
                className="group/cap shrink-0 flex items-center justify-center px-1"
              >
                <svg
                  className="w-8 h-12 sm:w-10 sm:h-14 fill-[#5f5f4f] group-hover/cap:fill-[#b8964e] transition-colors duration-200"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 3 L18 12 L8 21 Z" />
                </svg>
              </button>
            )}

            {/* Empty / partial — helper text beside the box (no box ready yet) */}
            {completeCount === 0 && (
              <p className="w-full lg:flex-1 mx-auto text-base sm:text-lg text-[#4a4540] leading-relaxed text-center">
                To fill your Discovery Box — Choose any{" "}
                <strong className="text-[#b8964e]">5 fragrances</strong>
                <br />
                from the collection below.
              </p>
            )}

            {/* Ready — inline summary + Add Ready Box to Cart */}
            {completeCount >= 1 && (
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col gap-2 rounded-xl border border-green-200 bg-green-50/70 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[#1a1a2e] font-extrabold text-[13px] sm:text-sm whitespace-nowrap">
                    {completeCount} Discovery Box{completeCount > 1 ? "es" : ""}{" "}
                    {completeCount > 1 ? "are" : "is"} Ready.
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-[#1f1a16] strike-diagonal">
                      {formatRs(totalOriginal)}
                    </span>
                    <span className="text-[#b8964e] text-base sm:text-lg font-extrabold">
                      {formatRs(totalDiscounted)}
                    </span>
                  </div>
                  <p className="text-[11px] text-green-600 font-semibold whitespace-nowrap">
                    You Saved {formatRs(savings)} (Flat {DISCOUNT_PERCENT}% Off)
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a2e] text-white font-bold text-[12px] sm:text-[13px] px-4 py-2.5 rounded-xl hover:bg-[#b8964e] transition-colors"
                >
                  {addedToCart
                    ? "✓ Added!"
                    : `Add Ready Box${completeCount > 1 ? "es" : ""} to Cart`}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5-5 5M6 12h12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Click-an-empty-slot hint — shown close to the box */}
          {hint && (
            <p className="mt-2.5 text-center text-[13px] font-bold text-[#b8964e] animate-fadeIn">
              Select Fragrances from the collection below ↓
            </p>
          )}
        </div>

        {/* Filled-slot hover preview — same layout as the card, centred below the slot */}
        {preview &&
          (() => {
            const gm = genderMeta(preview.gender);
            const brandLabel = preview.brands?.[0] || preview.brand;
            const price = getPerfumePrice(preview);
            return (
              <div
                style={{ left: previewLeft }}
                className="pointer-events-none absolute top-full mt-2 z-40 -translate-x-1/2 max-w-[92vw] flex items-center gap-2.5 rounded-xl border border-[#e8e4df] bg-white p-2.5 shadow-2xl animate-fadeIn"
              >
                <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-[#f7f5f2] shrink-0">
                  {get5mlImage(preview) ? (
                    <Image
                      src={get5mlImage(preview)}
                      alt={preview.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-[13px] font-bold text-[#1f1a16] leading-tight whitespace-nowrap">
                    {preview.name}
                    {gm && <span className={gm.text}> - ({gm.label})</span>}
                  </p>
                  {preview.impressionName && (
                    <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">
                      Impression of:{" "}
                      <span className="font-bold text-[#1f1a16]">
                        {preview.impressionName}
                      </span>
                    </p>
                  )}
                  {brandLabel && (
                    <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">
                      Brand:{" "}
                      <span className="font-bold text-[#1f1a16]">
                        {brandLabel}
                      </span>
                    </p>
                  )}
                  {price != null && (
                    <p className="mt-1 flex items-center gap-2">
                      <span className="text-[13px] font-bold text-red-500 strike-diagonal whitespace-nowrap">
                        {formatRs(price)}
                      </span>
                      <span className="text-[13px] font-bold text-green-600 whitespace-nowrap">
                        {formatRs(discounted(price))}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div
        id="disc-collection"
        className="max-w-7xl mx-auto px-4 py-8 scroll-mt-24"
      >
        {/* ── Filters (same component as Shop All) ── */}
        {!loading && perfumes.length > 0 && (
          <div className="mb-6">
            <PerfumeFilterBar
              gender={gender}
              setGender={setGender}
              edition={edition}
              setEdition={setEdition}
              season={season}
              setSeason={setSeason}
              featured={featured}
              setFeatured={setFeatured}
              brand={brand}
              setBrand={setBrand}
              scentFamily={scentFamily}
              setScentFamily={setScentFamily}
              onReset={resetFilters}
              hasControlChanges={hasControlChanges}
              extraControls={
                <button
                  onClick={() => setOnlyInStock((v) => !v)}
                  aria-pressed={onlyInStock}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold border rounded-full transition-all duration-200 select-none hover:underline underline-offset-4 decoration-1 ${
                    onlyInStock
                      ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                      : "border-[#e8e4df] bg-white text-[#4a4540] hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
                  }`}
                >
                  In stock only
                </button>
              }
              extraChips={
                onlyInStock
                  ? [
                      {
                        key: "inStock",
                        label: "In stock only",
                        clear: () => setOnlyInStock(false),
                      },
                    ]
                  : []
              }
            />
            <div className="flex justify-end mt-3">
              <SortSelect sort={sort} setSort={setSort} />
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-[6.818/7.5] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && perfumes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No testers available yet
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              We&apos;re stocking up. Check back soon!
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-[#1a1a2e] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Browse All Perfumes
            </Link>
          </div>
        )}

        {/* No search/filter matches */}
        {!loading && perfumes.length > 0 && visiblePerfumes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              No testers match your search
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Try a different name, brand or filter.
            </p>
            <button
              onClick={resetFilters}
              className="inline-block bg-[#1a1a2e] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Perfume cards */}
        {!loading && visiblePerfumes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePerfumes.map((p) => (
              <div
                key={p._id}
                id={`disc-card-${p._id}`}
                className="scroll-mt-40"
              >
                <ProductCard
                  name={p.name}
                  brand={p.brands?.[0] || p.brand}
                  image={get5mlImage(p)}
                  impressionName={p.impressionName}
                  href={`/products/${p.slug}`}
                  slug={p.slug}
                  perfumeId={p._id}
                  gender={p.gender}
                  tags={p.tags}
                  globalAdmirePercent={p.globalAdmirePercent}
                  discountPercent={DISCOUNT_PERCENT}
                  isBestSeller={Boolean(p.isBestSeller)}
                  onQuickView={() => {
                    setModalPerfume(p);
                    setModalOpen(true);
                  }}
                  boxMode
                  boxPrice={getPerfumePrice(p)}
                  boxSelected={selected.includes(p._id)}
                  boxSelectionIndex={selected.indexOf(p._id)}
                  boxSoldOut={!is5mlInStock(p)}
                  onAddToBox={() => handlePerfumeClick(p._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Checkout prompt when a box is half-filled ─────────────────────── */}
      <UniversalModal
        isOpen={checkoutPromptOpen}
        onClose={() => setCheckoutPromptOpen(false)}
        heading="Finish your last box?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4a4540] leading-relaxed">
            You have{" "}
            <strong className="text-[#1f1a16]">
              {completeCount} complete box{completeCount > 1 ? "es" : ""}
            </strong>{" "}
            ready ({DISCOUNT_PERCENT}% off), plus a box that&apos;s only{" "}
            <strong className="text-[#1f1a16]">
              {activeCount}/{BOX_SIZE}
            </strong>{" "}
            filled.
          </p>
          <p className="text-sm text-[#4a4540] leading-relaxed">
            Check out the completed box{completeCount > 1 ? "es" : ""} now, or
            keep building to finish the last one? The {activeCount} tester
            {activeCount > 1 ? "s" : ""} in the unfinished box will stay in your
            builder.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={commitBoxes}
              className="w-full py-3 rounded-lg bg-[#1a1a2e] text-white font-semibold text-sm hover:bg-[#b8964e] transition-colors"
            >
              Checkout {completeCount} completed box
              {completeCount > 1 ? "es" : ""} →
            </button>
            <button
              onClick={() => setCheckoutPromptOpen(false)}
              className="w-full py-3 rounded-lg border border-[#e8e4df] text-[#1f1a16] font-semibold text-sm hover:bg-[#faf8f5] transition-colors"
            >
              Keep building — finish this box
            </button>
          </div>
        </div>
      </UniversalModal>

      {/* ── Quick View Modal (box-aware: 5ml + Add to Box) ────────────────── */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        heading={modalPerfume?.name || ""}
      >
        {modalPerfume && (
          <QuickAddModal
            key={modalPerfume._id}
            perfume={modalPerfume}
            onClose={() => setModalOpen(false)}
            boxMode
            boxImage={get5mlImage(modalPerfume)}
            boxPrice={getPerfumePrice(modalPerfume)}
            boxDiscountPercent={DISCOUNT_PERCENT}
            boxSelected={selected.includes(modalPerfume._id)}
            boxSoldOut={!is5mlInStock(modalPerfume)}
            onAddToBox={() => handlePerfumeClick(modalPerfume._id)}
          />
        )}
      </UniversalModal>
    </div>
  );
}
