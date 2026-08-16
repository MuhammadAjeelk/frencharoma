// Diagonal corner-ribbon discount badge (top-left). Color tiers match the
// brand set: gold (≤29%), orange (30–39%), red (≥40%). Big bold number with a
// small stacked "% OFF", running along the diagonal.
export default function DiscountRibbon({ percent, className = "" }) {
  const p = Number(percent) || 0;
  if (p <= 0) return null;

  const color = p >= 40 ? "#ee3b3b" : p >= 30 ? "#f0872f" : "#f7bf2e";

  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 z-20 w-[92px] h-[92px] sm:w-[108px] sm:h-[108px] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Filled corner triangle */}
      <div
        className="absolute inset-0 shadow-[1px_1px_5px_rgba(0,0,0,0.20)]"
        style={{ background: color, clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Text along the diagonal, centered on the triangle's centroid */}
      <span
        className="absolute flex items-start text-white leading-none"
        style={{ top: "33.3%", left: "33.3%", transform: "translate(-50%,-50%) rotate(-45deg)" }}
      >
        <span className="text-[30px] sm:text-[36px] font-black leading-[0.85] drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
          {p}
        </span>
        <span className="flex flex-col items-start leading-none mt-0.5 ml-0.5">
          <span className="text-[13px] sm:text-[15px] font-black">%</span>
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wide -mt-0.5">OFF</span>
        </span>
      </span>
    </div>
  );
}
