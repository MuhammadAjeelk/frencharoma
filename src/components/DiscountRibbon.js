// Diagonal corner-ribbon BAND (top-left) — a neat strip crossing the corner
// with a small triangle of the card peeking at the very tip. Big bold number +
// small stacked "% OFF". Color tiers: gold (≤29%), orange (30–39%), red (≥40%).
//
// `compact` is for the 2-up phone grid, where the card is ~173px wide and the
// full-size ribbon covers a third of the artwork. Everything scales by one
// factor so the band stays proportioned.
// `color` and `scale` let the homepage card use the mockup's smaller yellow band;
// `unit` (a CSS length per design pixel, e.g. in cqw) makes it scale with the card.
export default function DiscountRibbon({ percent, className = "", compact = false, color: colorOverride, scale, unit }) {
  const p = Number(percent) || 0;
  if (p <= 0) return null;

  const color = colorOverride || (p >= 30 ? "var(--fa-dark)" : "var(--fa-gold-ink)");
  const k = scale || (compact ? 0.62 : 1);
  const neg = (n) => (unit ? `calc(${-(n * k).toFixed(2)} * ${unit})` : `-${Math.round(n * k)}px`);
  const px = (n) => (unit ? `calc(${+(n * k).toFixed(2)} * ${unit})` : `${Math.round(n * k)}px`);

  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 z-20 overflow-hidden ${className}`}
      style={{ width: px(104), height: px(104) }}
      aria-hidden="true"
    >
      <div
        className="absolute flex items-center justify-center text-white shadow-[0_2px_6px_rgba(0,0,0,0.24)]"
        style={{
          background: color,
          width: px(160),
          top: px(8),
          left: neg(48),
          transform: "rotate(-45deg)",
          paddingTop: px(3),
          paddingBottom: px(3),
          fontFamily:
            'Calibri, "Segoe UI", Candara, Optima, "Trebuchet MS", sans-serif',
        }}
      >
        <span
          className="flex items-stretch justify-center leading-none"
          style={{ transform: `translateX(${neg(5)})` }}
        >
          <span
            className="font-bold leading-[0.85] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
            style={{ fontSize: px(32) }}
          >
            {p}
          </span>
          <span
            className="flex flex-col justify-between items-start"
            style={{ marginLeft: px(3), paddingTop: "1px", paddingBottom: "1px" }}
          >
            <span className="font-bold leading-none" style={{ fontSize: px(13) }}>%</span>
            <span className="font-bold tracking-wide leading-none" style={{ fontSize: px(10) }}>OFF</span>
          </span>
        </span>
      </div>
    </div>
  );
}
