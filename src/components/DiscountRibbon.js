// Diagonal corner-ribbon BAND (top-left) — a neat strip crossing the corner
// with a small triangle of the card peeking at the very tip. Big bold number +
// small stacked "% OFF". Color tiers: gold (≤29%), orange (30–39%), red (≥40%).
export default function DiscountRibbon({ percent, className = "" }) {
  const p = Number(percent) || 0;
  if (p <= 0) return null;

  const color = p >= 40 ? "#ee3b3b" : p >= 30 ? "#f0872f" : "#f7bf2e";

  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 z-20 w-[138px] h-[138px] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,0,0,0.28)]"
        style={{
          background: color,
          width: "200px",
          top: "26px",
          left: "-52px",
          transform: "rotate(-45deg)",
          paddingTop: "6px",
          paddingBottom: "6px",
        }}
      >
        <span className="flex items-start leading-none">
          <span className="text-[25px] sm:text-[29px] font-black leading-[0.82] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
            {p}
          </span>
          <span className="flex flex-col items-start ml-0.5 mt-[2px]">
            <span className="text-[12px] sm:text-[13px] font-black leading-none">%</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wide leading-none mt-[1px]">OFF</span>
          </span>
        </span>
      </div>
    </div>
  );
}
