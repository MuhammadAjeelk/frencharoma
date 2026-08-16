// Diagonal corner-ribbon discount badge (top-left). Color tiers match the
// brand set: gold (≤29%), orange (30–39%), red (≥40%). Shows the real percent.
export default function DiscountRibbon({ percent, className = "" }) {
  const p = Number(percent) || 0;
  if (p <= 0) return null;

  const color = p >= 40 ? "#ee3b3b" : p >= 30 ? "#f0872f" : "#f7bf2e";

  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 z-20 w-[70px] h-[70px] sm:w-[82px] sm:h-[82px] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Filled corner triangle */}
      <div
        className="absolute inset-0 shadow-[1px_1px_4px_rgba(0,0,0,0.18)]"
        style={{ background: color, clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Text along the diagonal, centered on the triangle's centroid */}
      <span
        className="absolute whitespace-nowrap font-extrabold text-white leading-none flex items-baseline"
        style={{ top: "33.3%", left: "33.3%", transform: "translate(-50%,-50%) rotate(-45deg)" }}
      >
        <span className="text-[15px] sm:text-[18px]">{p}</span>
        <span className="text-[8px] sm:text-[9px] ml-0.5 tracking-wide">% OFF</span>
      </span>
    </div>
  );
}
