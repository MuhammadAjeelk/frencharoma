"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRs } from "@/lib/pricing";
import { genderMeta, genderTextClass } from "@/lib/gender";
import ProductCard from "@/components/ProductCard";
import UniversalModal from "@/components/UniversalModal";
import QuickAddModal from "@/components/QuickAddModal";
import { Rule } from "@/components/ui/SectionHeading";
import { GUTTER } from "@/lib/design";
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
      className="group/slot relative w-14 h-14 sm:w-16 sm:h-16 border border-dashed border-[#c9a25a]/45 bg-[#211d18] flex items-center justify-center shrink-0 transition-[box-shadow,border-color,background-color] duration-300 hover:border-[#e3c489] hover:bg-[#2a251d] hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_10px_26px_rgba(209,174,109,0.22)]"
    >
      <span className="text-sm sm:text-base font-bold text-[#a99d8c]/70 transition-opacity duration-150 group-hover/slot:opacity-0">
        {index + 1}
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-[#e3c489] opacity-0 transition-opacity duration-150 group-hover/slot:opacity-100">
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
  // A sealed box frames its testers in solid gold; the box still being filled
  // keeps a quieter ring so the two read apart at a glance.
  const border = tone === "done" ? "border-[#d1ae6d]" : "border-[#c9a25a]/60";
  return (
    <button
      type="button"
      onClick={onScrollTo}
      onMouseEnter={(e) => onPreview?.(perfume, e.currentTarget)}
      onMouseLeave={() => onPreviewEnd?.()}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-2 ${border} bg-[#211d18] group shrink-0 transition-[box-shadow,border-color] duration-300 hover:border-[#e3c489] hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_10px_26px_rgba(209,174,109,0.22)]`}
    >
      {get5mlImage(perfume) ? (
        <Image
          src={get5mlImage(perfume)}
          alt={perfume.name}
          fill
          className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
          sizes="64px"
        />
      ) : (
        <div className="w-full h-full bg-[#373838]" />
      )}
      {/* Phones have no hover, so the × stays visible below sm — otherwise a
          tester could be added on a phone and never taken back out. */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          // Removing unmounts this slot, so its onMouseLeave never fires and
          // the hover preview would be left open over nothing. Close it first.
          onPreviewEnd?.();
          onRemove();
        }}
        className="absolute top-0 right-0 w-5 h-5 bg-[#e0342c] hover:bg-[#c0261f] text-white flex items-center justify-center text-[13px] leading-none opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
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

  // A tester can also leave the box from its card while a slot is hovered, so
  // drop the preview whenever its perfume is no longer selected.
  useEffect(() => {
    if (preview && !selected.includes(preview._id)) setPreview(null);
  }, [selected, preview]);

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
      className="shrink-0 border-2 border-dashed border-[#c9a25a]/60 bg-[#373838] p-2.5"
    >
      <div className="flex items-center justify-between gap-3 mb-1.5 px-0.5">
        <span className="text-[13px] sm:text-sm font-bold text-[#c9a25a] whitespace-nowrap">
          Discovery Box {completeCount + 1}
        </span>
        <span className="text-[11px] sm:text-xs font-bold text-[#a99d8c] whitespace-nowrap">
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
    <div className="min-h-screen bg-[#373838]">
      {/* ── Top banner — FLAT 40% OFF + Discovery Box ────────────────────── */}
      <div className="relative bg-[#2e2e2e] text-[#efe7db] border-y-[6px] border-[#c9a25a]">
        {/* Breadcrumb overlaid so it doesn't offset the vertically-centred logo */}
        <nav className="absolute top-3.5 left-4 z-10 flex items-center gap-2 text-[11px] text-[#a99d8c]">
          <Link href="/" className="transition-colors hover:text-[#e3c489]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#cbbfae]">Discovery Box</span>
        </nav>
        <div className={`${GUTTER} pt-10 pb-6 md:py-7`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            {/* Left — FLAT 40% OFF logo (Century Schoolbook) */}
            <div
              className="shrink-0 flex items-stretch text-[#c9a25a] -translate-y-4 md:-translate-y-8"
              style={{
                fontFamily:
                  '"Century Schoolbook", "Century Schoolbook L", "TeX Gyre Schola", Georgia, "Times New Roman", serif',
              }}
            >
              <span className="self-center text-2xl md:text-4xl tracking-[0.08em] text-[#efe7db]">
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
                  className="text-3xl md:text-5xl tracking-[0.06em] text-[#efe7db] leading-none"
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
              <div className="inline-block">
                <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl md:text-5xl font-normal text-[#c9a25a]">
                  Discovery Box
                </h1>
                <Rule className="mt-2" />
              </div>
              <p className="font-[family-name:var(--font-playfair)] italic text-[#d2c1ac] mt-3 text-base md:text-xl leading-snug">
                Discover Fragrances Before You Buy ...
              </p>
              <div className="flex items-center gap-2 my-3 justify-center">
                <span className="h-px w-14 md:w-28 bg-[#c9a25a]/50" />
                <span className="w-2 h-2 rotate-45 bg-[#c9a25a]" />
                <span className="h-px w-14 md:w-28 bg-[#c9a25a]/50" />
              </div>
              <p className="text-[#cbbfae] text-xs md:text-sm max-w-2xl leading-relaxed mx-auto">
                Build your discovery box with any{" "}
                <strong className="font-semibold text-[#c9a25a]">5 fragrances</strong> in 5ml
                bottles and enjoy a{" "}
                <strong className="font-semibold text-[#c9a25a]">Flat 40% OFF</strong> —
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
        className="sticky top-0 z-30 border-b-2 border-[#c9a25a] bg-[#2e2e2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3.5 sm:py-4">
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
                  className="w-8 h-12 sm:w-10 sm:h-14 fill-[#a99d8c] group-hover/cap:fill-[#e3c489] transition-colors duration-200"
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
                    className="shrink-0 border-2 border-[#d1ae6d] bg-[#211d18] p-2.5 shadow-[0_0_0_1px_rgba(209,174,109,0.25)]"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5 px-0.5">
                      <span className="text-[13px] sm:text-sm font-bold text-[#e3c489] whitespace-nowrap">
                        Discovery Box {bi + 1} ✓
                      </span>
                      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-[#a99d8c] strike-diagonal">
                          {formatRs(orig)}
                        </span>
                        <span className="text-[12px] sm:text-[13px] font-bold text-[#7dd18d]">
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
                  className="w-8 h-12 sm:w-10 sm:h-14 fill-[#a99d8c] group-hover/cap:fill-[#e3c489] transition-colors duration-200"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 3 L18 12 L8 21 Z" />
                </svg>
              </button>
            )}

            {/* Empty / partial — helper text beside the box (no box ready yet) */}
            {completeCount === 0 && (
              <p className="w-full lg:flex-1 mx-auto text-base sm:text-lg text-[#cbbfae] leading-relaxed text-center">
                To fill your Discovery Box — Choose any{" "}
                <strong className="font-semibold text-[#c9a25a]">5 fragrances</strong>
                <br />
                from the collection below.
              </p>
            )}

            {/* Ready — inline summary + Add Ready Box to Cart */}
            {completeCount >= 1 && (
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col gap-2 border border-[#d1ae6d] bg-[#211d18] px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[#efe7db] font-bold text-[13px] sm:text-sm whitespace-nowrap">
                    {completeCount} Discovery Box{completeCount > 1 ? "es" : ""}{" "}
                    {completeCount > 1 ? "are" : "is"} Ready.
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-[#a99d8c] strike-diagonal">
                      {formatRs(totalOriginal)}
                    </span>
                    <span className="text-[#c9a25a] text-base sm:text-lg font-bold">
                      {formatRs(totalDiscounted)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7dd18d] font-semibold whitespace-nowrap">
                    You Saved {formatRs(savings)} (Flat {DISCOUNT_PERCENT}% Off)
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 border border-[#c9a25a] bg-[#c9a25a] text-[#211d18] font-bold text-[12px] sm:text-[13px] px-4 py-2.5 transition-colors hover:bg-[#e3c489] hover:border-[#e3c489]"
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
            <p className="mt-2.5 text-center text-[13px] font-bold text-[#e3c489] animate-fadeIn">
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
                className="pointer-events-none absolute top-full mt-2 z-40 -translate-x-1/2 w-[330px] max-w-[92vw] flex items-center gap-2.5 border border-[#d1ae6d] bg-[#211d18] p-2.5 shadow-[0_0_0_1px_rgba(209,174,109,0.35),0_18px_44px_rgba(0,0,0,0.55)] animate-fadeIn"
              >
                <div className="relative w-[72px] h-[72px] overflow-hidden border border-[#d1ae6d]/50 bg-[#373838] shrink-0">
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
                {/* Names run long — the popover is width-capped and the copy
                    clamps rather than pushing past the sticky bar. */}
                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-[13px] font-bold text-[#efe7db] leading-tight line-clamp-2">
                    {preview.name}
                    {gm && <span className={genderTextClass(preview.gender, "dark")}> - ({gm.label})</span>}
                  </p>
                  {preview.impressionName && (
                    <p className="text-[11px] text-[#a99d8c] mt-0.5 truncate">
                      Impression of:{" "}
                      <span className="font-bold text-[#e8dccb]">
                        {preview.impressionName}
                      </span>
                    </p>
                  )}
                  {brandLabel && (
                    <p className="text-[11px] text-[#a99d8c] mt-0.5 truncate">
                      Brand:{" "}
                      <span className="font-bold text-[#e8dccb]">
                        {brandLabel}
                      </span>
                    </p>
                  )}
                  {price != null && (
                    <p className="mt-1 flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#a99d8c] strike-diagonal whitespace-nowrap">
                        {formatRs(price)}
                      </span>
                      <span className="text-[13px] font-bold text-[#7dd18d] whitespace-nowrap">
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
        className={`${GUTTER} py-10 md:py-12 scroll-mt-24`}
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
                      ? "border-[#c9a25a] bg-[#c9a25a] text-[#211d18]"
                      : "border-[#c9a25a]/40 text-[#4a4540] hover:border-[#c9a25a] hover:text-[#211d18]"
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

        {/* Loading skeleton — 12 so the last row is full at 2, 3 and 4 columns */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="border border-[#d1ae6d]/40 bg-[#2e2e2e] overflow-hidden animate-pulse"
              >
                <div className="aspect-[6.818/7.5] bg-[#3f3f3f]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#3f3f3f] w-3/4" />
                  <div className="h-3 bg-[#3f3f3f] w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && perfumes.length === 0 && (
          <div className="border border-[#d1ae6d] bg-[#2e2e2e] px-6 py-16 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-xl md:text-2xl font-normal text-[#c9a25a] mb-2">
              No testers available yet
            </h3>
            <p className="text-sm text-[#a99d8c] mb-6">
              We&apos;re stocking up. Check back soon!
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-flex items-center justify-center border border-[#c9a25a] bg-[#c9a25a] px-6 py-3 text-sm font-semibold text-[#211d18] transition-colors hover:bg-[#e3c489] hover:border-[#e3c489]"
            >
              Browse All Perfumes
            </Link>
          </div>
        )}

        {/* No search/filter matches */}
        {!loading && perfumes.length > 0 && visiblePerfumes.length === 0 && (
          <div className="border border-[#d1ae6d] bg-[#2e2e2e] px-6 py-14 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-lg md:text-xl font-normal text-[#c9a25a] mb-1">
              No testers match your search
            </h3>
            <p className="text-sm text-[#a99d8c] mb-5">
              Try a different name, brand or filter.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center border border-[#c9a25a] bg-[#c9a25a] px-6 py-2.5 text-sm font-semibold text-[#211d18] transition-colors hover:bg-[#e3c489] hover:border-[#e3c489]"
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
        {/* UniversalModal's panel is still the old white sheet (Phase 5), so
            this content is styled for a light ground. */}
        <div className="space-y-4">
          <p className="text-sm text-[#4a4540] leading-relaxed">
            You have{" "}
            <strong className="text-[#211d18]">
              {completeCount} complete box{completeCount > 1 ? "es" : ""}
            </strong>{" "}
            ready ({DISCOUNT_PERCENT}% off), plus a box that&apos;s only{" "}
            <strong className="text-[#211d18]">
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
              className="w-full py-3 border border-[#c9a25a] bg-[#c9a25a] text-[#211d18] font-semibold text-sm transition-colors hover:bg-[#e3c489] hover:border-[#e3c489]"
            >
              Checkout {completeCount} completed box
              {completeCount > 1 ? "es" : ""} →
            </button>
            <button
              onClick={() => setCheckoutPromptOpen(false)}
              className="w-full py-3 border border-[#211d18]/30 text-[#211d18] font-semibold text-sm transition-colors hover:bg-[#211d18] hover:text-[#d4c6ab] hover:border-[#211d18]"
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
