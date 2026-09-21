import Link from "next/link";
import { viewAllClass } from "@/lib/design";

// The rule that sits under a heading: solid through the middle, fading out at
// both ends. Width comes from its wrapper, so putting it inside an inline-block
// alongside the title sizes it to the title rather than the container.
export function Rule({ color = "#c9a25a", className = "" }) {
  return (
    <div
      className={`h-[2px] md:h-[3px] w-full ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg,transparent 0%,${color} 25%,${color} 75%,transparent 100%)`,
      }}
    />
  );
}

function Arrow() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
    </svg>
  );
}

/**
 * A section's title block: Playfair italic heading, the rule sized to it, an
 * optional subtitle, and an optional outlined link pinned top-right on desktop.
 *
 * `tone` selects the ground the block sits on — "dark" for #373838 sections,
 * "light" for #d4c6ab ones.
 */
export default function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View All",
  tone = "dark",
  className = "",
}) {
  const heading = tone === "dark" ? "#c9a25a" : "#211d18";
  const sub = tone === "dark" ? "text-[#d2c1ac]" : "text-[#211d18]";

  return (
    <div className={`relative ${className}`}>
      <div className="text-center">
        <div className="inline-block">
          <h2
            className="font-[family-name:var(--font-playfair)] italic text-2xl md:text-4xl font-normal"
            style={{ color: heading }}
          >
            {title}
          </h2>
          <Rule color={heading} className="mt-2" />
        </div>
        {subtitle && (
          <p className={`mt-5 font-[family-name:var(--font-playfair)] text-base md:text-xl leading-snug ${sub}`}>
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <div className="mt-6 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-0">
          <Link href={href} className={viewAllClass(tone)}>
            {linkLabel}
            <Arrow />
          </Link>
        </div>
      )}
    </div>
  );
}
