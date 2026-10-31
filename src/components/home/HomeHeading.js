import Link from "next/link";

// The homepage section title, drawn differently per device in the mockups:
// - md and up: a tracked Times eyebrow over a Times title flanked by short
//   gold rules, centred, with an underlined link at the right edge of the
//   content below it.
// - phones: the title alone, left-aligned in Times, with a bold underlined
//   "View All" on the right.
// Only one of the two is displayed, so screen readers hear one heading.
//
// Desktop geometry, from the mockup: a 16px eyebrow, 6px, then a 45px title
// (so 67px in all). `desktopLink.top` places the link's 22px line box; the
// mockup sets "View All" 12px under the title's baseline and "More" 23px.

function Arrow() {
  return (
    <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h16m0 0l-5.5-5.5M19.5 12l-5.5 5.5" />
    </svg>
  );
}

export default function HomeHeading({
  eyebrow,
  title,
  href,
  desktopLink,
  desktop = true,
  className = "",
}) {
  return (
    <div className={className}>
      {/* Phones */}
      <div className="md:hidden flex items-baseline justify-between gap-3 px-[3.17vw]">
        <h2 className="font-[family-name:var(--font-tinos)] font-normal text-[6.02vw] leading-none tracking-[0.03em] text-[var(--fa-home-text-deep)]">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="shrink-0 font-[Arial,Helvetica,sans-serif] font-bold text-[3.44vw] leading-none text-[var(--fa-home-link)] underline underline-offset-[2px] decoration-1 hover:text-[var(--fa-home-text-deep)] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {/* Desktop */}
      {desktop && (
        <div className="hidden md:block relative text-center">
          {eyebrow && (
            <p className="font-[family-name:var(--font-tinos)] text-[16px] leading-none uppercase tracking-[0.32em] pl-[0.32em] text-[var(--fa-home-text)]">
              {eyebrow}
            </p>
          )}
          <div className="mt-[6px] flex items-center justify-center gap-[37px]">
            <span className="h-[1.5px] w-[60px] bg-[var(--fa-home-rule)]" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-tinos)] font-normal text-[45px] leading-none tracking-[0.005em] text-[var(--fa-home-text)]">
              {title}
            </h2>
            <span className="h-[1.5px] w-[60px] bg-[var(--fa-home-rule)]" aria-hidden="true" />
          </div>
          {desktopLink && (
            <Link
              href={desktopLink.href}
              style={{ top: desktopLink.top }}
              className="absolute right-0 inline-flex items-center gap-[6px] font-[family-name:var(--font-tinos)] text-[22px] leading-none text-[var(--fa-home-text-deep)] underline underline-offset-[4px] decoration-1 hover:text-[var(--fa-gold-ink)] transition-colors"
            >
              {desktopLink.label}
              <Arrow />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
