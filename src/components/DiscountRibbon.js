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
          paddingTop: "5px",
          paddingBottom: "5px",
          fontFamily:
            'Calibri, "Segoe UI", Candara, Optima, "Trebuchet MS", sans-serif',
        }}
      >
        <span
          className="flex items-center justify-center leading-none"
          style={{ transform: "translateX(-5px)" }}
        >
          <span className="text-[26px] font-bold leading-[0.9] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
            {p}
          </span>
          <span className="flex flex-col items-start ml-[1px] leading-none">
            <span className="text-[13px] font-bold leading-none">%</span>
            <span className="text-[8px] font-bold tracking-wide leading-none mt-[1px]">
              OFF
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
