// Diagonal corner-ribbon BAND (top-left) — a neat strip crossing the corner
// with a small triangle of the card peeking at the very tip. Big bold number +
// small stacked "% OFF". Color tiers: gold (≤29%), orange (30–39%), red (≥40%).
export default function DiscountRibbon({ percent, className = "" }) {
  const p = Number(percent) || 0;
  if (p <= 0) return null;

  const color = p >= 30 ? "#ee3b3b" : "#f7bf2e";

  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 z-20 w-[104px] h-[104px] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute flex items-center justify-center text-white shadow-[0_2px_6px_rgba(0,0,0,0.24)]"
        style={{
          background: color,
          width: "160px",
          top: "8px",
          left: "-48px",
          transform: "rotate(-45deg)",
          paddingTop: "4px",
          paddingBottom: "4px",
        }}
      >
        <span className="flex items-start leading-none">
          <span className="text-[24px] font-black leading-[0.82] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
            {p}
          </span>
          <span className="flex flex-col items-start ml-0.5 mt-[1px]">
            <span className="text-[9px] sm:text-[10px] font-black leading-none">
              %
            </span>
            <span className="text-[7px] sm:text-[8px] font-extrabold tracking-wide leading-none mt-[1px]">
              OFF
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
